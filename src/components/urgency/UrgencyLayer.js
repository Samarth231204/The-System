'use client';

import { useEffect, useState } from 'react';
import { theme } from '@/theme/tokens';

// Formats the time left as "2h 05m 09s", or "+1d 3h" for longer spans.
export function formatRemaining(ms) {
  const abs = Math.abs(ms);
  const s = Math.floor(abs / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${pad(m)}m ${pad(sec)}s`;
}

// Applies the urgency hue to the whole app, shows the countdown banner, and lists dismissible alerts.
export default function UrgencyLayer({ hue, urgency, banner, alerts }) {
  const [now, setNow] = useState(() => Date.now());
  const [hidden, setHidden] = useState([]);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--h', String(hue));
    // Motion speeds up as the deadline nears.
    root.setProperty('--spd', String(1 + urgency * 2));
    return () => {
      root.setProperty('--h', String(theme.BASE_HUE));
      root.setProperty('--spd', '1');
    };
  }, [hue, urgency]);

  useEffect(() => {
    if (!banner) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [banner]);

  async function dismiss(key) {
    setHidden((h) => [...h, key]);
    await fetch('/api/alerts/dismiss', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }).catch(() => {});
  }

  const visibleAlerts = alerts.filter((a) => !hidden.includes(a.key));

  return (
    <>
      {banner && (
        <div className={`sys-banner sys-banner--${banner.tone}`} role={banner.tone === 'overdue' ? 'alert' : 'status'}>
          <div>
            <div className="sys-eyebrow">{banner.headline}</div>
            <div className="sys-type-display">{banner.title}</div>
          </div>
          <div className="sys-xp" aria-live="off">
            {banner.tone === 'overdue'
              ? `Overdue by ${formatRemaining(now - new Date(banner.deadline).getTime())}`
              : `${formatRemaining(new Date(banner.deadline).getTime() - now)} left`}
          </div>
        </div>
      )}

      {visibleAlerts.map((a) => (
        <div key={a.key} className="sys-banner sys-banner--stagnation" role="status">
          <div>
            <div className="sys-eyebrow">Stagnation alert</div>
            <div className="sys-type-display">{a.title}</div>
            <div className="sys-small">{a.message}</div>
          </div>
          <button type="button" className="sys-btn sys-btn--ghost" onClick={() => dismiss(a.key)}>Dismiss</button>
        </div>
      ))}
    </>
  );
}
