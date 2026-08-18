import type { SessionBundle } from './types';

/** Renders a session as readable Markdown: topic, grouped ideas, notes,
 *  tags, favourites and the action list. Intended to be pasted anywhere. */
export function sessionToMarkdown(bundle: SessionBundle): string {
  const { session, ideas, groups, actions } = bundle;
  const lines: string[] = [];

  lines.push(`# ${session.title || 'Untitled brainstorm'}`, '');
  if (session.topic.trim()) {
    lines.push(`> ${session.topic.trim().replace(/\n/g, '\n> ')}`, '');
  }
  lines.push(
    `_${ideas.length} idea${ideas.length === 1 ? '' : 's'} · last updated ${new Date(
      session.updatedAt,
    ).toLocaleString()}_`,
    '',
  );

  const ordered = [...ideas].sort((a, b) => a.order - b.order);
  const renderIdea = (idea: (typeof ordered)[number]) => {
    const marks: string[] = [];
    if (idea.favorite) marks.push('★');
    const tags = idea.tags.map((t) => `#${t}`).join(' ');
    const suffix = [tags, marks.join('')].filter(Boolean).join(' ');
    lines.push(`- ${idea.text || '_(empty idea)_'}${suffix ? `  ${suffix}` : ''}`);
    if (idea.note.trim()) {
      for (const noteLine of idea.note.trim().split('\n')) lines.push(`  ${noteLine}`);
    }
  };

  for (const group of [...groups].sort((a, b) => a.createdAt - b.createdAt)) {
    const members = ordered.filter((idea) => idea.groupId === group.id);
    if (members.length === 0) continue;
    lines.push(`## ${group.name}`, '');
    members.forEach(renderIdea);
    lines.push('');
  }

  const ungrouped = ordered.filter(
    (idea) => !idea.groupId || !groups.some((g) => g.id === idea.groupId),
  );
  if (ungrouped.length > 0) {
    if (groups.length > 0) lines.push('## Ungrouped', '');
    ungrouped.forEach(renderIdea);
    lines.push('');
  }

  const favorites = ordered.filter((idea) => idea.favorite);
  if (favorites.length > 0) {
    lines.push('## Promising ideas', '');
    for (const idea of favorites) lines.push(`- ${idea.text}`);
    lines.push('');
  }

  if (actions.length > 0) {
    lines.push('## Actions', '');
    for (const action of [...actions].sort((a, b) => a.order - b.order)) {
      lines.push(`- [${action.done ? 'x' : ' '}] ${action.text}`);
    }
    lines.push('');
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function sessionToPlainText(bundle: SessionBundle): string {
  return sessionToMarkdown(bundle)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^_|_$/gm, '');
}
