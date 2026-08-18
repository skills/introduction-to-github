import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { copyToClipboard, downloadText } from '../lib/download';
import { buildExport, exportFileName } from '../lib/exchange';
import { isTypingTarget } from '../lib/hotkeys';
import { CARD_HEIGHT, CARD_WIDTH } from '../lib/layout';
import { sessionToMarkdown } from '../lib/markdown';
import { canRedo, canUndo } from '../lib/reducer';
import { collectTags, emptyFilters, filterIdeas, hasActiveFilters } from '../lib/search';
import type { IdeaFilters } from '../lib/search';
import type { Id, ViewMode } from '../lib/types';
import { useApp } from '../state/hooks';
import { ActionsBoard } from './ActionsBoard';
import { AiPanel } from './AiPanel';
import { CanvasBoard } from './CanvasBoard';
import { Icon } from './Icon';
import { Inspector } from './Inspector';
import { ListBoard } from './ListBoard';
import { ShortcutsDialog } from './ShortcutsDialog';
import { Button, Dialog, IconButton } from './primitives';

const VIEWS: Array<{ id: ViewMode; label: string; icon: 'board' | 'list' | 'checkCircle' }> = [
  { id: 'canvas', label: 'Canvas', icon: 'board' },
  { id: 'list', label: 'List', icon: 'list' },
  { id: 'actions', label: 'Actions', icon: 'checkCircle' },
];

