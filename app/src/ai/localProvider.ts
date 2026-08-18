/**
 * The on-device brainstorming assistant.
 *
 * No model, no network — this is classic ideation technique (SCAMPER, inversion,
 * assumption surfacing, question ladders) applied to the user's own wording,
 * plus token-overlap clustering. It is genuinely useful on a plane, and it means
 * the "AI" surface of the app has a working implementation that never sends a
 * byte anywhere.
 */
import { createId } from '../lib/id';
import { collectTags } from '../lib/search';
import type { Idea, SessionBundle } from '../lib/types';
import type { AiProvider, AiRequest, AiResult, AiSuggestion, SuggestionKind } from './types';
import { AiError } from './types';

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','if','then','than','that','this','these','those','of','to','in',
  'on','for','with','without','by','at','from','as','is','are','was','were','be','been','being',
  'it','its','we','our','you','your','they','their','i','my','me','can','could','should','would',
  'will','shall','do','does','did','not','no','yes','more','most','less','very','just','also',
  'about','into','over','under','how','what','why','when','where','who',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function suggestion(kind: SuggestionKind, text: string, ideaIds?: string[]): AiSuggestion {
  return { id: createId('sug'), kind, text, ...(ideaIds ? { ideaIds } : {}) };
}

function focusIdea(request: AiRequest): Idea {
  const idea = request.bundle.ideas.find((i) => i.id === request.focusIdeaId);
  if (!idea) throw new AiError('Pick an idea first — this suggestion works on a single idea.');
  return idea;
}

const SCAMPER: Array<[string, (subject: string) => string]> = [
  ['Substitute', (s) => `What could replace the core of "${s}" and still reach the same goal?`],
  ['Combine', (s) => `What if "${s}" were merged with something already working elsewhere?`],
  ['Adapt', (s) => `Where has a version of "${s}" already succeeded, and what carries over?`],
  ['Magnify', (s) => `What does "${s}" look like at ten times the scale, budget or ambition?`],
  ['Minimise', (s) => `What is the smallest useful version of "${s}" you could ship this week?`],
  ['Repurpose', (s) => `Who else, outside the obvious audience, would want "${s}"?`],
  ['Eliminate', (s) => `What could you remove from "${s}" before it stops working?`],
  ['Reverse', (s) => `What happens if you invert "${s}" and do the opposite on purpose?`],
];

const CHALLENGES: Array<(subject: string, topic: string) => string> = [
  (s) => `What has to be true for "${s}" to work? List the assumption you are least sure of.`,
  (s) => `If "${s}" fails in six months, what is the most likely reason?`,
  (s, t) => `Does "${s}" actually address "${t || 'the stated goal'}", or a nearby easier problem?`,
  (s) => `Who loses if "${s}" succeeds, and can they block it?`,
  (s) => `What evidence would change your mind about "${s}"?`,
  (s) => `What is the cheapest test that could kill "${s}" this week?`,
];

const QUESTIONS: Array<(subject: string) => string> = [
  (s) => `What would make "${s}" obviously worth doing?`,
  (s) => `Which constraint on "${s}" is real, and which one did you inherit?`,
  (s) => `What is the first irreversible decision inside "${s}"?`,
  (s) => `Who has already solved a version of "${s}"?`,
  (s) => `What would you do about "${s}" with half the time?`,
  (s) => `What does "done" look like for "${s}"?`,
];

function clip(text: string, max = 72): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

function subjectFor(bundle: SessionBundle, request: AiRequest): string {
  if (request.focusIdeaId) return clip(focusIdea(request).text);
  return clip(bundle.session.topic || bundle.session.title);
}

function related(request: AiRequest): AiSuggestion[] {
  const subject = subjectFor(request.bundle, request);
  return SCAMPER.slice(0, 6).map(([lens, phrase]) =>
    suggestion('idea', `${lens}: ${phrase(subject)}`),
  );
}

function expand(request: AiRequest): AiSuggestion[] {
  const idea = focusIdea(request);
  const subject = clip(idea.text);
  return [
    suggestion('note', `Why this matters: what changes for someone if "${subject}" exists?`),
    suggestion('note', `First concrete step: the smallest thing you could do tomorrow.`),
    suggestion('note', `What it depends on: people, data, budget or permission.`),
    suggestion('note', `How you would know it worked: one number or one observation.`),
    suggestion('idea', `A stripped-down version of "${subject}" with one feature only.`),
    suggestion('idea', `A deliberately over-built version of "${subject}" — then cut back.`),
  ];
}

function alternatives(request: AiRequest): AiSuggestion[] {
  const subject = subjectFor(request.bundle, request);
  return [
    suggestion('idea', `Manual version: solve "${subject}" with people instead of systems.`),
    suggestion('idea', `Buy instead of build: who already sells a fix for "${subject}"?`),
    suggestion('idea', `Do nothing: what happens if "${subject}" is simply left alone?`),
    suggestion('idea', `Partial version: solve a tenth of "${subject}" for a tenth of the effort.`),
    suggestion('idea', `Opposite constraint: solve "${subject}" assuming unlimited time but no money.`),
  ];
}

function challenge(request: AiRequest): AiSuggestion[] {
  const subject = subjectFor(request.bundle, request);
  const topic = clip(request.bundle.session.topic);
  return CHALLENGES.map((make) => suggestion('question', make(subject, topic)));
}

function questions(request: AiRequest): AiSuggestion[] {
  const subject = subjectFor(request.bundle, request);
  return QUESTIONS.map((make) => suggestion('question', make(subject)));
}

