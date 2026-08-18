import type { SessionBundle } from '../lib/types';

export type AiCapability =
  | 'related'
  | 'expand'
  | 'alternatives'
  | 'challenge'
  | 'questions'
  | 'cluster'
  | 'summarize'
  | 'actionPlan';

export const CAPABILITY_LABELS: Record<AiCapability, string> = {
  related: 'Generate related ideas',
  expand: 'Expand this idea',
  alternatives: 'Suggest alternatives',
  challenge: 'Challenge assumptions',
  questions: 'Ask useful questions',
  cluster: 'Cluster similar ideas',
  summarize: 'Summarise the session',
  actionPlan: 'Turn ideas into an action plan',
};

export interface AiRequest {
  capability: AiCapability;
  bundle: SessionBundle;
  /** Id of the idea the request is about, for single-idea capabilities. */
  focusIdeaId?: string;
  signal?: AbortSignal;
}

export type SuggestionKind = 'idea' | 'question' | 'note' | 'action' | 'group';

export interface AiSuggestion {
  id: string;
  kind: SuggestionKind;
  text: string;
  /** Populated by `cluster`: the ideas this suggestion refers to. */
  ideaIds?: string[];
}

export interface AiResult {
  providerId: string;
  capability: AiCapability;
  suggestions: AiSuggestion[];
  /** Free prose for capabilities that summarise rather than list. */
  prose?: string;
}

export interface AiProvider {
  id: string;
  label: string;
  description: string;
  /**
   * `true` means everything happens on device. Anything `false` sends the
   * session content to a third party and must be surfaced as such in the UI.
   */
  local: boolean;
  capabilities: AiCapability[];
  isConfigured: () => boolean;
  run: (request: AiRequest) => Promise<AiResult>;
}

export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiError';
  }
}
