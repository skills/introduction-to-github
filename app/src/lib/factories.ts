import { createId } from './id';
import type { ActionItem, Group, Idea, IdeaColor, Session, SessionBundle } from './types';

export function createSession(partial: Partial<Session> = {}): Session {
  const now = Date.now();
  return {
    id: createId('ses'),
    title: 'Untitled brainstorm',
    topic: '',
    createdAt: now,
    updatedAt: now,
    canvas: { panX: 0, panY: 0, zoom: 1 },
    lastView: 'canvas',
    ...partial,
  };
}

export function createIdea(sessionId: string, partial: Partial<Idea> = {}): Idea {
  const now = Date.now();
  return {
    id: createId('idea'),
    sessionId,
    text: '',
    note: '',
    tags: [],
    favorite: false,
    groupId: null,
    color: 'default',
    x: 0,
    y: 0,
    order: now,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createGroup(sessionId: string, partial: Partial<Group> = {}): Group {
  return {
    id: createId('grp'),
    sessionId,
    name: 'New group',
    color: 'violet' as IdeaColor,
    collapsed: false,
    createdAt: Date.now(),
    ...partial,
  };
}

export function createAction(sessionId: string, partial: Partial<ActionItem> = {}): ActionItem {
  return {
    id: createId('act'),
    sessionId,
    ideaId: null,
    text: '',
    done: false,
    order: Date.now(),
    createdAt: Date.now(),
    ...partial,
  };
}

export function emptyBundle(session: Session): SessionBundle {
  return { session, ideas: [], groups: [], actions: [] };
}
