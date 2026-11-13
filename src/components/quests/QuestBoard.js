'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Panel from '@/components/arcade/Panel';
import { AI_KEY_STORAGE } from '@/components/onboarding/OnboardingFlow';

const KIND_LABEL = { quest: 'Daily quests', side: 'Side quests', note: 'Quick notes' };
const KIND_HELP = {
  quest: "Today's main work. Each one earns XP when completed.",
  side: 'Extra work outside the daily plan. Also earns XP.',
  note: 'Quick thoughts and reminders. Notes do not earn XP.',
};

function formatDue(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function readKey() {
  try {
    return localStorage.getItem(AI_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export default function QuestBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [draft, setDraft] = useState({ kind: 'quest', title: '', details: '', due: '' });
  const [now, setNow] = useState(() => Date.now());
  const [openJudge, setOpenJudge] = useState(null);
  const [overrides, setOverrides] = useState({});

  const load = useCallback(async () => {
    const res = await fetch('/api/tasks', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Could not load quests.');
    else setTasks(data.tasks);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch('/api/player', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d.player?.provider && setProvider(d.player.provider))
      .catch(() => {});
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

  async function complete(id) {
    setError('');
    setNotice('The judge is reading your work…');
    const res = await fetch(`/api/tasks/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: readKey(), provider }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice('');
      return setError(data.error || 'Could not complete quest.');
    }
    setTasks((list) => list.map((t) => (t.id === id ? data.task : t)));
    setOpenJudge(id);
    setNotice(`+${data.task.xpTotal} XP${data.note ? ` · ${data.note}` : ''}`);
  }

  async function patch(id, fields) {
    setError('');
    const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Could not update quest.');
    setTasks((list) => list.map((t) => (t.id === id ? data.task : t)));
    setOpenJudge(null);
    setNotice(fields.status === 'open' ? 'Quest reopened. Its XP was taken back.' : '');
  }

  async function remove(id) {
    setError('');
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Could not delete.');
    setTasks((list) => list.filter((t) => t.id !== id));
  }

  function openOverride(task) {
    setOverrides(Object.fromEntries(task.judgement.map((j) => [j.key, { score: j.score, reason: j.reason }])));
    setOpenJudge(openJudge === task.id ? null : task.id);
  }

  async function saveOverride(task) {
    setError('');
    const scores = task.judgement.map((j) => ({ key: j.key, score: Number(overrides[j.key]?.score ?? j.score), reason: overrides[j.key]?.reason ?? j.reason }));
    const res = await fetch(`/api/tasks/${task.id}/judgement`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scores }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Could not save the judgement.');
    setTasks((list) => list.map((t) => (t.id === task.id ? data.task : t)));
    setNotice(`Judgement saved. Now +${data.task.xpTotal} XP.`);
  }

  const grouped = useMemo(() => {
    const groups = { quest: [], side: [], note: [] };
    for (const t of tasks) if (t.status === 'open') groups[t.kind].push(t);
    return groups;
  }, [tasks]);

  const done = tasks.filter((t) => t.status === 'done');

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
            <label className="sys-label" htmlFor="q-details">Details (the judge reads these)</label>
            <textarea id="q-details" className="sys-input" rows={3} maxLength={1000} value={draft.details} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} />
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
      <div role="status" aria-live="polite" className="sys-small">{notice}</div>
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
                    {kind !== 'note' && <button className="sys-btn" onClick={() => complete(t.id)}>Complete</button>}
                    <button className="sys-btn sys-btn--ghost" onClick={() => remove(t.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}

      <Panel>
        <h2 className="sys-h2">Completed <span className="sys-small sys-muted">({done.length} in the last 24 hours)</span></h2>
        {done.length === 0 && <p className="sys-muted sys-small">Nothing completed yet today.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {done.map((t) => (
            <li key={t.id} style={{ display: 'grid', gap: 8, padding: 10, border: '1px solid var(--line)', background: 'var(--deep)' }}>
              <div className="sys-row" style={{ justifyContent: 'space-between' }}>
                <span><s>{t.title}</s> <span className="sys-small sys-muted">· {KIND_LABEL[t.kind]}</span></span>
                <span className="sys-row">
                  {t.kind !== 'note' && <span className="sys-xp">+{t.xpTotal} XP</span>}
                  {t.kind !== 'note' && t.judgement.length > 0 && <button className="sys-btn sys-btn--ghost" onClick={() => openOverride(t)}>{openJudge === t.id ? 'Hide judgement' : 'Judgement'}</button>}
                  <button className="sys-btn sys-btn--ghost" onClick={() => patch(t.id, { status: 'open' })}>Reopen</button>
                </span>
              </div>
              {openJudge === t.id && t.judgement.length > 0 && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div className="sys-small sys-muted">Judged by {t.judgedBy === 'ai' ? 'your AI engine' : t.judgedBy === 'override' ? 'you (overridden)' : 'this device'}.</div>
                  {t.judgement.map((j) => (
                    <div key={j.key} className="sys-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                        <div><strong>{j.label}</strong> · weight {j.weight} · <span className="sys-xp">+{j.amount} XP</span></div>
                        <div className="sys-small sys-muted">{j.reason}</div>
                      </div>
                      <div className="sys-row" style={{ alignItems: 'flex-end' }}>
                        <div className="sys-field" style={{ width: 84 }}>
                          <label className="sys-label" htmlFor={`s-${t.id}-${j.key}`}>Score 0–10</label>
                          <input id={`s-${t.id}-${j.key}`} className="sys-input" type="number" min={0} max={10} value={overrides[j.key]?.score ?? j.score} onChange={(e) => setOverrides((o) => ({ ...o, [j.key]: { ...o[j.key], score: e.target.value } }))} />
                        </div>
                        <div className="sys-field" style={{ width: 200 }}>
                          <label className="sys-label" htmlFor={`r-${t.id}-${j.key}`}>Reason</label>
                          <input id={`r-${t.id}-${j.key}`} className="sys-input" maxLength={240} value={overrides[j.key]?.reason ?? j.reason} onChange={(e) => setOverrides((o) => ({ ...o, [j.key]: { ...o[j.key], reason: e.target.value } }))} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="sys-row"><button className="sys-btn sys-btn--primary" onClick={() => saveOverride(t)}>Save judgement</button></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
