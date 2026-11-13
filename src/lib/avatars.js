// Eight original character archetypes. Each has a class title and a short line.
// Artwork lives in src/components/avatars/AvatarArt.js and is keyed by id.
export const AVATARS = [
  { id: 'alchemist', name: 'Alchemist', title: 'Keeper of Transmutations', blurb: 'Turns raw effort into gold, one experiment at a time.' },
  { id: 'magician', name: 'Magician', title: 'Weaver of Spells', blurb: 'Sees patterns in the work that others miss.' },
  { id: 'ruler', name: 'Ruler', title: 'Sovereign of Deadlines', blurb: 'Keeps every promise and every calendar in order.' },
  { id: 'joker', name: 'Joker', title: 'Trickster of Routine', blurb: 'Makes the dull tasks fun enough to finish.' },
  { id: 'knight', name: 'Knight', title: 'Vanguard of Discipline', blurb: 'Shows up on the days nobody is watching.' },
  { id: 'rogue', name: 'Rogue', title: 'Shadow of Side Quests', blurb: 'Quietly clears the work nobody else remembers.' },
  { id: 'oracle', name: 'Oracle', title: 'Seer of Targets', blurb: 'Plans far ahead and reads the road to each goal.' },
  { id: 'engineer', name: 'Engineer', title: 'Architect of Systems', blurb: 'Builds the machinery that makes progress automatic.' },
];

export const AVATAR_IDS = AVATARS.map((a) => a.id);

export function findAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[1];
}
