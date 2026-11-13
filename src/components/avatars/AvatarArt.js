// Original character portraits drawn in a game and anime style.
// Each shares one face and shoulder silhouette; the headgear, hair and accessory
// make each class recognisable. Colours come from currentColor, so the art follows the theme.

const FACE = (
  <>
    <path d="M10 60c2-14 10-22 22-22s20 8 22 22" />
    <path d="M14 60v4c0 6 8 8 18 8s18-2 18-8v-4" />
    <path d="M24 34c0-7 4-12 8-12s8 5 8 12v6c0 6-4 11-8 11s-8-5-8-11z" />
    <path d="M27 38h2M35 38h2" />
    <path d="M28 45c2 1.5 5 1.5 7 0" />
  </>
);

const ART = {
  alchemist: (
    <>
      <path d="M22 18h14v8l6 12c2 4 0 8-4 8H20c-4 0-6-4-4-8l6-12z" />
      <path d="M22 18h14" />
      <circle cx="28" cy="32" r="2" />
      <path d="M14 30c-4 6-2 12 2 14" />
      {FACE}
    </>
  ),
  magician: (
    <>
      <path d="M16 26 30 2l14 24z" />
      <path d="M14 26h32" />
      <path d="M30 10l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      {FACE}
    </>
  ),
  ruler: (
    <>
      <path d="M18 24l4-12 4 6 4-8 4 8 4-6 4 12z" />
      <path d="M18 24h24" />
      <path d="M10 62c2-14 10-22 22-22s20 8 22 22" fill="none" />
      <path d="M8 60c0 6 4 4 8 2M52 60c0 6-4 4-8 2" />
      {FACE}
    </>
  ),
  joker: (
    <>
      <path d="M20 22 14 10M28 20 28 6M38 22l6-12" />
      <circle cx="14" cy="8" r="2.5" />
      <circle cx="28" cy="4" r="2.5" />
      <circle cx="44" cy="8" r="2.5" />
      <path d="M22 24c4-2 12-2 16 0" />
      {FACE}
      <path d="M22 44c2 2 8 2 12 0" />
    </>
  ),
  knight: (
    <>
      <path d="M22 30c0-10 4-18 10-18s10 8 10 18" />
      <path d="M22 32h20" />
      <path d="M30 8c6-4 10 0 8 4" />
      <path d="M24 36h12" />
      <path d="M32 6v6" />
      {FACE}
    </>
  ),
  rogue: (
    <>
      <path d="M18 34c0-14 6-22 14-22s14 8 14 22v4H18z" />
      <path d="M22 36h20" />
      <path d="M38 52 56 40M54 38l4-2" />
      {FACE}
    </>
  ),
  oracle: (
    <>
      <ellipse cx="32" cy="10" rx="14" ry="3" />
      <path d="M18 14c-4 14-4 30 0 40" />
      <path d="M46 14c4 14 4 30 0 40" />
      <path d="M26 6c2-2 10-2 12 0" />
      {FACE}
    </>
  ),
  engineer: (
    <>
      <path d="M18 26c0-10 6-16 14-16s14 6 14 16z" />
      <rect x="16" y="26" width="32" height="5" rx="2" />
      <circle cx="24" cy="30" r="3" />
      <circle cx="40" cy="30" r="3" />
      <path d="M27 30h10" />
      {FACE}
      <path d="M46 52l8-8" />
    </>
  ),
};

export default function AvatarArt({ id, size = 64, title }) {
  const art = ART[id] || ART.magician;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      {art}
    </svg>
  );
}
