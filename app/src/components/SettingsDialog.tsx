import { useRef, useState } from 'react';
import { clearRemoteSettings, readRemoteSettings, writeRemoteSettings } from '../ai';
import type { RemoteSettings } from '../ai';
import { clearAllData, loadAllBundles } from '../lib/repository';
import { buildExport, exportFileName, parseImport } from '../lib/exchange';
import { downloadText, readFileAsText } from '../lib/download';
import { useApp } from '../state/hooks';
import type { ThemeMode } from '../lib/types';
import { Button, Dialog } from './primitives';

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, importBundles, refreshSummaries, pushToast, navigate } = useApp();
  const [remote, setRemote] = useState<RemoteSettings>(() => readRemoteSettings());
  const [confirmingWipe, setConfirmingWipe] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const saveRemote = (next: RemoteSettings) => {
    setRemote(next);
    try {
      writeRemoteSettings(next);
    } catch (error) {
      pushToast({ message: (error as Error).message, tone: 'danger' });
    }
  };

  const exportEverything = async () => {
    setBusy(true);
    try {
      const bundles = await loadAllBundles();
      if (bundles.length === 0) {
        pushToast({ message: 'There is nothing to export yet.', tone: 'neutral' });
        return;
      }
      downloadText(
        exportFileName('sparkboard-backup', 'json'),
        JSON.stringify(buildExport(bundles), null, 2),
        'application/json',
      );
      pushToast({ message: `Exported ${bundles.length} brainstorm(s).`, tone: 'neutral' });
    } catch (error) {
      pushToast({ message: (error as Error).message, tone: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  const importFile = async (file: File) => {
    setBusy(true);
    try {
      const bundles = parseImport(await readFileAsText(file));
      const count = await importBundles(bundles);
      pushToast({ message: `Imported ${count} brainstorm(s).`, tone: 'neutral' });
    } catch (error) {
      pushToast({ message: (error as Error).message, tone: 'danger' });
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const wipe = async () => {
    setBusy(true);
    try {
      await clearAllData();
      await refreshSummaries();
      navigate({ name: 'home' });
      pushToast({ message: 'All local data deleted.', tone: 'danger' });
      onClose();
    } catch (error) {
      pushToast({ message: (error as Error).message, tone: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Settings" onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}>
      <div className="stack">
        <section className="field">
          <span className="field__label">Appearance</span>
          <div className="segment" role="group" aria-label="Theme">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="segment__item"
                aria-pressed={theme === option.value}
                onClick={() => setTheme(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="stack">
          <div>
            <span className="field__label">Your data</span>
            <p className="text-sm muted">
              Everything lives in this browser’s IndexedDB on this device. Nothing is uploaded and
              there is no account. Export regularly if the work matters — clearing site data removes
              it permanently.
            </p>
          </div>
          <div className="row row--wrap">
            <Button icon="download" onClick={() => void exportEverything()} disabled={busy}>
              Export everything (JSON)
            </Button>
            <Button icon="upload" onClick={() => fileInput.current?.click()} disabled={busy}>
              Import from file
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
              }}
            />
          </div>
          <p className="field__hint">Imported brainstorms are added as copies — nothing is overwritten.</p>
        </section>

        <section className="stack">
          <div>
            <span className="field__label">Optional AI assistance</span>
            <p className="text-sm muted">
              The on-device assistant is always available and works offline. You can additionally
              point Sparkboard at an OpenAI-compatible endpoint of your own.
            </p>
          </div>

          <div className="privacy-note">
            Anything sent to a remote endpoint leaves this device. Sparkboard ships with no
            credentials and never contacts a model service unless you enable this and supply your
            own endpoint.
          </div>

          <label className="row" style={{ gap: 'var(--sp-3)' }}>
            <input
              type="checkbox"
              className="checkbox"
              checked={remote.enabled}
              onChange={(event) => saveRemote({ ...remote, enabled: event.target.checked })}
            />
            <span className="text-sm">Enable my own AI endpoint</span>
          </label>

          {remote.enabled ? (
            <div className="stack">
              <label className="field">
                <span className="field__label">Base URL</span>
                <input
                  className="input"
                  placeholder="https://your-endpoint.example/v1"
                  value={remote.baseUrl}
                  onChange={(event) => saveRemote({ ...remote, baseUrl: event.target.value })}
                />
                <span className="field__hint">
                  Sparkboard posts to <code>{'{base URL}'}/chat/completions</code>.
                </span>
              </label>
              <label className="field">
                <span className="field__label">Model</span>
                <input
                  className="input"
                  placeholder="model-name"
                  value={remote.model}
                  onChange={(event) => saveRemote({ ...remote, model: event.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">API key (optional)</span>
                <input
                  className="input"
                  type="password"
                  autoComplete="off"
                  placeholder="Stored in this browser only"
                  value={remote.apiKey}
                  onChange={(event) => saveRemote({ ...remote, apiKey: event.target.value })}
                />
                <span className="field__hint">
                  Kept in local storage on this device. Anyone with access to this browser profile
                  can read it.
                </span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearRemoteSettings();
                  setRemote({ enabled: false, baseUrl: '', apiKey: '', model: '' });
                }}
              >
                Forget these settings
              </Button>
            </div>
          ) : null}
        </section>

        <section className="stack">
          <span className="field__label">Danger zone</span>
          {confirmingWipe ? (
            <div className="banner banner--warning">
              <span className="banner__text">
                Delete every brainstorm stored on this device? This cannot be undone.
              </span>
              <Button size="sm" onClick={() => setConfirmingWipe(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={() => void wipe()} disabled={busy}>
                Delete all
              </Button>
            </div>
          ) : (
            <Button variant="danger" icon="trash" onClick={() => setConfirmingWipe(true)}>
              Delete all local data
            </Button>
          )}
        </section>
      </div>
    </Dialog>
  );
}