/** Greedy agglomerative clustering on shared tags and significant words. */
function cluster(request: AiRequest): AiSuggestion[] {
  const ideas = request.bundle.ideas.filter((idea) => idea.text.trim());
  if (ideas.length < 3) {
    throw new AiError('Add at least three ideas before clustering.');
  }

  const profiles = ideas.map((idea) => ({
    idea,
    tokens: new Set([...tokenise(`${idea.text} ${idea.note}`), ...idea.tags.map((t) => `#${t}`)]),
  }));

  const similarity = (a: Set<string>, b: Set<string>) => {
    if (a.size === 0 || b.size === 0) return 0;
    let shared = 0;
    for (const token of a) if (b.has(token)) shared += 1;
    return shared / Math.min(a.size, b.size);
  };

  const clusters: Array<{ members: typeof profiles; tokens: Set<string> }> = [];
  for (const profile of profiles) {
    let best: (typeof clusters)[number] | null = null;
    let bestScore = 0;
    for (const candidate of clusters) {
      const score = similarity(profile.tokens, candidate.tokens);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    if (best && bestScore >= 0.34) {
      best.members.push(profile);
      for (const token of profile.tokens) best.tokens.add(token);
    } else {
      clusters.push({ members: [profile], tokens: new Set(profile.tokens) });
    }
  }

  const named = clusters
    .filter((c) => c.members.length > 1)
    .map((c) => {
      const counts = new Map<string, number>();
      for (const member of c.members) {
        for (const token of member.tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
      }
      const label = [...counts.entries()]
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([token]) => token.replace(/^#/, ''))
        .join(' + ');
      return suggestion(
        'group',
        label ? label.replace(/\b\w/g, (m) => m.toUpperCase()) : 'Related ideas',
        c.members.map((m) => m.idea.id),
      );
    });

  if (named.length === 0) {
    throw new AiError('These ideas do not overlap much yet — try adding tags or more detail.');
  }
  return named;
}

function summarize(request: AiRequest): AiResult {
  const { bundle } = request;
  const ideas = bundle.ideas.filter((idea) => idea.text.trim());
  if (ideas.length === 0) throw new AiError('There is nothing to summarise yet.');

  const favorites = ideas.filter((idea) => idea.favorite);
  const tags = collectTags(ideas).slice(0, 5);
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    for (const token of tokenise(`${idea.text} ${idea.note}`)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  const themes = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([token]) => token);

  const lines = [
    `${ideas.length} idea${ideas.length === 1 ? '' : 's'} across ${
      bundle.groups.length || 'no'
    } group${bundle.groups.length === 1 ? '' : 's'}.`,
    themes.length > 0 ? `Recurring words: ${themes.join(', ')}.` : null,
    tags.length > 0 ? `Most used tags: ${tags.map((t) => `#${t.tag}`).join(', ')}.` : null,
    favorites.length > 0
      ? `Marked promising: ${favorites.slice(0, 5).map((i) => clip(i.text, 40)).join('; ')}${
          favorites.length > 5 ? `, and ${favorites.length - 5} more` : ''
        }.`
      : 'Nothing is marked promising yet — star the ideas worth keeping.',
    bundle.actions.length > 0
      ? `${bundle.actions.filter((a) => !a.done).length} action${
          bundle.actions.filter((a) => !a.done).length === 1 ? '' : 's'
        } still open.`
      : null,
  ].filter(Boolean) as string[];

  return {
    providerId: localProvider.id,
    capability: 'summarize',
    suggestions: [],
    prose: lines.join('\n'),
  };
}

function actionPlan(request: AiRequest): AiSuggestion[] {
  const { bundle } = request;
  const pool = bundle.ideas.filter((idea) => idea.text.trim());
  if (pool.length === 0) throw new AiError('Add some ideas before building an action plan.');
  const chosen = pool.filter((idea) => idea.favorite);
  const source = chosen.length > 0 ? chosen : [...pool].sort((a, b) => a.order - b.order).slice(0, 6);
  return source.map((idea) =>
    suggestion('action', `Next step for "${clip(idea.text, 48)}": ` + firstStepFor(idea)),
  );
}

function firstStepFor(idea: Idea): string {
  const text = idea.text.toLowerCase();
  if (/\b(talk|ask|interview|survey|user|customer)\b/.test(text)) {
    return 'book three short conversations this week.';
  }
  if (/\b(build|prototype|design|draft|write)\b/.test(text)) {
    return 'produce a rough version in under two hours.';
  }
  if (/\b(research|compare|investigate|explore)\b/.test(text)) {
    return 'timebox one hour and write down what you find.';
  }
  if (/\b(cost|price|budget|money|revenue)\b/.test(text)) {
    return 'put a rough number on it, however wrong.';
  }
  return 'decide the single smallest thing that moves it forward.';
}

export const localProvider: AiProvider = {
  id: 'on-device',
  label: 'On-device assistant',
  description:
    'Structured ideation prompts and clustering computed entirely in your browser. Works offline; nothing leaves the device.',
  local: true,
  capabilities: [
    'related',
    'expand',
    'alternatives',
    'challenge',
    'questions',
    'cluster',
    'summarize',
    'actionPlan',
  ],
  isConfigured: () => true,
  async run(request) {
    const base = { providerId: localProvider.id, capability: request.capability };
    switch (request.capability) {
      case 'related':
        return { ...base, suggestions: related(request) };
      case 'expand':
        return { ...base, suggestions: expand(request) };
      case 'alternatives':
        return { ...base, suggestions: alternatives(request) };
      case 'challenge':
        return { ...base, suggestions: challenge(request) };
      case 'questions':
        return { ...base, suggestions: questions(request) };
      case 'cluster':
        return { ...base, suggestions: cluster(request) };
      case 'summarize':
        return summarize(request);
      case 'actionPlan':
        return { ...base, suggestions: actionPlan(request) };
      default:
        throw new AiError('That suggestion type is not available on device.');
    }
  },
};
