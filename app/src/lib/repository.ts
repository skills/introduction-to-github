/**
 * Session storage. The unit of work is a whole `SessionBundle`: the reducer
 * produces a new bundle, and this module reconciles it with IndexedDB inside a
 * single transaction so a crash mid-save can never leave a half-written session.
 */
import { STORES, idb, runTransaction } from './db';
import type { ActionItem, Group, Id, Idea, Session, SessionBundle, SessionSummary } from './types';

const ENTITY_STORES = [STORES.ideas, STORES.groups, STORES.actions] as const;
const ALL_STORES = [STORES.sessions, ...ENTITY_STORES];

export async function listSessions(): Promise<SessionSummary[]> {
  return runTransaction(ALL_STORES, 'readonly', async (tx) => {
    const [sessions, ideas, actions] = await Promise.all([
      idb.getAll<Session>(tx, STORES.sessions),
      idb.getAll<Idea>(tx, STORES.ideas),
      idb.getAll<ActionItem>(tx, STORES.actions),
    ]);

    const counts = new Map<Id, { ideas: number; favorites: number; openActions: number }>();
    const bucket = (id: Id) => {
      let entry = counts.get(id);
      if (!entry) {
        entry = { ideas: 0, favorites: 0, openActions: 0 };
        counts.set(id, entry);
      }
      return entry;
    };
    for (const idea of ideas) {
      const entry = bucket(idea.sessionId);
      entry.ideas += 1;
      if (idea.favorite) entry.favorites += 1;
    }
    for (const action of actions) {
      if (!action.done) bucket(action.sessionId).openActions += 1;
    }

    return sessions
      .map<SessionSummary>((session) => {
        const entry = counts.get(session.id);
        return {
          id: session.id,
          title: session.title,
          topic: session.topic,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          ideaCount: entry?.ideas ?? 0,
          favoriteCount: entry?.favorites ?? 0,
          openActionCount: entry?.openActions ?? 0,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  });
}

export async function loadSession(id: Id): Promise<SessionBundle | null> {
  return runTransaction(ALL_STORES, 'readonly', async (tx) => {
    const session = await idb.get<Session>(tx, STORES.sessions, id);
    if (!session) return null;
    const [ideas, groups, actions] = await Promise.all([
      idb.getAllByIndex<Idea>(tx, STORES.ideas, 'sessionId', id),
      idb.getAllByIndex<Group>(tx, STORES.groups, 'sessionId', id),
      idb.getAllByIndex<ActionItem>(tx, STORES.actions, 'sessionId', id),
    ]);
    return {
      session,
      ideas: ideas.sort((a, b) => a.order - b.order),
      groups: groups.sort((a, b) => a.createdAt - b.createdAt),
      actions: actions.sort((a, b) => a.order - b.order),
    } satisfies SessionBundle;
  });
}

/** Writes a bundle, removing any rows that no longer exist in it. */
export async function saveSession(bundle: SessionBundle): Promise<void> {
  await runTransaction(ALL_STORES, 'readwrite', async (tx) => {
    await idb.put(tx, STORES.sessions, bundle.session);
    await reconcile(tx, STORES.ideas, bundle.session.id, bundle.ideas);
    await reconcile(tx, STORES.groups, bundle.session.id, bundle.groups);
    await reconcile(tx, STORES.actions, bundle.session.id, bundle.actions);
  });
}

async function reconcile(
  tx: IDBTransaction,
  store: (typeof ENTITY_STORES)[number],
  sessionId: Id,
  rows: Array<{ id: Id }>,
): Promise<void> {
  const existing = await idb.getAllKeysByIndex(tx, store, 'sessionId', sessionId);
  const keep = new Set(rows.map((row) => row.id));
  for (const key of existing) {
    if (!keep.has(key as Id)) await idb.delete(tx, store, key);
  }
  for (const row of rows) await idb.put(tx, store, row);
}

export async function deleteSession(id: Id): Promise<void> {
  await runTransaction(ALL_STORES, 'readwrite', async (tx) => {
    await idb.delete(tx, STORES.sessions, id);
    for (const store of ENTITY_STORES) {
      const keys = await idb.getAllKeysByIndex(tx, store, 'sessionId', id);
      for (const key of keys) await idb.delete(tx, store, key);
    }
  });
}

export async function loadAllBundles(): Promise<SessionBundle[]> {
  return runTransaction(ALL_STORES, 'readonly', async (tx) => {
    const [sessions, ideas, groups, actions] = await Promise.all([
      idb.getAll<Session>(tx, STORES.sessions),
      idb.getAll<Idea>(tx, STORES.ideas),
      idb.getAll<Group>(tx, STORES.groups),
      idb.getAll<ActionItem>(tx, STORES.actions),
    ]);
    return sessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map<SessionBundle>((session) => ({
        session,
        ideas: ideas.filter((i) => i.sessionId === session.id).sort((a, b) => a.order - b.order),
        groups: groups.filter((g) => g.sessionId === session.id),
        actions: actions.filter((a) => a.sessionId === session.id).sort((a, b) => a.order - b.order),
      }));
  });
}

export async function saveBundles(bundles: SessionBundle[]): Promise<void> {
  for (const bundle of bundles) await saveSession(bundle);
}

export async function clearAllData(): Promise<void> {
  await runTransaction(ALL_STORES, 'readwrite', async (tx) => {
    for (const store of ALL_STORES) await idb.clear(tx, store);
  });
}
