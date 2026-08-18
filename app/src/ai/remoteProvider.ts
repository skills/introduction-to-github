/**
 * Optional remote provider.
 *
 * Disabled unless the user pastes their own endpoint and key into settings —
 * the app ships with no credentials of its own and never contacts a model
 * service by default. Anything routed through here leaves the device, which the
 * UI states plainly before the first call.
 *
 * The wire format is the widely-implemented OpenAI-compatible
 * `POST {baseUrl}/chat/completions` shape, so it works with a range of
 * self-hosted and hosted endpoints without special-casing any vendor.
 */
import { createId } from '../lib/id';
import type { SessionBundle } from '../lib/types';
import type { AiProvider, AiRequest, AiResult, AiSuggestion } from './types';
import { AiError, CAPABILITY_LABELS } from './types';

const SETTINGS_KEY = 'sparkboard.ai.remote';

export interface RemoteSettings {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const defaultRemoteSettings: RemoteSettings = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
  model: '',
};

export function readRemoteSettings(): RemoteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultRemoteSettings;
    const parsed = JSON.parse(raw) as Partial<RemoteSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : '',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' ? parsed.model : '',
    };
  } catch {
    return defaultRemoteSettings;
  }
}

export function writeRemoteSettings(settings: RemoteSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    throw new AiError('Settings could not be saved — local storage is unavailable.');
  }
}

export function clearRemoteSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* nothing to clear */
  }
}

function buildPrompt(request: AiRequest): string {
  const { bundle, capability, focusIdeaId } = request;
  const focus = bundle.ideas.find((i) => i.id === focusIdeaId);
  const context = describeSession(bundle);
  const task = CAPABILITY_LABELS[capability];
  const focusLine = focus ? `\nFocus idea: ${focus.text}${focus.note ? ` — ${focus.note}` : ''}` : '';
  const shape =
    capability === 'summarize'
      ? 'Reply with 3-6 short prose sentences. No preamble.'
      : 'Reply with one suggestion per line, no numbering, no preamble, at most 12 lines.';
  return `You are helping with a brainstorming session.\n\n${context}${focusLine}\n\nTask: ${task}.\n${shape}`;
}

function describeSession(bundle: SessionBundle): string {
  const lines = [
    `Session: ${bundle.session.title}`,
    bundle.session.topic ? `Central question: ${bundle.session.topic}` : null,
    'Ideas so far:',
    ...bundle.ideas
      .slice(0, 80)
      .map((idea) => `- ${idea.text}${idea.tags.length ? ` [${idea.tags.join(', ')}]` : ''}`),
  ].filter(Boolean);
  return lines.join('\n');
}

function parseLines(text: string): AiSuggestion[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((line) => line.length > 1)
    .slice(0, 12)
    .map((line) => ({ id: createId('sug'), kind: 'idea' as const, text: line }));
}

export const remoteProvider: AiProvider = {
  id: 'remote-endpoint',
  label: 'Your own AI endpoint',
  description:
    'Sends the session text to an OpenAI-compatible endpoint you configure. Off by default; your content leaves the device when it is used.',
  local: false,
  capabilities: [
    'related',
    'expand',
    'alternatives',
    'challenge',
    'questions',
    'summarize',
    'actionPlan',
  ],
  isConfigured() {
    const settings = readRemoteSettings();
    return settings.enabled && settings.baseUrl.trim() !== '' && settings.model.trim() !== '';
  },
  async run(request): Promise<AiResult> {
    const settings = readRemoteSettings();
    if (!remoteProvider.isConfigured()) {
      throw new AiError('No AI endpoint is configured. Add one in Settings → AI to use this.');
    }
    if (!navigator.onLine) {
      throw new AiError('You are offline. On-device suggestions still work.');
    }

    const url = `${settings.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'user', content: buildPrompt(request) }],
          temperature: 0.9,
          max_tokens: 700,
        }),
        signal: request.signal ?? null,
      });
    } catch (error) {
      throw new AiError(
        `Could not reach the configured endpoint. ${(error as Error).message ?? ''}`.trim(),
      );
    }

    if (!response.ok) {
      throw new AiError(`The endpoint replied with ${response.status} ${response.statusText}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AiError('The endpoint returned an empty response.');

    return request.capability === 'summarize'
      ? { providerId: remoteProvider.id, capability: request.capability, suggestions: [], prose: content }
      : {
          providerId: remoteProvider.id,
          capability: request.capability,
          suggestions: parseLines(content),
        };
  },
};
