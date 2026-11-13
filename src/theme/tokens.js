// Single source of truth for The System's look and feel.
// Every accent colour in the app is derived from one hue (--h in CSS),
// so changing BASE_HUE here recolours the whole interface.

export const theme = {
  // Accent hue on the OKLCH colour wheel. 258 is the default dark blue.
  BASE_HUE: 258,

  // Hue stops for the urgency gradient (used from Phase 9).
  // Values above 360 wrap round the wheel, so 385 is a red reached by
  // travelling through purple rather than back through green.
  URGENCY_HUES: {
    calm: 258, // dark blue
    warning: 305, // purple
    critical: 385, // red
  },

  // Orange-red tint used when boss targets have stalled (Phase 9).
  STAGNATION_HUE: 405,

  fonts: {
    display: "'Bungee', 'Chakra Petch', Impact, sans-serif",
    body: "'Chakra Petch', 'Trebuchet MS', system-ui, sans-serif",
    googleHref:
      'https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@500;600;700&display=swap',
  },

  // Motion timings in seconds. Tune the feel of the app here.
  motion: {
    floorLoop: 1.2,
    tickerLoop: 22,
    glitchA: 1.7,
    glitchB: 2.2,
    barStripes: 0.7,
    panelEnter: 0.5,
  },
};

// Interpolates the accent hue for an urgency value from 0 to 1.
export function hueForUrgency(u) {
  const { calm, warning, critical } = theme.URGENCY_HUES;
  const x = Math.max(0, Math.min(1, u));
  return x <= 0.5 ? calm + (warning - calm) * (x / 0.5) : warning + (critical - warning) * ((x - 0.5) / 0.5);
}

// CSS custom properties applied to <html>, generated from the tokens above.
export function rootStyle() {
  const m = theme.motion;
  return {
    '--h': theme.BASE_HUE,
    '--spd': 1,
    '--font-display': theme.fonts.display,
    '--font-body': theme.fonts.body,
    '--t-floor': `${m.floorLoop}s`,
    '--t-ticker': `${m.tickerLoop}s`,
    '--t-glitch-a': `${m.glitchA}s`,
    '--t-glitch-b': `${m.glitchB}s`,
    '--t-stripes': `${m.barStripes}s`,
    '--t-enter': `${m.panelEnter}s`,
  };
}
