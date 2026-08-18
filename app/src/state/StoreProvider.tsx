import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createSession as makeSession } from '../lib/factories';
import { createId } from '../lib/id';
import { registerServiceWorker } from '../lib/pwa';
import {
  UNDO_LABELS,
  initialState,
  workspaceReducer,
} from '../lib/reducer';
import type { WorkspaceAction, WorkspaceState } from '../lib/reducer';
import * as repo from '../lib/repository';
import { applyTheme, readThemeMode, resolveTheme } from '../lib/theme';
import type { Id, SessionBundle, SessionSummary, ThemeMode } from '../lib/types';
import { AppContext } from './context';
import type { AppContextValue, Route, SaveState, Toast } from './context';

const AUTOSAVE_DELAY = 350;

/** Actions worth interrupting the user with an undo affordance. Ordinary edits
 *  stay silent — the keyboard shortcut is always there. */
const TOASTED_ACTIONS = new Set<WorkspaceAction['type']>([
  'idea/delete',
  'idea/duplicate',
  'group/delete',
  'group/add',
  'idea/setGroup',
  'action/fromIdeas',
  'action/clearCompleted',
]);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  const match = /^\/s\/([^/?#]+)/.exec(hash);
  return match?.[1] ? { name: 'session', id: decodeURIComponent(match[1]) } : { name: 'home' };
}

function routeToHash(route: Route): string {
  return route.name === 'session' ? `#/s/${encodeURIComponent(route.id)}` : '#/';
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [storageError, setStorageError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readThemeMode());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(readThemeMode()),
  );
  const [updateReady, setUpdateReady] = useState(false);

  // The reducer is driven through `useState` rather than `useReducer` because
  // "no session open" is a real state, and a reducer would have to fake it.
  const dispatchRaw = useCallback((action: WorkspaceAction) => {
    setWorkspace((current) => {
      if (action.type === 'replace') return initialState(action.bundle);
      if (!current) return current;
      return workspaceReducer(current, action);
    });
  }, []);

  const swRef = useRef<ReturnType<typeof registerServiceWorker> | null>(null);
  const saveTimer = useRef<number | null>(null);
  const pendingBundle = useRef<SessionBundle | null>(null);
  const lastSaved = useRef<SessionBundle | null>(null);
  const loadToken = useRef(0);

  // ---------------------------------------------------------------- routing
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.location.replace('#/');
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);

  // ----------------------------------------------------------------- toasts
  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = createId('toast');
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 6000);
    },
    [dismissToast],
  );

  // ------------------------------------------------------------ session list
  const refreshSummaries = useCallback(async () => {
    try {
      const rows = await repo.listSessions();
      setSummaries(rows);
      setStorageError(null);
    } catch (error) {
      setStorageError((error as Error).message);
    } finally {
      setSummariesLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSummaries();
  }, [refreshSummaries]);

  // -------------------------------------------------------- load the session
  useEffect(() => {
    if (route.name !== 'session') {
      loadToken.current += 1;
      setWorkspace(null);
      lastSaved.current = null;
      pendingBundle.current = null;
      return;
    }
    const token = ++loadToken.current;
    setWorkspaceLoading(true);
    void (async () => {
      try {
        const bundle = await repo.loadSession(route.id);
        if (token !== loadToken.current) return;
        if (!bundle) {
          pushToast({ message: 'That brainstorm no longer exists.', tone: 'danger' });
          navigate({ name: 'home' });
          return;
        }
        lastSaved.current = bundle;
        dispatchRaw({ type: 'replace', bundle });
        setStorageError(null);
      } catch (error) {
        if (token === loadToken.current) setStorageError((error as Error).message);
      } finally {
        if (token === loadToken.current) setWorkspaceLoading(false);
      }
    })();
  }, [route, navigate, pushToast, dispatchRaw]);

  // ---------------------------------------------------------------- autosave
  const flush = useCallback(async () => {
    const bundle = pendingBundle.current;
    if (!bundle) return;
    pendingBundle.current = null;
    setSaveState('saving');
    try {
      await repo.saveSession(bundle);
      lastSaved.current = bundle;
      setSaveState('saved');
      setStorageError(null);
    } catch (error) {
      setSaveState('error');
      setStorageError((error as Error).message);
    }
  }, []);

  useEffect(() => {
    const bundle = workspace?.bundle;
    if (!bundle || bundle === lastSaved.current) return;
    pendingBundle.current = bundle;
    setSaveState('saving');
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void flush(), AUTOSAVE_DELAY);
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    };
  }, [workspace?.bundle, flush]);

  // Writing on the way out matters more than the debounce: closing a tab or
  // switching apps on a phone must not drop the last few keystrokes.
  useEffect(() => {
    const commit = () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      void flush();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') commit();
    };
    window.addEventListener('pagehide', commit);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', commit);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [flush]);

  // Keep the home-screen summaries in step once a save lands.
  useEffect(() => {
    if (saveState !== 'saved') return;
    const timer = window.setTimeout(() => void refreshSummaries(), 200);
    return () => window.clearTimeout(timer);
  }, [saveState, refreshSummaries]);

  // ---------------------------------------------------------------- dispatch
  const dispatch = useCallback(
    (action: WorkspaceAction) => {
      dispatchRaw(action);
      if (!TOASTED_ACTIONS.has(action.type)) return;
      const label = UNDO_LABELS[action.type];
      if (!label) return;
      pushToast({
        message: label,
        tone: action.type.endsWith('/delete') ? 'danger' : 'neutral',
        actionLabel: 'Undo',
        onAction: () => dispatchRaw({ type: 'undo' }),
      });
    },
    [pushToast, dispatchRaw],
  );

  // ------------------------------------------------------- session lifecycle
  const createSession = useCallback(
    async (partial: { title?: string; topic?: string } = {}) => {
      const session = makeSession({
        title: partial.title?.trim() || 'Untitled brainstorm',
        topic: partial.topic?.trim() ?? '',
      });
      try {
        await repo.saveSession({ session, ideas: [], groups: [], actions: [] });
        await refreshSummaries();
        return session.id;
      } catch (error) {
        setStorageError((error as Error).message);
        pushToast({ message: 'Could not create the brainstorm.', tone: 'danger' });
        return null;
      }
    },
    [refreshSummaries, pushToast],
  );

  const removeSession = useCallback(
    async (id: Id) => {
      try {
        await repo.deleteSession(id);
        await refreshSummaries();
        if (route.name === 'session' && route.id === id) navigate({ name: 'home' });
      } catch (error) {
        setStorageError((error as Error).message);
      }
    },
    [refreshSummaries, route, navigate],
  );

  const renameSession = useCallback(
    async (id: Id, title: string) => {
      const bundle = await repo.loadSession(id);
      if (!bundle) return;
      const next: SessionBundle = {
        ...bundle,
        session: { ...bundle.session, title: title.trim() || 'Untitled brainstorm', updatedAt: Date.now() },
      };
      await repo.saveSession(next);
      await refreshSummaries();
      if (route.name === 'session' && route.id === id) {
        lastSaved.current = next;
        dispatchRaw({ type: 'replace', bundle: next });
      }
    },
    [refreshSummaries, route, dispatchRaw],
  );

  const importBundles = useCallback(
    async (bundles: SessionBundle[]) => {
      await repo.saveBundles(bundles);
      await refreshSummaries();
      return bundles.length;
    },
    [refreshSummaries],
  );

  // ------------------------------------------------------------------ theme
  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    setResolvedTheme(applyTheme(mode));
  }, []);

  useEffect(() => {
    setResolvedTheme(applyTheme(themeMode));
    if (themeMode !== 'system') return;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(applyTheme('system'));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [themeMode]);

  // Keep the browser chrome colour in step with the resolved theme.
  useEffect(() => {
    const color = resolvedTheme === 'dark' ? '#0e0f13' : '#faf9f7';
    for (const tag of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      if (!tag.media) tag.content = color;
    }
  }, [resolvedTheme]);

  // ------------------------------------------------------------ sw lifecycle
  useEffect(() => {
    const handle = registerServiceWorker();
    swRef.current = handle;
    handle.onUpdateReady(() => setUpdateReady(true));
    return () => handle.dispose();
  }, []);

  const applyUpdate = useCallback(() => swRef.current?.applyUpdate(), []);

  const value = useMemo<AppContextValue>(
    () => ({
      route,
      navigate,
      summaries,
      summariesLoading,
      refreshSummaries,
      workspace,
      workspaceLoading,
      dispatch,
      saveState,
      storageError,
      createSession,
      removeSession,
      renameSession,
      importBundles,
      theme: themeMode,
      resolvedTheme,
      setTheme,
      toasts,
      pushToast,
      dismissToast,
      updateReady,
      applyUpdate,
    }),
    [
      route,
      navigate,
      summaries,
      summariesLoading,
      refreshSummaries,
      workspace,
      workspaceLoading,
      dispatch,
      saveState,
      storageError,
      createSession,
      removeSession,
      renameSession,
      importBundles,
      themeMode,
      resolvedTheme,
      setTheme,
      toasts,
      pushToast,
      dismissToast,
      updateReady,
      applyUpdate,
    ],
  );

  return <AppContext value={value}>{children}</AppContext>;
}
