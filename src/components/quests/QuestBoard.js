'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Panel from '@/components/arcade/Panel';

const KIND_LABEL = { quest: 'Daily quests', side: 'Side quests', note: 'Quick notes' };
const KIND_HELP = {
  quest: 'Today\'s main work. Each one can earn XP once the judge is connected.',
  side: 'Extra work outside the daily plan.',
  note: 'Quick thoughts and reminders. Notes do not earn XP.',
};

// Converts a Date to the value a datetime-local input expects, in the player's own time zone.
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDue(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function QuestBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ kind: 'quest', title: '', details: '', due: '' });
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const res = await fetch('/api/tasks', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Could not load quests.');
    else setTasks(data.tasks);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, [load]);

  async function addTask(e) {
    e.preventDefault();
    setError('');
    if (!draft.title.trim()) return setError('Give the quest a title.');
    const body = {
      kind: draft.kind,
      title: draft.title,
      details: draft.details,
      dueAt: draft.due ? new Date(draft.due).toISOString() : null,
    };
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Could not add quest.');
    setTasks((list) => [...list, data.task]);
    setDraft((d) => ({ ...d, title: '', details: '', due: '' }));
  }

  async function patch(id, fields) {
    setError('');
    const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Could not update quest.');
    setTasks((list) => list.map((t) => (t.id === id ? data.task : t)));
  }

  async function remove(id) {
    setError('');
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Could not delete.');
    setTasks((list) => list.filter((t) => t.id !== id));
  }

  const grouped = useMemo(() => {
    const groups = { quest: [], side: [], note: [] };
    for (const t of tasks) if (t.status === 'open') groups[t.kind].push(t);
    return groups;
  }, [tasks]);

  const doneToday = tasks.filter((t) => t.status === 'done');

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Panel>
        <h2 className="sys-h2">New entry</h2>
        <form onSubmit={addTask} style={{ display: 'grid', gap: 12 }}>
          <div className="sys-engine-grid" role="radiogroup" aria-label="Entry type">
            {['quest', 'side', 'note'].map((k) => (
              <button key={k} type="button" role="radio" aria-checked={draft.kind === k} className={`sys-engine${draft.kind === k ? ' is-chosen' : ''}`} onClick={() => setDraft((d) => ({ ...d, kind: k }))}>
                <span className="sys-type-display">{KIND_LABEL[k]}</span>
                <span className="sys-small sys-muted">{KIND_HELP[k]}</span>
              </button>
            ))}
          </div>
          <div className="sys-field">
            <label className="sys-label" htmlFor="q-title">Title</label>
            <input id="q-title" className="sys-input" maxLength={140} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="sys-field">
            <label className="sys-label" htmlFor="q-details">Details (optional)</label>
            <textarea id="q-details" className="sys-input" rows={2} maxLength={1000} value={draft.details} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} />
          </div>
          {draft.kind !== 'note' && (
            <div className="sys-field">
              <label className="sys-label" htmlFor="q-due">Due time (optional)</label>
              <input id="q-due" className="sys-input" type="datetime-local" value={draft.due} onChange={(e) => setDraft((d) => ({ ...d, due: e.target.value }))} />
            </div>
          )}
          <div className="sys-row">
            <button type="submit" className="sys-btn sys-btn--primary">Add to log</button>
          </div>
        </form>
      </Panel>

      {error && <p role="alert" className="sys-error sys-small">{error}</p>}
      {loading && <p className="sys-muted">Loading the quest log…</p>}

      {['quest', 'side', 'note'].map((kind) => (
        <Panel key={kind}>
          <h2 className="sys-h2">{KIND_LABEL[kind]} <span className="sys-small sys-muted">({grouped[kind].length} open)</span></h2>
          {!loading && grouped[kind].length === 0 && <p className="sys-muted sys-small">Nothing open here. Add an entry above.</p>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {grouped[kind].map((t) => {
              const overdue = t.dueAt && new Date(t.dueAt).getTime() < now;
              return (
                <li key={t.id} className="sys-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: `3px solid ${overdue ? 'var(--accent)' : 'var(--line)'}`, paddingLeft: 10 }}>
                  <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                    <div>{t.title}</div>
                    {t.details && <div className="sys-small sys-muted">{t.details}</div>}
                    {t.dueAt && <div className="sys-small" style={{ color: overdue ? '#ff6b8a' : undefined }}>{overdue ? 'Overdue · ' : 'Due · '}{formatDue(t.dueAt)}</div>}
                  </div>
                  <div className="sys-row">
                    {kind !== 'note' && <button className="sys-btn" onClick={() => patch(t.id, { status: 'done' })}>Complete</button>}
                    <button className="sys-btn sys-btn--ghost" onClick={() => remove(t.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}

      <Panel>
        <h2 className="sys-h2">Completed in the last 24 hours <span className="sys-small sys-muted">({doneToday.length})</span></h2>
        {doneToday.length === 0 && <p className="sys-muted sys-small">Nothing completed yet today.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {doneToday.map((t) => (
            <li key={t.id} className="sys-row" style={{ justifyContent: 'space-between', opacity: 0.7 }}>
              <span><s>{t.title}</s> <span className="sys-small sys-muted">· {KIND_LABEL[t.kind]}</span></span>
              <span className="sys-row">
                <button className="sys-btn sys-btn--ghost" onClick={() => patch(t.id, { status: 'open' })}>Reopen</button>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
