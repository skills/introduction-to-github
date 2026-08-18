import { useState } from 'react';
import type { ActionItem, Id } from '../lib/types';
import { Button, EmptyState, IconButton } from './primitives';

interface ActionsBoardProps {
  actions: ActionItem[];
  ideaCount: number;
  onAdd: (text: string) => void;
  onUpdate: (id: Id, patch: Partial<ActionItem>) => void;
  onDelete: (id: Id) => void;
  onClearCompleted: () => void;
  onPromoteFavorites: () => void;
  favoriteCount: number;
}

export function ActionsBoard({
  actions,
  ideaCount,
  onAdd,
  onUpdate,
  onDelete,
  onClearCompleted,
  onPromoteFavorites,
  favoriteCount,
}: ActionsBoardProps) {
  const [draft, setDraft] = useState('');
  const ordered = [...actions].sort((a, b) => a.order - b.order);
  const open = ordered.filter((item) => !item.done);
  const done = ordered.filter((item) => item.done);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
  };

  return (
    <div className="listview">
      <div className="listview__inner">
        <div className="section__head">
          <h2 className="section__title">
            Action list
            {ordered.length > 0 ? (
              <span className="muted"> · {open.length} open, {done.length} done</span>
            ) : null}
          </h2>
          <div className="row row--wrap">
            {favoriteCount > 0 ? (
              <Button size="sm" icon="star" onClick={onPromoteFavorites}>
                Add {favoriteCount} favourite{favoriteCount === 1 ? '' : 's'}
              </Button>
            ) : null}
            {done.length > 0 ? (
              <Button size="sm" variant="ghost" onClick={onClearCompleted}>
                Clear completed
              </Button>
            ) : null}
          </div>
        </div>

        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          <input
            className="input"
            placeholder="Add an action…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            aria-label="New action"
          />
          <Button variant="primary" onClick={submit} disabled={!draft.trim()}>
            Add
          </Button>
        </div>

        {ordered.length === 0 ? (
          <EmptyState
            title="Turn thinking into doing"
            body={
              ideaCount === 0
                ? 'Capture some ideas first, then star the promising ones and bring them here.'
                : 'Star the ideas worth pursuing, then use “Send to actions” from an idea or the button above.'
            }
          />
        ) : (
          <div className="stack" style={{ gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            {[...open, ...done].map((item) => (
              <div
                key={item.id}
                className={`actionrow ${item.done ? 'actionrow--done' : ''}`}
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={item.done}
                  onChange={(event) => onUpdate(item.id, { done: event.target.checked })}
                  aria-label={`Mark "${item.text}" as ${item.done ? 'not done' : 'done'}`}
                />
                <input
                  className="actionrow__text"
                  value={item.text}
                  onChange={(event) => onUpdate(item.id, { text: event.target.value })}
                  aria-label="Action text"
                />
                <IconButton
                  icon="trash"
                  label={`Delete action "${item.text}"`}
                  size={16}
                  onClick={() => onDelete(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
