import { useState } from 'react';
import { CAPABILITY_LABELS, providersFor, runSuggestion } from '../ai';
import type { AiCapability, AiResult } from '../ai';
import type { Idea, SessionBundle } from '../lib/types';
import { Icon } from './Icon';
import { Button } from './primitives';

const IDEA_CAPABILITIES: AiCapability[] = ['expand', 'related', 'alternatives', 'challenge', 'questions'];
const SESSION_CAPABILITIES: AiCapability[] = ['related', 'questions', 'challenge', 'cluster', 'summarize', 'actionPlan'];

interface AiPanelProps {
  bundle: SessionBundle;
  focusIdea?: Idea;
  onAcceptIdea: (text: string) => void;
  onAcceptAction: (text: string) => void;
  onAcceptNote: (text: string) => void;
  onAcceptGroup: (name: string, ideaIds: string[]) => void;
}

/**
 * The AI surface. It talks only to `src/ai`, never to the reducer, and every
 * suggestion has to be accepted explicitly — nothing it produces is written to
 * a session behind the user's back.
 */
export function AiPanel({
  bundle,
  focusIdea,
  onAcceptIdea,
  onAcceptAction,
  onAcceptNote,
  onAcceptGroup,
}: AiPanelProps) {
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<AiCapability | null>(null);
  const [providerId, setProviderId] = useState('on-device');

  const capabilities = focusIdea ? IDEA_CAPABILITIES : SESSION_CAPABILITIES;
  const available = providersFor(capabilities[0] ?? 'related').filter(
    (provider) => provider.local || provider.isConfigured(),
  );
  const provider = available.find((p) => p.id === providerId) ?? available[0];

  const run = async (capability: AiCapability) => {
    if (!provider) return;
    setBusy(capability);
    setError(null);
    try {
      const next = await runSuggestion(provider.id, {
        capability,
        bundle,
        ...(focusIdea ? { focusIdeaId: focusIdea.id } : {}),
      });
      setResult(next);
    } catch (caught) {
      setResult(null);
      setError((caught as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="stack" style={{ gap: 'var(--sp-3)' }}>
      <div className="row">
        <span className="field__label" style={{ flex: 1 }}>
          Thinking prompts
        </span>
        {available.length > 1 ? (
          <select
            className="input"
            style={{ width: 'auto', minHeight: 30 }}
            value={provider?.id}
            onChange={(event) => setProviderId(event.target.value)}
            aria-label="Suggestion source"
          >
            {available.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="row row--wrap" style={{ gap: 'var(--sp-2)' }}>
        {capabilities.map((capability) => (
          <Button
            key={capability}
            size="sm"
            icon="sparkle"
            disabled={busy !== null}
            onClick={() => void run(capability)}
          >
            {busy === capability ? 'Thinking…' : CAPABILITY_LABELS[capability]}
          </Button>
        ))}
      </div>

      {provider && !provider.local ? (
        <p className="privacy-note">
          <Icon name="info" size={15} />
          <span>
            This sends the session text to the endpoint you configured. It leaves this device.
          </span>
        </p>
      ) : (
        <p className="privacy-note">
          <Icon name="wifiOff" size={15} />
          <span>Computed on this device. Works offline; nothing is uploaded.</span>
        </p>
      )}

      {error ? (
        <div className="banner banner--warning" role="alert">
          <span className="banner__text">{error}</span>
        </div>
      ) : null}

      {result?.prose ? (
        <div className="suggestion" style={{ whiteSpace: 'pre-wrap' }}>
          {result.prose}
        </div>
      ) : null}

      {result && result.suggestions.length > 0 ? (
        <div className="suggestions">
          {result.suggestions.map((item) => (
            <div className="suggestion" key={item.id}>
              <span className="suggestion__text">{item.text}</span>
              {item.kind === 'group' && item.ideaIds ? (
                <Button size="sm" onClick={() => onAcceptGroup(item.text, item.ideaIds ?? [])}>
                  Group {item.ideaIds.length}
                </Button>
              ) : item.kind === 'action' ? (
                <Button size="sm" onClick={() => onAcceptAction(item.text)}>
                  Add
                </Button>
              ) : item.kind === 'note' ? (
                <Button size="sm" onClick={() => onAcceptNote(item.text)}>
                  To note
                </Button>
              ) : (
                <Button size="sm" onClick={() => onAcceptIdea(item.text)}>
                  Add
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
