import { createContext } from 'react';
import type { Dispatch } from 'react';
import type { WorkspaceAction, WorkspaceState } from '../lib/reducer';
import type { Id, SessionBundle, SessionSummary, ThemeMode } from '../lib/types';

export type Route = { name: 'home' } | { name: 'session'; id: Id };

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface Toast {
  id: string;
  message: string;
  tone: 'neutral' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
}

export interface AppContextValue {
  route: Route;
  navigate: (route: Route) => void;

  summaries: SessionSummary[];
  summariesLoading: boolean;
  refreshSummaries: () => Promise<void>;

  workspace: WorkspaceState | null;
  workspaceLoading: boolean;
  dispatch: Dispatch<WorkspaceAction>;

  saveState: SaveState;
  storageError: string | null;

  createSession: (partial?: { title?: string; topic?: string }) => Promise<Id | null>;
  removeSession: (id: Id) => Promise<void>;
  renameSession: (id: Id, title: string) => Promise<void>;
  importBundles: (bundles: SessionBundle[]) => Promise<number>;

  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;

  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  updateReady: boolean;
  applyUpdate: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
