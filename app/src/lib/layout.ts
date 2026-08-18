import type { Idea } from './types';

export const CARD_WIDTH = 232;
export const CARD_HEIGHT = 120;
const GAP = 20;

/** Lower is a more desirable direction to grow the board in. */
function cost({ dx, dy }: { dx: number; dy: number }): number {
  return Math.abs(dx) * 1.6 + Math.abs(dy) + (dy < 0 ? 3 : 0) + (dx < 0 ? 2 : 0);
}

function overlaps(ax: number, ay: number, bx: number, by: number): boolean {
  return (
    Math.abs(ax - bx) < CARD_WIDTH + GAP && Math.abs(ay - by) < CARD_HEIGHT + GAP
  );
}

/**
 * Finds an empty spot near `preferred`, walking outwards in a square spiral.
 * Quick capture leans on this heavily: ideas must never land on top of each
 * other, but they should still cluster near where the user was looking.
 */
export function findFreePosition(
  ideas: Idea[],
  preferred: { x: number; y: number },
): { x: number; y: number } {
  const stepX = CARD_WIDTH + GAP;
  const stepY = CARD_HEIGHT + GAP;
  const taken = ideas.map((idea) => ({ x: idea.x, y: idea.y }));

  const isFree = (x: number, y: number) => !taken.some((p) => overlaps(x, y, p.x, p.y));
  if (isFree(preferred.x, preferred.y)) return { x: preferred.x, y: preferred.y };

  for (let ring = 1; ring <= 24; ring++) {
    const candidates: Array<{ dx: number; dy: number }> = [];
    for (let dx = -ring; dx <= ring; dx++) {
      for (let dy = -ring; dy <= ring; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === ring) candidates.push({ dx, dy });
      }
    }
    // Prefer growing downwards, then to the right. On a phone-width board that
    // keeps a fresh capture on screen instead of pushing it off the left edge.
    candidates.sort((a, b) => cost(a) - cost(b));
    for (const { dx, dy } of candidates) {
      const x = preferred.x + dx * stepX;
      const y = preferred.y + dy * stepY;
      if (isFree(x, y)) return { x, y };
    }
  }
  // Extremely dense board: fall back to a deterministic offset below everything.
  const lowest = taken.reduce((max, p) => Math.max(max, p.y), preferred.y);
  return { x: preferred.x, y: lowest + stepY };
}

/** Tidies the board into a responsive grid, preserving current order. */
export function gridLayout(ideas: Idea[], columns: number): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const cols = Math.max(1, columns);
  ideas.forEach((idea, index) => {
    positions.set(idea.id, {
      x: (index % cols) * (CARD_WIDTH + GAP),
      y: Math.floor(index / cols) * (CARD_HEIGHT + GAP),
    });
  });
  return positions;
}

/** Bounding box of a set of cards, used to frame groups and to fit-to-screen. */
export function boundsOf(ideas: Idea[]): { x: number; y: number; width: number; height: number } {
  if (ideas.length === 0) return { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT };
  const minX = Math.min(...ideas.map((i) => i.x));
  const minY = Math.min(...ideas.map((i) => i.y));
  const maxX = Math.max(...ideas.map((i) => i.x + CARD_WIDTH));
  const maxY = Math.max(...ideas.map((i) => i.y + CARD_HEIGHT));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
