/**
 * The workspace reducer. Every mutation of a session goes through here, which
 * is what makes undo trivial: undoable actions push a snapshot of the previous
 * bundle onto a history stack before applying their change.
 *
 * Snapshots (rather than inverse patches) are a deliberate trade-off — a
 * brainstorming session is a few hundred small objects at most, so the memory
 * cost is negligible and the correctness win is large.
 */
import { createAction, createGroup, createIdea } from './factories';
import { CARD_HEIGHT, CARD_WIDTH, findFreePosition } from './layout';
import type {
  ActionItem,
  Group,
  Id,
  Idea,
  IdeaColor,
  Session,
  SessionBundle,
  ViewMode,
} from './types';

const HISTORY_LIMIT = 60;

export interface WorkspaceState {
  bundle: SessionBundle;
  past: SessionBundle[];
  future: SessionBundle[];
  /** Drives the "undo" toast. `token` changes on every commit so repeated
   *  identical labels still re-trigger the toast. */
  lastCommit: { label: string; token: number } | null;
}

export type Placement = { x: number; y: number };

export type WorkspaceAction =
  | { type: 'replace'; bundle: SessionBundle }
  | { type: 'session/update'; patch: Partial<Pick<Session, 'title' | 'topic'>> }
  | { type: 'session/view'; view: ViewMode }
  | { type: 'session/canvas'; canvas: Partial<Session['canvas']> }
  | { type: 'idea/add'; text: string; at?: Placement; groupId?: Id | null; tags?: string[] }
  | { type: 'idea/addMany'; texts: string[]; near?: Id; groupId?: Id | null }
  | { type: 'idea/update'; id: Id; patch: Partial<Omit<Idea, 'id' | 'sessionId'>> }
  | { type: 'idea/delete'; ids: Id[] }
  | { type: 'idea/duplicate'; ids: Id[] }
  | { type: 'idea/move'; positions: Array<{ id: Id } & Placement> }
  | { type: 'idea/reorder'; id: Id; targetId: Id; position: 'before' | 'after' }
  | { type: 'idea/toggleFavorite'; ids: Id[] }
  | { type: 'idea/setGroup'; ids: Id[]; groupId: Id | null }
  | { type: 'idea/setColor'; ids: Id[]; color: IdeaColor }
  | { type: 'idea/addTag'; ids: Id[]; tag: string }
  | { type: 'idea/removeTag'; ids: Id[]; tag: string }
  | { type: 'group/add'; name: string; ideaIds: Id[] }
  | { type: 'group/update'; id: Id; patch: Partial<Omit<Group, 'id' | 'sessionId'>> }
  | { type: 'group/delete'; id: Id; withIdeas: boolean }
  | { type: 'action/add'; text: string }
  | { type: 'action/fromIdeas'; ideaIds: Id[] }
  | { type: 'action/update'; id: Id; patch: Partial<Omit<ActionItem, 'id' | 'sessionId'>> }
  | { type: 'action/delete'; id: Id }
  | { type: 'action/reorder'; id: Id; targetId: Id; position: 'before' | 'after' }
  | { type: 'action/clearCompleted' }
  | { type: 'undo' }
  | { type: 'redo' };

/** Undoable actions and the wording shown in the undo toast. */
export const UNDO_LABELS: Partial<Record<WorkspaceAction['type'], string>> = {
  'idea/add': 'Idea added',
  'idea/addMany': 'Ideas added',
  'idea/update': 'Idea edited',
  'idea/delete': 'Idea deleted',
  'idea/duplicate': 'Idea duplicated',
  'idea/move': 'Idea moved',
  'idea/reorder': 'Ideas reordered',
  'idea/toggleFavorite': 'Favourite changed',
  'idea/setGroup': 'Grouping changed',
  'idea/setColor': 'Colour changed',
  'idea/addTag': 'Tag added',
  'idea/removeTag': 'Tag removed',
  'group/add': 'Group created',
  'group/update': 'Group edited',
  'group/delete': 'Group deleted',
  'action/add': 'Action added',
  'action/fromIdeas': 'Ideas sent to actions',
  'action/update': 'Action edited',
  'action/delete': 'Action deleted',
  'action/reorder': 'Actions reordered',
  'action/clearCompleted': 'Completed actions cleared',
  'session/update': 'Session details changed',
};

