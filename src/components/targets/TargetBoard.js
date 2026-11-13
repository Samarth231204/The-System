'use client';

import { useCallback, useEffect, useState } from 'react';
import Panel from '@/components/arcade/Panel';

function daysLabel(n) {
  if (n < 0) return `${Math.abs(n)} day${Math.abs(n) === 1 ? '' : 's'} overdue`;
  if (n === 0) return 'Due today';
  return `${n} day${n === 1 ? '' : 's'} left`;
}

export default function TargetBoard() {
  const [data, setData] = useState({ targets: [], balance: { totalXp: 0, spent: 0, balance: 0 } });
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState({ title: '', cost: 200, deadline: '' });

  const load = useCallback(async () => {
    const [tr, kr] = await Promise.all([fetch('/api/targets', { cache: 'no-store' }), fetch('/api/tasks', { cache: 'no-store' })]);
    const td = await tr.json().catch(() => ({}));
    const kd = await kr.json().catch(() => ({}));
    if (!tr.ok) setError(td.error || 'Could not load targets.');
    else setData(td);
    if (kr.ok) setTasks(kd.tasks.filter((t) => t.kind !== 'note'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function send(url, method, body) {
    setError('');
    setNotice('');
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error || 'Something went wrong.');
      return null;
    }
    return d;
  }

  async function create(e) {
    e.preventDefault();
    if (!draft.deadline) return setError('Pick a deadline.');
    const d = await send('/api/targets', 'POST', { title: draft.title, cost: Number(draft.cost), deadline: new Date(`${draft.deadline}T23:59:00`).toISOString() });
    if (d) {
      setData(d);
      setDraft({ title: '', cost: 200, deadline: '' });
      setNotice('Boss target set.');
    }
  }

  async function claim(id) {
    const d = await send(`/api/targets/${id}`, 'PATCH', { claim: true });
    if (d) {
      setData(d);
      setNotice('Target claimed. The XP is spent.');
    }
  }

  async function remove(id) {
    const res = await fetch(`/api/targets/${id}`, { method: 'DELETE' });
    if (!res.ok) return setError('Could not delete the target.');
    load();
  }

  async function toggleLink(target, taskId) {
    const next = target.taskIds.includes(taskId) ? target.taskIds.filter((x) => x !== taskId) : [...target.taskIds, taskId];
    const d = await send(`/api/targets/${target.id}`, 'PATCH', { taskIds: next });
    if (d) setData(d);
  }

  const { balance } = data;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Panel>
        <div className="sys-row" style={{ justifyContent: 'space-between' }}>
          <h2 className="sys-h2">XP wallet</h2>
          <span className="sys-xp">{balance.balance} XP available</span>
        </div>
        <p className="sys-small sys-muted">{balance.totalXp} XP earned in total, {balance.spent} spent on claimed targets. Levels still count all XP earned.</p>
      </Panel>

      <Panel>
        <h2 className="sys-h2">Set a boss target</h2>
        <form onSubmit={create} style={{ display: 'grid', gap: 12 }}>
          <div className="sys-field">
            <label className="sys-label" htmlFor="t-title">What do you want to defeat?</label>
            <input id="t-title" className="sys-input" maxLength={140} placeholder="Example: Get the freelance client to sign a retainer" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="sys-row" style={{ alignItems: 'flex-end' }}>
            <div className="sys-field" style={{ width: 160 }}>
              <label className="sys-label" htmlFor="t-cost">XP cost</label>
              <input id="t-cost" className="sys-input" type="number" min={1} value={draft.cost} onChange={(e) => setDraft((d) => ({ ...d, cost: e.target.value }))} />
            </div>
            <div className="sys-field" style={{ width: 200 }}>
              <label className="sys-label" htmlFor="t-deadline">Deadline</label>
              <input id="t-deadline" className="sys-input" type="date" value={draft.deadline} onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))} />
            </div>
            <button type="submit" className="sys-btn sys-btn--primary">Set target</button>
          </div>
        </form>
      </Panel>

      {error && <p role="alert" className="sys-error sys-small">{error}</p>}
      <div role="status" aria-live="polite" className="sys-small">{notice}</div>

      {data.targets.length === 0 && <Panel><p className="sys-muted">No boss targets yet. Set one above.</p></Panel>}

      {data.targets.map((t) => (
        <Panel key={t.id}>
          <div className="sys-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <h2 className="sys-h2" style={{ fontSize: 18 }}>{t.title}</h2>
              <div className="sys-small sys-muted">Cost {t.cost} XP · {new Date(t.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · {t.claimedAt ? 'Claimed' : daysLabel(t.daysLeft)}</div>
            </div>
            <div className="sys-row">
              {t.claimedAt
                ? <span className="sys-chip">Defeated</span>
                : <button className="sys-btn sys-btn--primary" disabled={!t.canClaim} onClick={() => claim(t.id)}>{t.canClaim ? 'Claim (spend XP)' : 'Need more XP'}</button>}
              <button className="sys-btn sys-btn--ghost" onClick={() => remove(t.id)}>Delete</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
            <div className="sys-small sys-muted">Timeline: set → deadline</div>
            <div className="sys-charge" role="img" aria-label={`${Math.round(t.timeline * 100)} percent of time used`}><i style={{ width: `${Math.round(t.timeline * 100)}%`, background: 'var(--deep)', boxShadow: 'none', borderRight: '2px solid var(--accent)' }} /></div>
            <div className="sys-small sys-muted">Quest progress: {Math.round(t.progress * 100)}% ({t.linked.filter((x) => x.status === 'done').length} of {t.linked.length} linked quests)</div>
            <div className="sys-charge" role="img" aria-label={`${Math.round(t.progress * 100)} percent of linked quests done`}><i style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
          </div>

          <details style={{ marginTop: 10 }}>
            <summary className="sys-small" style={{ cursor: 'pointer', color: 'var(--accent)' }}>Link quests ({t.taskIds.length})</summary>
            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
              {tasks.length === 0 && <span className="sys-small sys-muted">No quests yet. Add some in the quest log.</span>}
              {tasks.map((k) => (
                <label key={k.id} className="sys-row sys-small" style={{ gap: 8 }}>
                  <input type="checkbox" checked={t.taskIds.includes(k.id)} onChange={() => toggleLink(t, k.id)} disabled={Boolean(t.claimedAt)} />
                  <span>{k.title} {k.status === 'done' ? '· done' : ''}</span>
                </label>
              ))}
            </div>
          </details>
        </Panel>
      ))}
    </div>
  );
}
