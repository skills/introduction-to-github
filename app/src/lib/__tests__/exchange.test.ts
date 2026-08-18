import { describe, expect, it } from 'vitest';
import { buildExport, parseImport, exportFileName, ImportError } from '../exchange';
import { createGroup, createIdea, createSession } from '../factories';
import { sessionToMarkdown } from '../markdown';
import type { SessionBundle } from '../types';

function sample(): SessionBundle {
  const session = createSession({ title: 'Launch plan', topic: 'How do we launch well?' });
  const group = createGroup(session.id, { name: 'Marketing' });
  return {
    session,
    groups: [group],
    ideas: [
      createIdea(session.id, {
        text: 'Write a launch post',
        note: 'Aim for 600 words',
        tags: ['content'],
        favorite: true,
        groupId: group.id,
        order: 1,
      }),
      createIdea(session.id, { text: 'Email the beta list', order: 2 }),
    ],
    actions: [],
  };
}

describe('export / import', () => {
  it('round-trips a session, remapping ids', () => {
    const original = sample();
    const file = JSON.stringify(buildExport([original]));
    const [restored] = parseImport(file);

    expect(restored).toBeDefined();
    expect(restored!.session.title).toBe('Launch plan');
    expect(restored!.ideas).toHaveLength(2);
    expect(restored!.session.id).not.toBe(original.session.id);

    // Group membership must survive the id remap.
    const restoredGroupId = restored!.groups[0]!.id;
    expect(restored!.ideas[0]!.groupId).toBe(restoredGroupId);
    expect(restored!.ideas.every((idea) => idea.sessionId === restored!.session.id)).toBe(true);
  });

  it('rejects files that are not Sparkboard exports', () => {
    expect(() => parseImport('{"hello":true}')).toThrow(ImportError);
    expect(() => parseImport('not json at all')).toThrow(ImportError);
  });

  it('rejects a newer export format', () => {
    const file = JSON.stringify({ ...buildExport([sample()]), version: 99 });
    expect(() => parseImport(file)).toThrow(/newer version/i);
  });

  it('survives partially corrupt entries instead of throwing', () => {
    const file = JSON.stringify({
      ...buildExport([sample()]),
      sessions: [
        { session: { title: 'Half broken' }, ideas: [{ text: 'ok' }, 42, null], groups: 'nope' },
      ],
    });
    const [restored] = parseImport(file);
    expect(restored!.ideas).toHaveLength(1);
    expect(restored!.groups).toHaveLength(0);
    expect(restored!.session.title).toBe('Half broken');
  });

  it('clamps an out-of-range zoom', () => {
    const bundle = sample();
    bundle.session.canvas.zoom = 999;
    const [restored] = parseImport(JSON.stringify(buildExport([bundle])));
    expect(restored!.session.canvas.zoom).toBeLessThanOrEqual(2);
  });

  it('builds a safe filename', () => {
    expect(exportFileName('Launch plan / 2026!', 'json')).toMatch(/^launch-plan-2026-\d{4}-\d{2}-\d{2}\.json$/);
    expect(exportFileName('!!!', 'md')).toMatch(/^sparkboard-/);
  });
});

describe('markdown export', () => {
  it('includes the topic, groups, tags and favourites', () => {
    const md = sessionToMarkdown(sample());
    expect(md).toContain('# Launch plan');
    expect(md).toContain('> How do we launch well?');
    expect(md).toContain('## Marketing');
    expect(md).toContain('Write a launch post');
    expect(md).toContain('#content');
    expect(md).toContain('## Promising ideas');
    expect(md).toContain('  Aim for 600 words');
  });

  it('renders actions as a checklist', () => {
    const bundle = sample();
    bundle.actions = [
      { id: 'a1', sessionId: bundle.session.id, ideaId: null, text: 'Book the date', done: true, order: 1, createdAt: 0 },
      { id: 'a2', sessionId: bundle.session.id, ideaId: null, text: 'Draft the post', done: false, order: 2, createdAt: 0 },
    ];
    const md = sessionToMarkdown(bundle);
    expect(md).toContain('- [x] Book the date');
    expect(md).toContain('- [ ] Draft the post');
  });
});