export function initialState(bundle: SessionBundle): WorkspaceState {
  return { bundle, past: [], future: [], lastCommit: null };
}

export function canUndo(state: WorkspaceState): boolean {
  return state.past.length > 0;
}
export function canRedo(state: WorkspaceState): boolean {
  return state.future.length > 0;
}

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case 'replace':
      return initialState(action.bundle);

    case 'undo': {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        bundle: previous,
        past: state.past.slice(0, -1),
        future: [state.bundle, ...state.future].slice(0, HISTORY_LIMIT),
        lastCommit: null,
      };
    }

    case 'redo': {
      const next = state.future[0];
      if (!next) return state;
      return {
        bundle: next,
        past: [...state.past, state.bundle].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        lastCommit: null,
      };
    }

    // Viewport and view-mode changes are preferences, not content: they persist
    // but must never consume an undo step.
    case 'session/canvas':
      return {
        ...state,
        bundle: {
          ...state.bundle,
          session: {
            ...state.bundle.session,
            canvas: { ...state.bundle.session.canvas, ...action.canvas },
          },
        },
      };

    case 'session/view':
      if (state.bundle.session.lastView === action.view) return state;
      return {
        ...state,
        bundle: {
          ...state.bundle,
          session: { ...state.bundle.session, lastView: action.view },
        },
      };

    default: {
      const next = applyContentAction(state.bundle, action);
      if (next === state.bundle) return state;
      const label = UNDO_LABELS[action.type];
      return {
        bundle: { ...next, session: { ...next.session, updatedAt: Date.now() } },
        past: [...state.past, state.bundle].slice(-HISTORY_LIMIT),
        future: [],
        lastCommit: label ? { label, token: Date.now() + Math.random() } : null,
      };
    }
  }
}

