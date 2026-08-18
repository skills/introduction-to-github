/** Core domain types. Everything here is plain data so it can be structured-cloned
 *  into IndexedDB, snapshotted for undo, and serialised for export without adapters. */

export type Id = string;

export type ViewMode = 'canvas' | 'list' | 'actions';

export type ThemeMode = 'light' | 'dark' | 'system';

/** Accent colours available on cards and groups. Stored as tokens, not hex,
 *  so both themes can render them with appropriate contrast. */
export const IDEA_COLORS = [
  'default',
  'amber',
  'rose',
  'violet',
  'teal',
  'blue',
  'lime',
] as const;
export type IdeaColor = (typeof IDEA_COLORS)[number];

export interface Session {
  id: Id;
  title: string;
  /** The central question, problem or goal the session revolves around. */
  topic: string;
  createdAt: number;
  updatedAt: number;
  /** Persisted canvas viewport so reopening a session feels like returning to a desk. */
  canvas: { panX: number; panY: number; zoom: number };
  lastView: ViewMode;
}

export interface Idea {
  id: Id;
  sessionId: Id;
  text: string;
  note: string;
  tags: string[];
  favorite: boolean;
  groupId: Id | null;
  color: IdeaColor;
  /** Canvas position in board coordinates (independent of zoom/pan). */
  x: number;
  y: number;
  /** Manual ordering used by the list view and by export. */
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: Id;
  sessionId: Id;
  name: string;
  color: IdeaColor;
  collapsed: boolean;
  createdAt: number;
}

export interface ActionItem {
  id: Id;
  sessionId: Id;
  /** Set when the action was promoted from an idea; null for standalone actions. */
  ideaId: Id | null;
  text: string;
  done: boolean;
  order: number;
  createdAt: number;
}

/** Everything belonging to one session — the unit that is loaded, edited,
 *  snapshotted for undo, autosaved, and exported. */
export interface SessionBundle {
  session: Session;
  ideas: Idea[];
  groups: Group[];
  actions: ActionItem[];
}

export interface SessionSummary {
  id: Id;
  title: string;
  topic: string;
  createdAt: number;
  updatedAt: number;
  ideaCount: number;
  favoriteCount: number;
  openActionCount: number;
}
