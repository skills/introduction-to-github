import { describe, expect, it } from 'vitest';
import { localProvider } from '../../ai/localProvider';
import { AiError } from '../../ai/types';
import { createIdea, createSession } from '../factories';
import type { SessionBundle } from '../types';

function bundleWith(texts: string[]): SessionBundle {
  const session = createSession({ title: 'Retention', topic: 'Why do users leave in week two?' });
  return {
    session,
    ideas: texts.map((text, index) => createIdea(session.id, { text, order: index + 1 })),
    groups: [],
    actions: [],
  };
}

describe('on-device provider', () => {
  it('needs no configuration and stays local', () => {
    expect(localProvider.isConfigured()).toBe(true);
    expect(localProvider.local).toBe(true);
  });

  it('generates related prompts anchored on the topic', async () => {
    const result = await localProvider.run({ capability: 'related', bundle: bundleWith(['a']) });
    expect(result.suggestions.length).toBeGreaterThan(3);
    expect(result.suggestions.some((s) => s.text.includes('week two'))).toBe(true);
  });

  it('refuses to expand without a focused idea', async () => {
    await expect(
      localProvider.run({ capability: 'expand', bundle: bundleWith(['a']) }),
    ).rejects.toBeInstanceOf(AiError);
  });

  it('clusters ideas that share vocabulary', async () => {
    const bundle = bundleWith([
      'Improve onboarding emails for new users',
      'Onboarding checklist for new users',
      'Rewrite the pricing page',
      'Pricing page needs a comparison table',
    ]);
    const result = await localProvider.run({ capability: 'cluster', bundle });
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestions.every((s) => (s.ideaIds ?? []).length > 1)).toBe(true);
  });

  it('will not cluster a nearly empty board', async () => {
    await expect(
      localProvider.run({ capability: 'cluster', bundle: bundleWith(['only one']) }),
    ).rejects.toThrow(/at least three/i);
  });

  it('summarises with counts and recurring words', async () => {
    const result = await localProvider.run({
      capability: 'summarize',
      bundle: bundleWith(['pricing page', 'pricing tiers', 'onboarding']),
    });
    expect(result.prose).toContain('3 ideas');
    expect(result.prose).toContain('pricing');
  });

  it('builds an action plan from favourites when present', async () => {
    const bundle = bundleWith(['Talk to churned users', 'Rewrite docs']);
    bundle.ideas[0]!.favorite = true;
    const result = await localProvider.run({ capability: 'actionPlan', bundle });
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]!.kind).toBe('action');
    expect(result.suggestions[0]!.text).toMatch(/conversations/i);
  });
});