function applyContentAction(bundle: SessionBundle, action: WorkspaceAction): SessionBundle {
  const now = Date.now();
  const { session, ideas, groups, actions } = bundle;

  switch (action.type) {
    case 'session/update':
      return { ...bundle, session: { ...session, ...action.patch } };

    case 'idea/add': {
      const text = action.text.trim();
      if (!text) return bundle;
      const at = action.at ?? defaultPlacement(bundle);
      const spot = findFreePosition(ideas, at);
      const idea = createIdea(session.id, {
        text,
        ...spot,
        groupId: action.groupId ?? null,
        tags: action.tags ?? [],
        order: nextOrder(ideas),
      });
      return { ...bundle, ideas: [...ideas, idea] };
    }

    case 'idea/addMany': {
      const texts = action.texts.map((t) => t.trim()).filter(Boolean);
      if (texts.length === 0) return bundle;
      const anchor = action.near ? ideas.find((i) => i.id === action.near) : undefined;
      const origin = anchor
        ? { x: anchor.x + CARD_WIDTH + 40, y: anchor.y }
        : defaultPlacement(bundle);
      let working = [...ideas];
      let order = nextOrder(ideas);
      for (const text of texts) {
        const spot = findFreePosition(working, origin);
        working = [
          ...working,
          createIdea(session.id, {
            text,
            ...spot,
            groupId: action.groupId ?? anchor?.groupId ?? null,
            order: order++,
          }),
        ];
      }
      return { ...bundle, ideas: working };
    }

    case 'idea/update': {
      if (!ideas.some((i) => i.id === action.id)) return bundle;
      return {
        ...bundle,
        ideas: ideas.map((idea) =>
          idea.id === action.id ? { ...idea, ...action.patch, updatedAt: now } : idea,
        ),
      };
    }

    case 'idea/delete': {
      const ids = new Set(action.ids);
      if (!ideas.some((i) => ids.has(i.id))) return bundle;
      return {
        ...bundle,
        ideas: ideas.filter((idea) => !ids.has(idea.id)),
        // Actions promoted from a deleted idea survive, but lose their backlink.
        actions: actions.map((item) =>
          item.ideaId && ids.has(item.ideaId) ? { ...item, ideaId: null } : item,
        ),
      };
    }

    case 'idea/duplicate': {
      const ids = new Set(action.ids);
      const sources = ideas.filter((idea) => ids.has(idea.id));
      if (sources.length === 0) return bundle;
      let working = [...ideas];
      let order = nextOrder(ideas);
      for (const source of sources) {
        const spot = findFreePosition(working, { x: source.x + 32, y: source.y + 32 });
        working = [
          ...working,
          createIdea(session.id, {
            text: source.text,
            note: source.note,
            tags: [...source.tags],
            favorite: source.favorite,
            groupId: source.groupId,
            color: source.color,
            x: spot.x,
            y: spot.y,
            order: order++,
          }),
        ];
      }
      return { ...bundle, ideas: working };
    }

    case 'idea/move': {
      const moves = new Map(action.positions.map((p) => [p.id, p]));
      if (moves.size === 0) return bundle;
      let changed = false;
      const nextIdeas = ideas.map((idea) => {
        const move = moves.get(idea.id);
        if (!move || (move.x === idea.x && move.y === idea.y)) return idea;
        changed = true;
        return { ...idea, x: move.x, y: move.y, updatedAt: now };
      });
      return changed ? { ...bundle, ideas: nextIdeas } : bundle;
    }

    case 'idea/reorder':
      return { ...bundle, ideas: reorder(ideas, action.id, action.targetId, action.position) };

    case 'idea/toggleFavorite': {
      const ids = new Set(action.ids);
      const targets = ideas.filter((i) => ids.has(i.id));
      if (targets.length === 0) return bundle;
      // Mixed selection: favourite everything rather than toggling each way.
      const makeFavorite = targets.some((i) => !i.favorite);
      return {
        ...bundle,
        ideas: ideas.map((idea) =>
          ids.has(idea.id) ? { ...idea, favorite: makeFavorite, updatedAt: now } : idea,
        ),
      };
    }

    case 'idea/setGroup': {
      const ids = new Set(action.ids);
      if (!ideas.some((i) => ids.has(i.id))) return bundle;
      return {
        ...bundle,
        ideas: ideas.map((idea) =>
          ids.has(idea.id) ? { ...idea, groupId: action.groupId, updatedAt: now } : idea,
        ),
      };
    }

    case 'idea/setColor': {
      const ids = new Set(action.ids);
      if (!ideas.some((i) => ids.has(i.id))) return bundle;
      return {
        ...bundle,
        ideas: ideas.map((idea) =>
          ids.has(idea.id) ? { ...idea, color: action.color, updatedAt: now } : idea,
        ),
      };
    }

    case 'idea/addTag': {
      const tag = normaliseTag(action.tag);
      if (!tag) return bundle;
      const ids = new Set(action.ids);
      let changed = false;
      const nextIdeas = ideas.map((idea) => {
        if (!ids.has(idea.id) || idea.tags.includes(tag)) return idea;
        changed = true;
        return { ...idea, tags: [...idea.tags, tag], updatedAt: now };
      });
      return changed ? { ...bundle, ideas: nextIdeas } : bundle;
    }

    case 'idea/removeTag': {
      const tag = normaliseTag(action.tag);
      const ids = new Set(action.ids);
      let changed = false;
      const nextIdeas = ideas.map((idea) => {
        if (!ids.has(idea.id) || !idea.tags.includes(tag)) return idea;
        changed = true;
        return { ...idea, tags: idea.tags.filter((t) => t !== tag), updatedAt: now };
      });
      return changed ? { ...bundle, ideas: nextIdeas } : bundle;
    }

    case 'group/add': {
      const group = createGroup(session.id, { name: action.name.trim() || 'New group' });
      const ids = new Set(action.ideaIds);
      return {
        ...bundle,
        groups: [...groups, group],
        ideas: ideas.map((idea) =>
          ids.has(idea.id) ? { ...idea, groupId: group.id, updatedAt: now } : idea,
        ),
      };
    }

    case 'group/update': {
      if (!groups.some((g) => g.id === action.id)) return bundle;
      return {
        ...bundle,
        groups: groups.map((group) =>
          group.id === action.id ? { ...group, ...action.patch } : group,
        ),
      };
    }

    case 'group/delete': {
      if (!groups.some((g) => g.id === action.id)) return bundle;
      return {
        ...bundle,
        groups: groups.filter((group) => group.id !== action.id),
        ideas: action.withIdeas
          ? ideas.filter((idea) => idea.groupId !== action.id)
          : ideas.map((idea) =>
              idea.groupId === action.id ? { ...idea, groupId: null, updatedAt: now } : idea,
            ),
      };
    }

    case 'action/add': {
      const text = action.text.trim();
      if (!text) return bundle;
      return {
        ...bundle,
        actions: [...actions, createAction(session.id, { text, order: nextOrder(actions) })],
      };
    }

    case 'action/fromIdeas': {
      const ids = action.ideaIds.filter((id) => ideas.some((idea) => idea.id === id));
      if (ids.length === 0) return bundle;
      const existing = new Set(actions.map((item) => item.ideaId));
      let order = nextOrder(actions);
      const additions = ids
        .filter((id) => !existing.has(id))
        .map((id) => {
          const idea = ideas.find((i) => i.id === id)!;
          return createAction(session.id, { ideaId: id, text: idea.text, order: order++ });
        });
      if (additions.length === 0) return bundle;
      return { ...bundle, actions: [...actions, ...additions] };
    }

    case 'action/update': {
      if (!actions.some((a) => a.id === action.id)) return bundle;
      return {
        ...bundle,
        actions: actions.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item,
        ),
      };
    }

    case 'action/delete': {
      if (!actions.some((a) => a.id === action.id)) return bundle;
      return { ...bundle, actions: actions.filter((item) => item.id !== action.id) };
    }

    case 'action/reorder':
      return { ...bundle, actions: reorder(actions, action.id, action.targetId, action.position) };

    case 'action/clearCompleted': {
      if (!actions.some((item) => item.done)) return bundle;
      return { ...bundle, actions: actions.filter((item) => !item.done) };
    }

    default:
      return bundle;
  }
}