export function WorkspaceView({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { workspace, workspaceLoading, dispatch, navigate, saveState, pushToast } = useApp();
  const [selection, setSelection] = useState<Set<Id>>(new Set());
  const [inspectorId, setInspectorId] = useState<Id | null>(null);
  const [filters, setFilters] = useState<IdeaFilters>(emptyFilters);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAssist, setShowAssist] = useState(false);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const captureRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');

  const bundle = workspace?.bundle ?? null;
  const view = bundle?.session.lastView ?? 'canvas';

  const visibleIdeas = useMemo(
    () => (bundle ? filterIdeas(bundle.ideas, filters, bundle.groups) : []),
    [bundle, filters],
  );
  const visibleIds = useMemo(() => new Set(visibleIdeas.map((idea) => idea.id)), [visibleIdeas]);
  const tags = useMemo(() => (bundle ? collectTags(bundle.ideas) : []), [bundle]);
  const filtering = hasActiveFilters(filters);

  const select = useCallback((ids: Id[], mode: 'replace' | 'toggle') => {
    setSelection((current) => {
      if (mode === 'replace') return new Set(ids);
      const next = new Set(current);
      for (const id of ids) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const setView = useCallback((next: ViewMode) => dispatch({ type: 'session/view', view: next }), [dispatch]);

  const canvasState = bundle?.session.canvas;

  /** Board coordinate the user is currently looking at, so captured ideas land
   *  on screen rather than at a fixed origin they may have panned away from. */
  const viewportAnchor = useMemo(() => {
    if (!canvasState || boardSize.width === 0) return undefined;
    return {
      x: (-canvasState.panX + boardSize.width / 2) / canvasState.zoom - CARD_WIDTH / 2,
      y: (-canvasState.panY + boardSize.height * 0.45) / canvasState.zoom - CARD_HEIGHT / 2,
    };
  }, [canvasState, boardSize]);

  const capture = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    // Inline "#tag" syntax: capture stays a single field with no mode switching.
    const inlineTags = [...text.matchAll(/#([\p{L}\p{N}_-]{1,32})/gu)].map((match) => match[1]!);
    const clean = text.replace(/#[\p{L}\p{N}_-]{1,32}/gu, '').replace(/\s+/g, ' ').trim() || text;
    dispatch({
      type: 'idea/add',
      text: clean,
      tags: inlineTags.map((tag) => tag.toLowerCase()),
      ...(viewportAnchor ? { at: viewportAnchor } : {}),
    });
    setDraft('');
  }, [draft, dispatch, viewportAnchor]);

  const onCanvasChange = useCallback(
    (canvas: Partial<NonNullable<typeof canvasState>>) => dispatch({ type: 'session/canvas', canvas }),
    [dispatch],
  );

  const onViewport = useCallback((size: { width: number; height: number }) => {
    setBoardSize((current) =>
      current.width === size.width && current.height === size.height ? current : size,
    );
  }, []);

  const selectedIds = useMemo(() => [...selection], [selection]);

  // ------------------------------------------------------------- shortcuts
  useEffect(() => {
    if (!bundle) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      const typing = isTypingTarget(event.target);

      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? 'redo' : 'undo' });
        return;
      }
      if (meta && event.key.toLowerCase() === 'a' && !typing) {
        event.preventDefault();
        select(visibleIdeas.map((idea) => idea.id), 'replace');
        return;
      }
      if (event.key === 'Escape') {
        if (inspectorId) setInspectorId(null);
        else if (filtering) setFilters(emptyFilters);
        else if (selection.size > 0) setSelection(new Set());
        return;
      }
      if (typing || meta || event.altKey) return;

      switch (event.key) {
        case 'n':
        case 'N':
          event.preventDefault();
          captureRef.current?.focus();
          break;
        case '/':
          event.preventDefault();
          searchRef.current?.focus();
          break;
        case '?':
          event.preventDefault();
          setShowShortcuts(true);
          break;
        case '1':
          setView('canvas');
          break;
        case '2':
          setView('list');
          break;
        case '3':
          setView('actions');
          break;
        case 'f':
        case 'F':
          if (selectedIds.length > 0) dispatch({ type: 'idea/toggleFavorite', ids: selectedIds });
          break;
        case 'd':
        case 'D':
          if (selectedIds.length > 0) dispatch({ type: 'idea/duplicate', ids: selectedIds });
          break;
        case 'g':
        case 'G':
          if (selectedIds.length > 0) {
            dispatch({ type: 'group/add', name: `Group ${bundle.groups.length + 1}`, ideaIds: selectedIds });
          }
          break;
        case 'a':
        case 'A':
          if (selectedIds.length > 0) dispatch({ type: 'action/fromIdeas', ideaIds: selectedIds });
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            event.preventDefault();
            dispatch({ type: 'idea/delete', ids: selectedIds });
            setSelection(new Set());
            setInspectorId(null);
          }
          break;
        case 'Enter':
          if (selectedIds.length === 1 && selectedIds[0]) setInspectorId(selectedIds[0]);
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown': {
          if (visibleIdeas.length === 0) break;
          event.preventDefault();
          const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
          const currentIndex = selectedIds[0]
            ? visibleIdeas.findIndex((idea) => idea.id === selectedIds[0])
            : -1;
          const nextIndex =
            currentIndex === -1
              ? 0
              : (currentIndex + (forward ? 1 : -1) + visibleIdeas.length) % visibleIdeas.length;
          const next = visibleIdeas[nextIndex];
          if (next) select([next.id], 'replace');
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bundle, dispatch, filtering, inspectorId, select, selectedIds, selection.size, setView, visibleIdeas]);

  // Ideas can be deleted while the panel is open.
  useEffect(() => {
    if (inspectorId && bundle && !bundle.ideas.some((idea) => idea.id === inspectorId)) {
      setInspectorId(null);
    }
  }, [bundle, inspectorId]);

  if (workspaceLoading || !bundle || !workspace) {
    return (
      <main className="workspace" id="main">
        <p className="muted" style={{ padding: 'var(--sp-6)' }}>
          Opening your brainstorm…
        </p>
      </main>
    );
  }

  const inspected = bundle.ideas.find((idea) => idea.id === inspectorId) ?? null;
  const favoriteCount = bundle.ideas.filter((idea) => idea.favorite).length;

  const exportJson = () =>
    downloadText(
      exportFileName(bundle.session.title, 'json'),
      JSON.stringify(buildExport([bundle]), null, 2),
      'application/json',
    );

  const exportMarkdown = () =>
    downloadText(exportFileName(bundle.session.title, 'md'), sessionToMarkdown(bundle), 'text/markdown');

  return (
    <main className="workspace" id="main">
      <header className="topbar">
        <IconButton icon="arrowLeft" label="Back to all brainstorms" onClick={() => navigate({ name: 'home' })} />
        <div className="topbar__identity">
          <input
            className="inline-input topbar__title"
            value={bundle.session.title}
            onChange={(event) => dispatch({ type: 'session/update', patch: { title: event.target.value } })}
            aria-label="Brainstorm title"
          />
          <input
            className="topbar__topic"
            value={bundle.session.topic}
            placeholder="Add a central question…"
            onChange={(event) => dispatch({ type: 'session/update', patch: { topic: event.target.value } })}
            aria-label="Central topic"
          />
        </div>

        <div className="topbar__tools">
          <SaveIndicator state={saveState} />
          <div className="segment desktop-only" role="group" aria-label="View">
            {VIEWS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="segment__item"
                aria-pressed={view === entry.id}
                onClick={() => setView(entry.id)}
              >
                <Icon name={entry.icon} size={15} />
                {entry.label}
              </button>
            ))}
          </div>
          <IconButton
            icon="undo"
            label="Undo"
            disabled={!canUndo(workspace)}
            onClick={() => dispatch({ type: 'undo' })}
          />
          <IconButton
            icon="redo"
            label="Redo"
            className="desktop-only"
            disabled={!canRedo(workspace)}
            onClick={() => dispatch({ type: 'redo' })}
          />
          <IconButton icon="sparkle" label="Thinking prompts" onClick={() => setShowAssist(true)} />
          <IconButton icon="download" label="Export this brainstorm" onClick={() => setShowExport(true)} />
          <IconButton
            icon="keyboard"
            label="Keyboard shortcuts"
            className="desktop-only"
            onClick={() => setShowShortcuts(true)}
          />
          <IconButton
            icon="settings"
            label="Settings"
            className="desktop-only"
            onClick={onOpenSettings}
          />
        </div>
      </header>

      {view !== 'actions' ? (
        <div className="filterbar">
          <div className="search">
            <span className="search__icon">
              <Icon name="search" size={15} />
            </span>
            <input
              ref={searchRef}
              className="input"
              type="search"
              placeholder="Search ideas"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              aria-label="Search ideas"
            />
          </div>

          <button
            type="button"
            className="chip"
            aria-pressed={filters.favoritesOnly}
            onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}
          >
            <Icon name="star" size={13} filled={filters.favoritesOnly} />
            Favourites
          </button>

          {bundle.groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className="chip"
              aria-pressed={filters.groupId === group.id}
              onClick={() =>
                setFilters({ ...filters, groupId: filters.groupId === group.id ? null : group.id })
              }
            >
              {group.name}
            </button>
          ))}

          {tags.slice(0, 8).map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              className="chip"
              aria-pressed={filters.tags.includes(tag)}
              onClick={() =>
                setFilters({
                  ...filters,
                  tags: filters.tags.includes(tag)
                    ? filters.tags.filter((t) => t !== tag)
                    : [...filters.tags, tag],
                })
              }
            >
              #{tag}
              <span className="chip__count">{count}</span>
            </button>
          ))}

          {filtering ? (
            <Button size="sm" variant="ghost" onClick={() => setFilters(emptyFilters)}>
              Clear
            </Button>
          ) : null}

          <span className="spacer" />

          {selection.size > 0 ? (
            <div className="row" style={{ gap: 'var(--sp-1)' }}>
              <span className="text-sm muted" style={{ whiteSpace: 'nowrap' }}>
                {selection.size} selected
              </span>
              <IconButton
                icon="star"
                label="Favourite selection"
                size={16}
                onClick={() => dispatch({ type: 'idea/toggleFavorite', ids: selectedIds })}
              />
              <IconButton
                icon="group"
                label="Group selection"
                size={16}
                onClick={() =>
                  dispatch({
                    type: 'group/add',
                    name: `Group ${bundle.groups.length + 1}`,
                    ideaIds: selectedIds,
                  })
                }
              />
              <IconButton
                icon="checkCircle"
                label="Send selection to actions"
                size={16}
                onClick={() => dispatch({ type: 'action/fromIdeas', ideaIds: selectedIds })}
              />
              <IconButton
                icon="trash"
                label="Delete selection"
                size={16}
                onClick={() => {
                  dispatch({ type: 'idea/delete', ids: selectedIds });
                  setSelection(new Set());
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {view === 'canvas' ? (
        <CanvasBoard
          ideas={bundle.ideas}
          visibleIds={visibleIds}
          groups={bundle.groups}
          canvas={bundle.session.canvas}
          selection={selection}
          filtered={filtering}
          onSelect={select}
          onOpen={setInspectorId}
          onMove={(positions) => dispatch({ type: 'idea/move', positions })}
          onCanvasChange={onCanvasChange}
          onViewport={onViewport}
          onCreateAt={(point) => dispatch({ type: 'idea/add', text: 'New idea', at: point })}
        />
      ) : null}

      {view === 'list' ? (
        <ListBoard
          ideas={visibleIdeas}
          groups={bundle.groups}
          selection={selection}
          onSelect={select}
          onOpen={setInspectorId}
          onToggleFavorite={(id) => dispatch({ type: 'idea/toggleFavorite', ids: [id] })}
          onDuplicate={(id) => dispatch({ type: 'idea/duplicate', ids: [id] })}
          onDelete={(id) => dispatch({ type: 'idea/delete', ids: [id] })}
          onReorder={(id, targetId, position) => dispatch({ type: 'idea/reorder', id, targetId, position })}
          emptyMessage={
            filtering
              ? 'No ideas match the current search or filters.'
              : 'Capture an idea below and it will appear here.'
          }
        />
      ) : null}

      {view === 'actions' ? (
        <ActionsBoard
          actions={bundle.actions}
          ideaCount={bundle.ideas.length}
          favoriteCount={favoriteCount}
          onAdd={(text) => dispatch({ type: 'action/add', text })}
          onUpdate={(id, patch) => dispatch({ type: 'action/update', id, patch })}
          onDelete={(id) => dispatch({ type: 'action/delete', id })}
          onClearCompleted={() => dispatch({ type: 'action/clearCompleted' })}
          onPromoteFavorites={() =>
            dispatch({
              type: 'action/fromIdeas',
              ideaIds: bundle.ideas.filter((idea) => idea.favorite).map((idea) => idea.id),
            })
          }
        />
      ) : null}

      {view !== 'actions' ? (
        <div className="capture">
          <div className="capture__inner">
            <input
              ref={captureRef}
              className="input"
              placeholder="Capture an idea…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  capture();
                }
              }}
              aria-label="Capture an idea"
              enterKeyHint="done"
            />
            <Button variant="primary" onClick={capture} disabled={!draft.trim()}>
              Add
            </Button>
          </div>
        </div>
      ) : null}

      <nav className="tabbar mobile-only" aria-label="Views">
        {VIEWS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="tabbar__item"
            aria-pressed={view === entry.id}
            onClick={() => setView(entry.id)}
          >
            <Icon name={entry.icon} size={20} />
            {entry.label}
          </button>
        ))}
      </nav>

      {inspected ? (
        <Inspector
          bundle={bundle}
          idea={inspected}
          dispatch={dispatch}
          onClose={() => setInspectorId(null)}
        />
      ) : null}

      {showShortcuts ? <ShortcutsDialog onClose={() => setShowShortcuts(false)} /> : null}

      {showAssist ? (
        <Dialog
          title="Thinking prompts"
          description="Structured ideation help for the whole session."
          onClose={() => setShowAssist(false)}
        >
          <AiPanel
            bundle={bundle}
            onAcceptIdea={(text) => dispatch({ type: 'idea/addMany', texts: [text] })}
            onAcceptAction={(text) => dispatch({ type: 'action/add', text })}
            onAcceptNote={(text) => dispatch({ type: 'idea/addMany', texts: [text] })}
            onAcceptGroup={(name, ideaIds) => dispatch({ type: 'group/add', name, ideaIds })}
          />
        </Dialog>
      ) : null}

      {showExport ? (
        <Dialog
          title="Export this brainstorm"
          description="Everything stays on your device unless you choose to share the file."
          onClose={() => setShowExport(false)}
          footer={<Button onClick={() => setShowExport(false)}>Close</Button>}
        >
          <div className="stack">
            <Button block icon="download" onClick={exportJson}>
              Download JSON (re-importable)
            </Button>
            <Button block icon="note" onClick={exportMarkdown}>
              Download Markdown (readable)
            </Button>
            <Button
              block
              icon="copy"
              onClick={async () => {
                const ok = await copyToClipboard(sessionToMarkdown(bundle));
                pushToast({
                  message: ok ? 'Markdown copied to the clipboard.' : 'Could not access the clipboard.',
                  tone: ok ? 'neutral' : 'danger',
                });
              }}
            >
              Copy as Markdown
            </Button>
            <Button
              block
              icon="copy"
              onClick={async () => {
                const ok = await copyToClipboard(JSON.stringify(buildExport([bundle]), null, 2));
                pushToast({
                  message: ok ? 'JSON copied to the clipboard.' : 'Could not access the clipboard.',
                  tone: ok ? 'neutral' : 'danger',
                });
              }}
            >
              Copy as JSON
            </Button>
            <p className="field__hint">
              JSON keeps positions, groups, tags and actions and can be imported again. Markdown is
              for reading and pasting elsewhere. The copy options are there for browsers and hosts
              that block file downloads — paste into a file and import it back later.
            </p>
          </div>
        </Dialog>
      ) : null}
    </main>
  );
}

function SaveIndicator({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  const label =
    state === 'saving' ? 'Saving…' : state === 'error' ? 'Not saved' : state === 'saved' ? 'Saved' : '';
  if (!label) return null;
  return (
    <span className={`savestate savestate--${state} desktop-only`} role="status" aria-live="polite">
      <span className="savestate__dot" />
      {label}
    </span>
  );
}
