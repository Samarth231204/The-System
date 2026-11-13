'use client';

import { useEffect, useState } from 'react';
import { theme, hueForUrgency } from '@/theme/tokens';

// Development-only control to preview the urgency colour shift.
// It changes --h and --spd on <html> for this browser tab only.
export default function HueTuner() {
  const [u, setU] = useState(0);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--h', hueForUrgency(u / 100).toFixed(1));
    root.setProperty('--spd', (1 - 0.65 * (u / 100)).toFixed(2));
    return () => {
      root.setProperty('--h', String(theme.BASE_HUE));
      root.setProperty('--spd', '1');
    };
  }, [u]);

  const label = u === 0 ? 'Calm (blue)' : u < 50 ? 'Warning (blue to purple)' : u < 100 ? 'Close (purple to red)' : 'Critical (red)';

  return (
    <div className="sys-field">
      <label className="sys-label" htmlFor="hue-tuner">
        Urgency preview: {u}% · {label}
      </label>
      <input id="hue-tuner" type="range" min="0" max="100" value={u} onChange={(e) => setU(Number(e.target.value))} />
    </div>
  );
}
