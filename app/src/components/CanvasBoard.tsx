import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { CARD_HEIGHT, CARD_WIDTH, boundsOf } from '../lib/layout';
import type { Group, Id, Idea, Session } from '../lib/types';
import { Icon } from './Icon';
import { IconButton } from './primitives';

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2;
const GROUP_PADDING = 18;

interface CanvasBoardProps {
  ideas: Idea[];
  visibleIds: Set<Id>;
  groups: Group[];
  canvas: Session['canvas'];
  selection: Set<Id>;
  onSelect: (ids: Id[], mode: 'replace' | 'toggle') => void;
  onOpen: (id: Id) => void;
  onMove: (positions: Array<{ id: Id; x: number; y: number }>) => void;
  onCanvasChange: (canvas: Partial<Session['canvas']>) => void;
  onCreateAt: (point: { x: number; y: number }) => void;
  onViewport: (size: { width: number; height: number }) => void;
  filtered: boolean;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  origins: Map<Id, { x: number; y: number }>;
  moved: boolean;
}

export function CanvasBoard({
  ideas,
  visibleIds,
  groups,
  canvas,
  selection,
  onSelect,
  onOpen,
  onMove,
  onCanvasChange,
  onCreateAt,
  onViewport,
  filtered,
}: CanvasBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const panRef = useRef<{ pointerId: number; startX: number; startY: number; panX: number; panY: number } | null>(null);
  const pinchRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);

  // Live positions while dragging: kept out of the reducer so a drag does not
  // create sixty undo steps or sixty database writes.
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [panning, setPanning] = useState(false);
  const centred = useRef(false);

  const toBoard = useCallback(
    (clientX: number, clientY: number) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - canvas.panX) / canvas.zoom,
        y: (clientY - rect.top - canvas.panY) / canvas.zoom,
      };
    },
    [canvas.panX, canvas.panY, canvas.zoom],
  );

  // A fresh board starts with pan 0,0, which would put the origin in the very
  // top-left corner and clip the first cards. Centre it once, on mount, and
  // keep the measured size flowing upwards so quick capture can drop new ideas
  // where the user is actually looking.
  useEffect(() => {
    const element = boardRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0) return;
      onViewport({ width: rect.width, height: rect.height });
      if (!centred.current && canvas.panX === 0 && canvas.panY === 0) {
        centred.current = true;
        onCanvasChange({ panX: Math.round(rect.width / 2), panY: Math.round(rect.height / 2) });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [canvas.panX, canvas.panY, onCanvasChange, onViewport]);

  const zoomAround = useCallback(
    (nextZoom: number, clientX: number, clientY: number) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const boardX = (px - canvas.panX) / canvas.zoom;
      const boardY = (py - canvas.panY) / canvas.zoom;
      onCanvasChange({
        zoom: clamped,
        panX: px - boardX * clamped,
        panY: py - boardY * clamped,
      });
    },
    [canvas.panX, canvas.panY, canvas.zoom, onCanvasChange],
  );

  // Non-passive wheel listener: React attaches wheel passively, which makes
  // preventDefault() (and therefore ctrl+wheel zoom) impossible.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        zoomAround(canvas.zoom * (1 - event.deltaY / 320), event.clientX, event.clientY);
      } else {
        onCanvasChange({ panX: canvas.panX - event.deltaX, panY: canvas.panY - event.deltaY });
      }
    };
    board.addEventListener('wheel', onWheel, { passive: false });
    return () => board.removeEventListener('wheel', onWheel);
  }, [canvas.panX, canvas.panY, canvas.zoom, onCanvasChange, zoomAround]);

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    const offset = dragOffset;
    dragRef.current = null;
    setDragOffset(null);
    if (!drag || !offset || !drag.moved) return;
    const positions = [...drag.origins.entries()].map(([id, origin]) => ({
      id,
      x: Math.round(origin.x + offset.dx),
      y: Math.round(origin.y + offset.dy),
    }));
    onMove(positions);
  }, [dragOffset, onMove]);

  const onCardPointerDown = (event: ReactPointerEvent<HTMLElement>, idea: Idea) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.stopPropagation();
    const additive = event.shiftKey || event.metaKey || event.ctrlKey;
    const alreadySelected = selection.has(idea.id);
    if (additive) onSelect([idea.id], 'toggle');
    else if (!alreadySelected) onSelect([idea.id], 'replace');

    const moving = additive || !alreadySelected ? [idea.id] : [...selection];
    const origins = new Map<Id, { x: number; y: number }>();
    for (const id of moving) {
      const source = ideas.find((candidate) => candidate.id === id);
      if (source) origins.set(id, { x: source.x, y: source.y });
    }
    if (!origins.has(idea.id)) origins.set(idea.id, { x: idea.x, y: idea.y });

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origins,
      moved: false,
    };
    setDragOffset({ dx: 0, dy: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onBoardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget && !(event.target as HTMLElement).dataset.boardSurface) {
      return;
    }
    pinchRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinchRef.current.size === 2) {
      const [a, b] = [...pinchRef.current.values()];
      if (a && b) {
        pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: canvas.zoom };
      }
      panRef.current = null;
      setPanning(false);
      return;
    }
    onSelect([], 'replace');
    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: canvas.panX,
      panY: canvas.panY,
    };
    setPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pinchRef.current.has(event.pointerId)) {
      pinchRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (pinchRef.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pinchRef.current.values()];
      if (a && b) {
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const ratio = distance / (pinchStart.current.distance || 1);
        zoomAround(pinchStart.current.zoom * ratio, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      return;
    }

    const drag = dragRef.current;
    if (drag && drag.pointerId === event.pointerId) {
      const dx = (event.clientX - drag.startX) / canvas.zoom;
      const dy = (event.clientY - drag.startY) / canvas.zoom;
      if (!drag.moved && Math.hypot(dx, dy) * canvas.zoom > 3) drag.moved = true;
      setDragOffset({ dx, dy });
      return;
    }

    const pan = panRef.current;
    if (pan && pan.pointerId === event.pointerId) {
      onCanvasChange({
        panX: pan.panX + (event.clientX - pan.startX),
        panY: pan.panY + (event.clientY - pan.startY),
      });
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pinchRef.current.delete(event.pointerId);
    if (pinchRef.current.size < 2) pinchStart.current = null;
    if (dragRef.current?.pointerId === event.pointerId) endDrag();
    if (panRef.current?.pointerId === event.pointerId) {
      panRef.current = null;
      setPanning(false);
    }
  };

  const groupFrames = useMemo(() => {
    return groups
      .map((group) => {
        const members = ideas.filter((idea) => idea.groupId === group.id);
        if (members.length === 0) return null;
        const box = boundsOf(members);
        return { group, box };
      })
      .filter((entry): entry is { group: Group; box: ReturnType<typeof boundsOf> } => entry !== null);
  }, [groups, ideas]);

  const dragIds = dragRef.current?.origins;

  return (
    <div
      ref={boardRef}
      className={`board ${panning ? 'board--panning' : ''}`}
      onPointerDown={onBoardPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const point = toBoard(event.clientX, event.clientY);
        onCreateAt({ x: point.x - CARD_WIDTH / 2, y: point.y - CARD_HEIGHT / 2 });
      }}
      role="application"
      aria-label="Idea canvas. Drag to pan, drag cards to arrange, double-click to add an idea."
    >
      <div
        className="board__scene"
        style={{ transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})` }}
      >
        {groupFrames.map(({ group, box }) => (
          <div
            key={group.id}
            className="group-frame"
            style={{
              left: box.x - GROUP_PADDING,
              top: box.y - GROUP_PADDING,
              width: box.width + GROUP_PADDING * 2,
              height: box.height + GROUP_PADDING * 2,
            }}
          >
            <span className="group-frame__label">{group.name}</span>
          </div>
        ))}

        {ideas.map((idea) => {
          const isDragging = Boolean(dragIds?.has(idea.id) && dragOffset);
          const x = isDragging ? idea.x + (dragOffset?.dx ?? 0) : idea.x;
          const y = isDragging ? idea.y + (dragOffset?.dy ?? 0) : idea.y;
          const selected = selection.has(idea.id);
          const dimmed = filtered && !visibleIds.has(idea.id);
          return (
            <article
              key={idea.id}
              className={[
                'idea',
                selected ? 'idea--selected' : '',
                isDragging ? 'idea--dragging' : '',
                dimmed ? 'idea--dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: x,
                top: y,
                ['--card-bg' as string]: `var(--c-${idea.color}-bg)`,
                ['--card-line' as string]: `var(--c-${idea.color}-line)`,
              }}
              tabIndex={0}
              role="button"
              aria-pressed={selected}
              aria-label={idea.text || 'Empty idea'}
              onPointerDown={(event) => onCardPointerDown(event, idea)}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onOpen(idea.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(idea.id);
                }
              }}
            >
              <p className={`idea__text ${idea.text ? '' : 'idea__text--empty'}`}>
                {idea.text || 'Empty idea'}
              </p>
              <div className="idea__foot">
                {idea.tags.slice(0, 3).map((tag) => (
                  <span className="idea__tag" key={tag}>
                    #{tag}
                  </span>
                ))}
                {idea.note.trim() ? (
                  <span className="idea__note-dot" title="Has a note">
                    <Icon name="note" size={13} />
                  </span>
                ) : null}
                {idea.favorite ? (
                  <span className="idea__star" title="Favourite">
                    <Icon name="star" size={15} filled />
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {ideas.length === 0 ? (
        <div className="board__hint">
          <div className="empty">
            <p className="empty__title">An empty board, on purpose</p>
            <p className="empty__body">
              Type in the box below and press Enter to capture your first idea. Double-click anywhere
              on the board to drop one exactly where you want it.
            </p>
          </div>
        </div>
      ) : null}

      <div className="zoom-controls">
        <IconButton
          icon="zoomIn"
          label="Zoom in"
          size={17}
          onClick={() => {
            const rect = boardRef.current?.getBoundingClientRect();
            if (rect) zoomAround(canvas.zoom * 1.2, rect.left + rect.width / 2, rect.top + rect.height / 2);
          }}
        />
        <IconButton
          icon="zoomOut"
          label="Zoom out"
          size={17}
          onClick={() => {
            const rect = boardRef.current?.getBoundingClientRect();
            if (rect) zoomAround(canvas.zoom / 1.2, rect.left + rect.width / 2, rect.top + rect.height / 2);
          }}
        />
        <IconButton
          icon="fit"
          label="Fit all ideas on screen"
          size={17}
          onClick={() => {
            const rect = boardRef.current?.getBoundingClientRect();
            if (!rect) return;
            if (ideas.length === 0) {
              onCanvasChange({ panX: rect.width / 2, panY: rect.height / 2, zoom: 1 });
              return;
            }
            const box = boundsOf(ideas);
            const zoom = Math.min(
              MAX_ZOOM,
              Math.max(MIN_ZOOM, Math.min((rect.width - 80) / box.width, (rect.height - 120) / box.height)),
            );
            onCanvasChange({
              zoom,
              panX: rect.width / 2 - (box.x + box.width / 2) * zoom,
              panY: rect.height / 2 - (box.y + box.height / 2) * zoom,
            });
          }}
        />
      </div>
    </div>
  );
}
