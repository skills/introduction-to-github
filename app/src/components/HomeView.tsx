import { useMemo, useRef, useState } from 'react';
import { downloadText, readFileAsText } from '../lib/download';
import { buildExport, exportFileName, parseImport } from '../lib/exchange';
import { loadAllBundles } from '../lib/repository';
import { isStandalone } from '../lib/pwa';
import { useApp } from '../state/hooks';
import type { SessionSummary } from '../lib/types';
import { Icon } from './Icon';
import { Button, EmptyState, IconButton } from './primitives';
import { useInstallPrompt } from './InstallDialog';

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface HomeViewProps {
  onOpenSettings: () => void;
  onOpenInstall: () => void;
}

export function HomeView({ onOpenSettings, onOpenInstall }: HomeViewProps) {
  const {
    summaries,
    summariesLoading,
    createSession,
    removeSession,
    renameSession,
    navigate,
    pushToast,
    importBundles,
    theme,
    resolvedTheme,
    setTheme,
    storageError,
  } = useApp();

  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { available: installAvailable } = useInstallPrompt();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return summaries;
    return summaries.filter(
      (row) =>
        row.title.toLowerCase().includes(needle) || row.topic.toLowerCase().includes(needle),
    );
  }, [summaries, query]);

  const start = async () => {
    const text = topic.trim();
    // The question the user typed becomes the brainstorm's name. The separate
    // "central topic" field stays empty so the workspace header never shows the
    // same sentence twice; it is there for a longer framing if they want one.
    const id = await createSession({ title: text ? text.slice(0, 120) : 'Untitled brainstorm' });
    if (id) {
      setTopic('');
      navigate({ name: 'session', id });
    }
  };

  const exportAll = async () => {
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
  };

  const importFile = async (file: File) => {
    try {
      const bundles = parseImport(await readFileAsText(file));
      const count = await importBundles(bundles);
      pushToast({ message: `Imported ${count} brainstorm(s).`, tone: 'neutral' });
    } catch (error) {
      pushToast({ message: (error as Error).message, tone: 'danger' });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <main className="home" id="main">
      <div className="home__inner">
        <header className="home__head">
          <span className="brand">
            <span className="brand__mark">
              <Icon name="sparkle" size={19} filled />
            </span>
            Sparkboard
          </span>
          <span className="spacer" />
          <IconButton
            icon={resolvedTheme === 'dark' ? 'sun' : 'moon'}
            label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme !== 'system'}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          />
          {!isStandalone() ? (
            <IconButton icon="install" label="Install Sparkboard" onClick={onOpenInstall} />
          ) : null}
          <IconButton icon="settings" label="Settings" onClick={onOpenSettings} />
        </header>

        {storageError ? (
          <div className="banner banner--warning" role="alert">
            <Icon name="info" />
            <span className="banner__text">{storageError}</span>
          </div>
        ) : null}

        <section className="home__hero">
          <h1>What are you thinking about?</h1>
          <p>
            Start with a question, a problem or a goal. Sparkboard keeps every idea on this device,
            saves as you type, and works with no connection at all.
          </p>
          <div className="home__start">
            <input
              className="input"
              placeholder="e.g. How do we make onboarding feel effortless?"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void start();
              }}
              aria-label="Central topic for a new brainstorm"
            />
            <Button variant="primary" icon="plus" onClick={() => void start()}>
              Start brainstorming
            </Button>
          </div>
          {installAvailable ? (
            <button type="button" className="chip" onClick={onOpenInstall} style={{ alignSelf: 'flex-start' }}>
              <Icon name="install" size={14} />
              Install Sparkboard as an app
            </button>
          ) : null}
        </section>

        <section>
          <div className="section__head">
            <h2 className="section__title">
              Your brainstorms{summaries.length > 0 ? ` (${summaries.length})` : ''}
            </h2>
            <div className="row row--wrap">
              {summaries.length > 3 ? (
                <input
                  className="input"
                  style={{ minHeight: 34, width: 200 }}
                  placeholder="Search brainstorms"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search brainstorms"
                />
              ) : null}
              <Button size="sm" icon="download" onClick={() => void exportAll()}>
                Export all
              </Button>
              <Button size="sm" icon="upload" onClick={() => fileInput.current?.click()}>
                Import
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
          </div>

          {summariesLoading ? (
            <p className="muted text-sm">Loading your local data…</p>
          ) : visible.length === 0 ? (
            <EmptyState
              title={summaries.length === 0 ? 'No brainstorms yet' : 'Nothing matches that search'}
              body={
                summaries.length === 0
                  ? 'Type a question above and start capturing ideas. Everything is saved automatically on this device.'
                  : 'Try a different word, or clear the search box.'
              }
            />
          ) : (
            <ul className="session-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {visible.map((summary) => (
                <li key={summary.id}>
                  <SessionCard
                    summary={summary}
                    renaming={renaming === summary.id}
                    confirming={confirmDelete === summary.id}
                    onOpen={() => navigate({ name: 'session', id: summary.id })}
                    onStartRename={() => setRenaming(summary.id)}
                    onRename={async (title) => {
                      await renameSession(summary.id, title);
                      setRenaming(null);
                    }}
                    onCancelRename={() => setRenaming(null)}
                    onAskDelete={() => setConfirmDelete(summary.id)}
                    onCancelDelete={() => setConfirmDelete(null)}
                    onDelete={async () => {
                      await removeSession(summary.id);
                      setConfirmDelete(null);
                      pushToast({ message: 'Brainstorm deleted.', tone: 'danger' });
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="text-sm subtle">
          Local-first · no account · works offline. Data lives in this browser on this device.
        </footer>
      </div>
    </main>
  );
}

interface SessionCardProps {
  summary: SessionSummary;
  renaming: boolean;
  confirming: boolean;
  onOpen: () => void;
  onStartRename: () => void;
  onRename: (title: string) => void;
  onCancelRename: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

function SessionCard({
  summary,
  renaming,
  confirming,
  onOpen,
  onStartRename,
  onRename,
  onCancelRename,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: SessionCardProps) {
  const [draft, setDraft] = useState(summary.title);

  return (
    <article className="session-card">
      {!renaming && !confirming ? (
        <button type="button" className="session-card__open" onClick={onOpen} aria-label={`Open ${summary.title}`} />
      ) : null}

      {renaming ? (
        <input
          className="input"
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onRename(draft);
            if (event.key === 'Escape') onCancelRename();
          }}
          onBlur={() => onRename(draft)}
          aria-label="Brainstorm title"
        />
      ) : (
        <h3 className="session-card__title">{summary.title}</h3>
      )}

      {summary.topic ? <p className="session-card__topic">{summary.topic}</p> : null}

      <div className="session-card__meta">
        <span>{summary.ideaCount} idea{summary.ideaCount === 1 ? '' : 's'}</span>
        {summary.favoriteCount > 0 ? <span>★ {summary.favoriteCount}</span> : null}
        {summary.openActionCount > 0 ? <span>{summary.openActionCount} open action{summary.openActionCount === 1 ? '' : 's'}</span> : null}
        <span className="spacer" />
        <span>{relativeTime(summary.updatedAt)}</span>
      </div>

      <div className="session-card__tools">
        {confirming ? (
          <>
            <span className="text-sm muted" style={{ flex: 1 }}>
              Delete permanently?
            </span>
            <Button size="sm" onClick={onCancelDelete}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" onClick={onStartRename}>
              Rename
            </Button>
            <span className="spacer" />
            <IconButton icon="trash" label={`Delete ${summary.title}`} onClick={onAskDelete} size={16} />
          </>
        )}
      </div>
    </article>
  );
}