function normaliseTag(raw: string): string {
  return raw.trim().replace(/^#/, '').replace(/\s+/g, '-').toLowerCase().slice(0, 32);
}

function nextOrder(rows: Array<{ order: number }>): number {
  return rows.reduce((max, row) => Math.max(max, row.order), 0) + 1;
}

/**
 * Fallback placement, used when the caller has no viewport to aim at (capturing
 * from the list or actions view). The canvas centres itself on the origin, so
 * this puts the card where the user will find it. `findFreePosition` then
 * spirals outwards from here.
 */
function defaultPlacement(_bundle: SessionBundle): Placement {
  return { x: -CARD_WIDTH / 2, y: -CARD_HEIGHT / 2 };
}

/** Re-sequences `order` so a moved row lands before/after its target. */
export function reorder<T extends { id: Id; order: number }>(
  rows: T[],
  id: Id,
  targetId: Id,
  position: 'before' | 'after',
): T[] {
  if (id === targetId) return rows;
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  const moving = sorted.find((row) => row.id === id);
  if (!moving) return rows;
  const without = sorted.filter((row) => row.id !== id);
  const targetIndex = without.findIndex((row) => row.id === targetId);
  if (targetIndex === -1) return rows;
  const insertAt = position === 'before' ? targetIndex : targetIndex + 1;
  without.splice(insertAt, 0, moving);
  return without.map((row, index) => (row.order === index + 1 ? row : { ...row, order: index + 1 }));
}
