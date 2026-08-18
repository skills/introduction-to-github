import type { Group, Id, Idea } from './types';

export interface IdeaFilters {
  query: string;
  tags: string[];
  favoritesOnly: boolean;
  groupId: Id | 'ungrouped' | null;
}

export const emptyFilters: IdeaFilters = {
  query: '',
  tags: [],
  favoritesOnly: false,
  groupId: null,
};

export function hasActiveFilters(filters: IdeaFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.tags.length > 0 ||
    filters.favoritesOnly ||
    filters.groupId !== null
  );
}

/**
 * Free-text matching over an idea's text, note and tags. Deliberately simple:
 * every whitespace-separated term must appear somewhere, which behaves the way
 * people expect from a quick filter box without needing a search index.
 */
export function matchesQuery(idea: Idea, query: string, groups: Group[] = []): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const groupName = groups.find((g) => g.id === idea.groupId)?.name ?? '';
  const haystack = [idea.text, idea.note, groupName, ...idea.tags.map((t) => `#${t}`)]
    .join(' ')
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function filterIdeas(ideas: Idea[], filters: IdeaFilters, groups: Group[] = []): Idea[] {
  return ideas.filter((idea) => {
    if (filters.favoritesOnly && !idea.favorite) return false;
    if (filters.groupId === 'ungrouped' && idea.groupId !== null) return false;
    if (filters.groupId && filters.groupId !== 'ungrouped' && idea.groupId !== filters.groupId) {
      return false;
    }
    if (filters.tags.length > 0 && !filters.tags.every((tag) => idea.tags.includes(tag))) {
      return false;
    }
    return matchesQuery(idea, filters.query, groups);
  });
}

/** Tag vocabulary for the filter bar, most-used first. */
export function collectTags(ideas: Idea[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const idea of ideas) {
    for (const tag of idea.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
