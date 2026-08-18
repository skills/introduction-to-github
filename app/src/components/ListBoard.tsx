import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Group, Id, Idea } from '../lib/types';
import { Icon } from './Icon';
import { EmptyState, IconButton } from './primitives';

interface ListBoardProps {
  ideas: Idea[];
  groups: Group[];
  selection: Set<Id>;
  onSelect: (ids: Id[], mode: 'replace' | 'toggle') => void;
  onOpen: (id: Id) => void;
  onToggleFavorite: (id: Id) => void;
  onDuplicate: (id: Id) => void;
  onDelete: (id: Id) => void;
  onReorder: (id: Id, targetId: Id, position: 'before' | 'after') => void;
  emptyMessage: string;
}

interface DropTarget {
  id: Id;
  position: 'before' | 'after';
}

export function ListBoard({
  ideas,
  groups,
  selection,
  onSelect,
  onOpen,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onReorder,
  emptyMessage,
}: ListBoardProps) {
  const [draggingId, setDraggingId] = useState<Id | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ordered = [...ideas].sort((a, b) => a.order - b.order);

  /** Pointer-based rather than HTML5 drag-and-drop, which does not work on
   *  touch devices — the same handle then works with mouse, pen and finger. */
  const findTarget = useCallback((clientX: number, clientY: number): DropTarget | null => {
    const elements = document.elementsFromPoint(clientX, clientY);
    for (const element of elements) {
      const row = (element as HTMLElement).closest?.('[data-idea-id]') as HTMLElement | null;
      if (row && listRef.current?.contains(row)) {
        const id = row.dataset.ideaId;
        if (!id) continue;
        const rect = row.getBoundingClientRect();
        return { id, position: clientY < rect.top + rect.height / 2 ? 'before' : 'after' };
      }
    }
    return null;
  }, []);

  const onHandleDown = (event: ReactPointerEvent<HTMLButtonElement>, id: Id) => {
    event.preventDefault();
    setDraggingId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHandleMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingId) return;
    const target = findTarget(event.clientX, event.clientY);
    setDropTarget(target && target.id !== draggingId ? target : null);
  };

  const onHandleUp = () => {
    if (draggingId && dropTarget) onReorder(draggingId, dropTarget.id, dropTarget.position);
    setDraggingId(null);
    setDropTarget(null);
  };

  const moveByKeyboard = (id: Id, direction: -1 | 1) => {
    const index = ordered.findIndex((idea) => idea.id === id);
    const neighbour = ordered[index + direction];
    if (!neighbour) return;
    onReorder(id, neighbour.id, direction === -1 ? 'before' : 'after');
  };

  if (ordered.length === 0) {
    return (
      <div className="listview">
        <div className="listview__inner">
          <EmptyState title="Nothing here yet" body={emptyMessage} />
        </div>
      </div>
    );
  }

  const sections: Array<{ key: string; title: string | null; rows: Idea[] }> = [];
  const ungrouped = ordered.filter((idea) => !idea.groupId || !groups.some((g) => g.id === idea.groupId));
  if (ungrouped.length > 0) {
    sections.push({ key: 'ungrouped', title: groups.length > 0 ? 'Ungrouped' : null, rows: ungrouped });
  }
  for (const group of groups) {
    const rows = ordered.filter((idea) => idea.groupId === group.id);
    if (rows.length > 0) sections.push({ key: group.id, title: group.name, rows });
  }

  return (
    <div className="listview">
      <div className="listview__inner" ref={listRef}>
        {sections.map((section) => (
          <section key={section.key}>
            {section.title ? <h3 className="listgroup__title">{section.title}</h3> : null}
            {section.rows.map((idea) => {
              const selected = selection.has(idea.id);
              const isDropBefore = dropTarget?.id === idea.id && dropTarget.position === 'before';
              const isDropAfter = dropTarget?.id === idea.id && dropTarget.position === 'after';
              return (
                <div
                  key={idea.id}
                  data-idea-id={idea.id}
                  className={[
                    'listrow',
                    selected ? 'listrow--selected' : '',
                    draggingId === idea.id ? 'listrow--dragging' : '',
                    isDropBefore ? 'listrow--drop-before' : '',
                    isDropAfter ? 'listrow--drop-after' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onKeyDown={(event) => {
                    if (!event.altKey) return;
                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      moveByKeyboard(idea.id, -1);
                    }
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      moveByKeyboard(idea.id, 1);
                    }
                  }}
                >
                  <button
                    type="button"
                    className="listrow__handle"
                    aria-label={`Reorder ${idea.text || 'idea'}. Hold and drag, or use Alt with the arrow keys.`}
                    onPointerDown={(event) => onHandleDown(event, idea.id)}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                  >
                    <Icon name="grip" size={16} />
                  </button>

                  <button
                    type="button"
                    className="listrow__body"
                    onClick={(event) =>
                      event.shiftKey || event.metaKey || event.ctrlKey
                        ? onSelect([idea.id], 'toggle')
                        : onOpen(idea.id)
                    }
                    aria-label={`Open ${idea.text || 'empty idea'}`}
                  >
                    <span className="listrow__text">{idea.text || 'Empty idea'}</span>
                    {idea.note.trim() ? <span className="listrow__note">{idea.note}</span> : null}
                    {idea.tags.length > 0 ? (
                      <span className="listrow__tags">
                        {idea.tags.map((tag) => (
                          <span className="idea__tag" key={tag}>
                            #{tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </button>

                  <div className="listrow__tools">
                    <IconButton
                      icon="star"
                      label={idea.favorite ? 'Remove favourite' : 'Mark as favourite'}
                      size={16}
                      filled={idea.favorite}
                      aria-pressed={idea.favorite}
                      onClick={() => onToggleFavorite(idea.id)}
                    />
                    <IconButton
                      icon="copy"
                      label="Duplicate idea"
                      size={16}
                      onClick={() => onDuplicate(idea.id)}
                    />
                    <IconButton
                      icon="trash"
                      label="Delete idea"
                      size={16}
                      onClick={() => onDelete(idea.id)}
                    />
                  </div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
