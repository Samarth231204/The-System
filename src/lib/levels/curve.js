// Level curve: reaching level L needs a total of 50 x (L-1) x L XP.
// Level 2 at 100 XP, level 3 at 300, level 4 at 600, level 5 at 1000, and so on.
// Each level costs more than the last, so progress slows as you climb.
export function xpToReach(level) {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

export function levelFor(totalXp) {
  let level = 1;
  while (xpToReach(level + 1) <= totalXp) level += 1;
  return level;
}

// Describes where a total sits on the curve: current level, XP into it, XP needed for the next, and a 0 to 1 ratio.
export function progressFor(totalXp) {
  const level = levelFor(totalXp);
  const floor = xpToReach(level);
  const next = xpToReach(level + 1);
  const span = next - floor;
  const into = totalXp - floor;
  return { level, floor, next, into, span, ratio: Math.min(1, into / span) };
}

const TITLES = [
  { from: 1, title: 'Newbie' },
  { from: 3, title: 'Apprentice' },
  { from: 5, title: 'Adept' },
  { from: 7, title: 'Specialist' },
  { from: 10, title: 'Veteran' },
  { from: 15, title: 'Elite' },
  { from: 20, title: 'Legend' },
];

export function titleFor(level) {
  return [...TITLES].reverse().find((t) => level >= t.from).title;
}
