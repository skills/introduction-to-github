import { describe, expect, it } from 'vitest';
import { createGroup, createIdea, createSession } from '../factories';
import { collectTags, emptyFilters, filterIdeas, hasActiveFilters, matchesQuery } from '../search';

const session = createSession();
const group = createGroup(session.id, { name: 'Pricing' });
const ideas = [
  createIdea(session.id, { text: 'Freemium tier', tags: ['pricing'], favorite: true, groupId: group.id }),
  createIdea(session.id, { text: 'Annual discount', note: 'Two months free', tags: ['pricing', 'growth'] }),
  createIdea(session.id, { text: 'Referral programme', tags: ['growth'] }),
];

describe('search', () => {
  it('matches across text, notes and tags', () => {
    expect(matchesQuery(ideas[1]!, 'two months')).toBe(true);
    expect(matchesQuery(ideas[1]!, '#growth')).toBe(true);
    expect(matchesQuery(ideas[1]!, 'freemium')).toBe(false);
  });

  it('requires every term to appear', () => {
    expect(matchesQuery(ideas[1]!, 'annual discount')).toBe(true);
    expect(matchesQuery(ideas[1]!, 'annual referral')).toBe(false);
  });

  it('matches the group name', () => {
    expect(matchesQuery(ideas[0]!, 'pricing', [group])).toBe(true);
  });

  it('filters by favourite, tag and group together', () => {
    expect(filterIdeas(ideas, { ...emptyFilters, favoritesOnly: true })).toHaveLength(1);
    expect(filterIdeas(ideas, { ...emptyFilters, tags: ['growth'] })).toHaveLength(2);
    expect(filterIdeas(ideas, { ...emptyFilters, tags: ['growth', 'pricing'] })).toHaveLength(1);
    expect(filterIdeas(ideas, { ...emptyFilters, groupId: group.id })).toHaveLength(1);
    expect(filterIdeas(ideas, { ...emptyFilters, groupId: 'ungrouped' })).toHaveLength(2);
  });

  it('reports when filters are active', () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false);
    expect(hasActiveFilters({ ...emptyFilters, query: ' ' })).toBe(false);
    expect(hasActiveFilters({ ...emptyFilters, query: 'x' })).toBe(true);
  });

  it('ranks tags by use', () => {
    expect(collectTags(ideas)).toEqual([
      { tag: 'growth', count: 2 },
      { tag: 'pricing', count: 2 },
    ]);
  });
});
