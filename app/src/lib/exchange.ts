/**
 * Import/export. The JSON format is the portable, loss-free representation
 * (the same shape the app stores); Markdown is the human-readable one.
 *
 * Import never overwrites: incoming sessions always get fresh ids, so bringing
 * a file back into a device that already has it produces a copy rather than
 * silently clobbering work.
 */
import { createId } from './id';
import type { ActionItem, Group, Idea, Session, SessionBundle } from './types';
import { IDEA_COLORS } from './types';

export const EXPORT_FORMAT = 'sparkboard.export';
export const EXPORT_VERSION = 1;

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  app: { name: string; version: string };
  sessions: SessionBundle[];
}

export function buildExport(bundles: SessionBundle[], appVersion = '1.0.0'): ExportFile {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: { name: 'Sparkboard', version: appVersion },
    sessions: bundles,
  };
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const bool = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;

/**
 * Parses and sanitises an export file. Everything is defensive on purpose —
 * the input is a user-chosen file and may be hand-edited or from a future
 * version, and a bad import must never corrupt the local database.
 */
export function parseImport(raw: string): SessionBundle[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new ImportError('That file is not valid JSON.');
  }
  if (!isRecord(data)) throw new ImportError('That file does not look like a Sparkboard export.');
  if (data.format !== EXPORT_FORMAT) {
    throw new ImportError('That file does not look like a Sparkboard export.');
  }
  if (num(data.version, 0) > EXPORT_VERSION) {
    throw new ImportError(
      'That export was made by a newer version of Sparkboard. Update the app and try again.',
    );
  }
  if (!Array.isArray(data.sessions)) throw new ImportError('The export contains no sessions.');

  const bundles = data.sessions.map(normaliseBundle).filter((b): b is SessionBundle => b !== null);
  if (bundles.length === 0) throw new ImportError('The export contains no readable sessions.');
  return bundles;
}

function normaliseBundle(input: unknown): SessionBundle | null {
  if (!isRecord(input) || !isRecord(input.session)) return null;
  const now = Date.now();
  const raw = input.session;
  const sessionId = createId('ses');

  const session: Session = {
    id: sessionId,
    title: str(raw.title, 'Imported brainstorm').slice(0, 200),
    topic: str(raw.topic).slice(0, 2000),
    createdAt: num(raw.createdAt, now),
    updatedAt: num(raw.updatedAt, now),
    canvas: isRecord(raw.canvas)
      ? {
          panX: num(raw.canvas.panX, 0),
          panY: num(raw.canvas.panY, 0),
          zoom: Math.min(2, Math.max(0.3, num(raw.canvas.zoom, 1))),
        }
      : { panX: 0, panY: 0, zoom: 1 },
    lastView:
      raw.lastView === 'list' || raw.lastView === 'actions' ? raw.lastView : 'canvas',
  };

  // Old ids are remapped so imports can coexist with existing local data.
  const groupIdMap = new Map<string, string>();
  const groups: Group[] = asArray(input.groups).flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = createId('grp');
    if (typeof entry.id === 'string') groupIdMap.set(entry.id, id);
    return [
      {
        id,
        sessionId,
        name: str(entry.name, 'Group').slice(0, 120),
        color: normaliseColor(entry.color),
        collapsed: bool(entry.collapsed),
        createdAt: num(entry.createdAt, now),
      },
    ];
  });

  const ideaIdMap = new Map<string, string>();
  const ideas: Idea[] = asArray(input.ideas).flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const id = createId('idea');
    if (typeof entry.id === 'string') ideaIdMap.set(entry.id, id);
    const oldGroupId = typeof entry.groupId === 'string' ? entry.groupId : null;
    return [
      {
        id,
        sessionId,
        text: str(entry.text).slice(0, 5000),
        note: str(entry.note).slice(0, 20000),
        tags: asArray(entry.tags)
          .filter((t): t is string => typeof t === 'string')
          .map((t) => t.toLowerCase().slice(0, 32))
          .slice(0, 24),
        favorite: bool(entry.favorite),
        groupId: oldGroupId ? (groupIdMap.get(oldGroupId) ?? null) : null,
        color: normaliseColor(entry.color),
        x: num(entry.x, (index % 5) * 252),
        y: num(entry.y, Math.floor(index / 5) * 152),
        order: num(entry.order, index + 1),
        createdAt: num(entry.createdAt, now),
        updatedAt: num(entry.updatedAt, now),
      },
    ];
  });

  const actions: ActionItem[] = asArray(input.actions).flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const oldIdeaId = typeof entry.ideaId === 'string' ? entry.ideaId : null;
    return [
      {
        id: createId('act'),
        sessionId,
        ideaId: oldIdeaId ? (ideaIdMap.get(oldIdeaId) ?? null) : null,
        text: str(entry.text).slice(0, 2000),
        done: bool(entry.done),
        order: num(entry.order, index + 1),
        createdAt: num(entry.createdAt, now),
      },
    ];
  });

  return { session, ideas, groups, actions };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normaliseColor(value: unknown): Idea['color'] {
  return (IDEA_COLORS as readonly string[]).includes(value as string)
    ? (value as Idea['color'])
    : 'default';
}

export function exportFileName(title: string, extension: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'sparkboard';
  return `${slug}-${stamp}.${extension}`;
}
