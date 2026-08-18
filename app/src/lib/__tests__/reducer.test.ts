import { describe, expect, it } from 'vitest';
import { createIdea, createSession } from '../factories';
import { canRedo, canUndo, initialState, reorder, workspaceReducer } from '../reducer';
import type { WorkspaceAction, WorkspaceState } from '../reducer';
import type { SessionBundle } from '../types';

function makeBundle(ideaTexts: string[] = []): SessionBundle {
  const session = createSession({ title: 'Test', topic: 'How do we test?' });
  return {
    session,
    ideas: ideaTexts.map((text, index) =>
      createIdea(session.id, { text, order: index + 1, x: index * 260, y: 0 }),
    ),
    groups: [],
    actions: [],
  };
}

function run(state: WorkspaceState, ...actions: WorkspaceAction[]): WorkspaceState {
  return actions.reduce(workspaceReducer, state);
}

describe('workspaceReducer', () => {
  it('adds an idea and records an undo step', () => {
    const state = run(initialState(makeBundle()), { type: 'idea/add', text: 'Try a workshop' });
    expect(state.bundle.ideas).toHaveLength(1);
    expect(state.bundle.ideas[0]!.text).toBe('Try a workshop');
    expect(canUndo(state)).toBe(true);
  });

  it('ignores blank capture', () => {
    const start = initialState(makeBundle());
    const state = run(start, { type: 'idea/add', text: '   ' });
    expect(state).toBe(start);
  });

  it('never stacks new cards on top of existing ones', () => {
    let state = initialState(makeBundle());
    for (let i = 0; i < 8; i++) state = run(state, { type: 'idea/add', text: `Idea ${i}` });
    const positions = state.bundle.ideas.map((idea) => `${idea.x}:${idea.y}`);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('undoes and redoes a delete', () => {
    const start = run(initialState(makeBundle(['a', 'b'])), { type: 'idea/add', text: 'c' });
    const target = start.bundle.ideas[0]!.id;
    const deleted = run(start, { type: 'idea/delete', ids: [target] });
    expect(deleted.bundle.ideas).toHaveLength(2);

    const undone = run(deleted, { type: 'undo' });
    expect(undone.bundle.ideas).toHaveLength(3);
    expect(canRedo(undone)).toBe(true);

    const redone = run(undone, { type: 'redo' });
    expect(redone.bundle.ideas).toHaveLength(2);
  });

  it('does not spend an undo step on viewport changes', () => {
    const start = initialState(makeBundle(['a']));
    const panned = run(start, { type: 'session/canvas', canvas: { panX: 120 } });
    expect(panned.bundle.session.canvas.panX).toBe(120);
    expect(canUndo(panned)).toBe(false);
  });

  it('duplicates an idea with a new id and offset position', () => {
    const start = initialState(makeBundle(['original']));
    const source = start.bundle.ideas[0]!;
    const state = run(start, { type: 'idea/duplicate', ids: [source.id] });
    expect(state.bundle.ideas).toHaveLength(2);
    const copy = state.bundle.ideas[1]!;
    expect(copy.id).not.toBe(source.id);
    expect(copy.text).toBe('original');
    expect(`${copy.x}:${copy.y}`).not.toBe(`${source.x}:${source.y}`);
  });

  it('favouriting a mixed selection favourites everything', () => {
    let state = initialState(makeBundle(['a', 'b']));
    const [first, second] = state.bundle.ideas;
    state = run(state, { type: 'idea/toggleFavorite', ids: [first!.id] });
    state = run(state, { type: 'idea/toggleFavorite', ids: [first!.id, second!.id] });
    expect(state.bundle.ideas.every((idea) => idea.favorite)).toBe(true);
  });

  it('normalises tags and refuses duplicates', () => {
    let state = initialState(makeBundle(['a']));
    const id = state.bundle.ideas[0]!.id;
    state = run(state, { type: 'idea/addTag', ids: [id], tag: '#Growth Ideas' });
    expect(state.bundle.ideas[0]!.tags).toEqual(['growth-ideas']);
    const before = state.bundle;
    state = run(state, { type: 'idea/addTag', ids: [id], tag: 'growth-ideas' });
    expect(state.bundle).toBe(before);
  });

  it('grouping assigns members and ungrouping keeps the ideas', () => {
    let state = initialState(makeBundle(['a', 'b', 'c']));
    const ids = state.bundle.ideas.slice(0, 2).map((idea) => idea.id);
    state = run(state, { type: 'group/add', name: 'Cluster', ideaIds: ids });
    const groupId = state.bundle.groups[0]!.id;
    expect(state.bundle.ideas.filter((idea) => idea.groupId === groupId)).toHaveLength(2);

    state = run(state, { type: 'group/delete', id: groupId, withIdeas: false });
    expect(state.bundle.groups).toHaveLength(0);
    expect(state.bundle.ideas).toHaveLength(3);
    expect(state.bundle.ideas.every((idea) => idea.groupId === null)).toBe(true);
  });

  it('deletes a group with its ideas when asked', () => {
    let state = initialState(makeBundle(['a', 'b', 'c']));
    const ids = state.bundle.ideas.slice(0, 2).map((idea) => idea.id);
    state = run(state, { type: 'group/add', name: 'Cluster', ideaIds: ids });
    const groupId = state.bundle.groups[0]!.id;
    state = run(state, { type: 'group/delete', id: groupId, withIdeas: true });
    expect(state.bundle.ideas).toHaveLength(1);
  });

  it('promotes ideas to actions once each', () => {
    let state = initialState(makeBundle(['ship it']));
    const id = state.bundle.ideas[0]!.id;
    state = run(state, { type: 'action/fromIdeas', ideaIds: [id] });
    expect(state.bundle.actions).toHaveLength(1);
    const before = state.bundle;
    state = run(state, { type: 'action/fromIdeas', ideaIds: [id] });
    expect(state.bundle).toBe(before);
  });

  it('keeps promoted actions when the source idea is deleted', () => {
    let state = initialState(makeBundle(['ship it']));
    const id = state.bundle.ideas[0]!.id;
    state = run(state, { type: 'action/fromIdeas', ideaIds: [id] });
    state = run(state, { type: 'idea/delete', ids: [id] });
    expect(state.bundle.actions).toHaveLength(1);
    expect(state.bundle.actions[0]!.ideaId).toBeNull();
  });

  it('moving cards updates coordinates in one undo step', () => {
    const start = initialState(makeBundle(['a', 'b']));
    const ids = start.bundle.ideas.map((idea) => idea.id);
    const state = run(start, {
      type: 'idea/move',
      positions: [
        { id: ids[0]!, x: 40, y: 60 },
        { id: ids[1]!, x: 80, y: 90 },
      ],
    });
    expect(state.bundle.ideas[0]).toMatchObject({ x: 40, y: 60 });
    expect(state.past).toHaveLength(1);
  });

  it('caps the history so long sessions do not grow without bound', () => {
    let state = initialState(makeBundle());
    for (let i = 0; i < 90; i++) state = run(state, { type: 'idea/add', text: `idea ${i}` });
    expect(state.past.length).toBeLessThanOrEqual(60);
  });
});

describe('reorder', () => {
  const rows = [
    { id: 'a', order: 1 },
    { id: 'b', order: 2 },
    { id: 'c', order: 3 },
  ];

  it('moves a row before another', () => {
    expect(reorder(rows, 'c', 'a', 'before').map((r) => r.id)).toEqual(['c', 'a', 'b']);
  });

  it('moves a row after another', () => {
    expect(reorder(rows, 'a', 'c', 'after').map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('is a no-op for unknown targets', () => {
    expect(reorder(rows, 'a', 'zzz', 'after')).toBe(rows);
  });
});
