'use client';

import { useEffect, useState } from 'react';
import Panel from '@/components/arcade/Panel';
import { AI_KEY_STORAGE } from '@/components/onboarding/OnboardingFlow';

export default function RubricEditor() {
  const [rubric, setRubric] = useState(null);
  const [draft, setDraft] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/rubric', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || 'Could not load XP design.');
      setRubric(data.rubric);
      setDraft(data.rubric?.parameters || []);
    })();
    try {
      setHasKey(Boolean(localStorage.getItem(AI_KEY_STORAGE)));
    } catch {}
  }, []);

  function edit(i, field, value) {
    setDraft((list) => list.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function remove(i) {
    setDraft((list) => list.filter((_, idx) => idx !== i));
  }

  function add() {
    if (draft.length >= 6) return setError('Six parameters is the maximum.');
    setDraft((list) => [...list, { key: '', label: 'New parameter', weight: 2, description: '' }]);
  }

  async function save() {
    setBusy(true);
    setError('');
    setStatus('Saving…');
    const res = await fetch('/api/rubric', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters: draft.map(({ label, weight, description, key }) => ({ label, weight: Number(weight), description, key })) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setStatus('');
      return setError(data.error || 'Could not save.');
    }
    setRubric(data.rubric);
    setDraft(data.rubric.parameters);
    setStatus('XP design saved');
  }

  async function regenerate() {
    setBusy(true);
    setError('');
    setStatus('Designing parameters from your goals…');
    let apiKey = '';
    try {
      apiKey = localStorage.getItem(AI_KEY_STORAGE) || '';
    } catch {}
    const playerRes = await fetch('/api/player', { cache: 'no-store' });
    const playerData = await playerRes.json().catch(() => ({}));
    const provider = playerData.player?.provider || 'gemini';

    const res = await fetch('/api/rubric/design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setStatus('');
      return setError(data.error || 'Could not design XP parameters.');
    }
    setRubric(data.rubric);
    setDraft(data.rubric.parameters);
    setStatus(data.note || (data.rubric.source === 'ai' ? 'Designed by your AI engine' : 'Designed on this device'));
  }

  const total = draft.reduce((n, p) => n + Number(p.weight || 0), 0);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Panel>
        <div className="sys-row" style={{ justifyContent: 'space-between' }}>
          <h2 className="sys-h2">Parameters</h2>
          <span className="sys-small sys-muted">Source: {rubric ? (rubric.source === 'ai' ? 'AI engine' : rubric.source === 'manual' ? 'edited by hand' : 'on-device') : 'not designed yet'}</span>
        </div>
        <p className="sys-small sys-muted">
          Each completed quest earns XP split across these parameters by weight. {hasKey ? 'Your saved key will be used to design parameters.' : 'No key is saved in this browser, so the design runs on this device.'}
        </p>

        {draft.length === 0 && <p className="sys-muted">No parameters yet. Regenerate below or add one.</p>}

        <div style={{ display: 'grid', gap: 12 }}>
          {draft.map((p, i) => (
            <div key={i} style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid var(--line)', background: 'var(--deep)' }}>
              <div className="sys-row" style={{ alignItems: 'flex-end' }}>
                <div className="sys-field" style={{ flex: '1 1 180px' }}>
                  <label className="sys-label" htmlFor={`p${i}-label`}>Name</label>
                  <input id={`p${i}-label`} className="sys-input" maxLength={40} value={p.label} onChange={(e) => edit(i, 'label', e.target.value)} />
                </div>
                <div className="sys-field" style={{ width: 110 }}>
                  <label className="sys-label" htmlFor={`p${i}-weight`}>Weight (1–5)</label>
                  <input id={`p${i}-weight`} className="sys-input" type="number" min={1} max={5} value={p.weight} onChange={(e) => edit(i, 'weight', e.target.value)} />
                </div>
                <button type="button" className="sys-btn sys-btn--ghost" onClick={() => remove(i)}>Remove</button>
              </div>
              <div className="sys-field">
                <label className="sys-label" htmlFor={`p${i}-desc`}>What earns XP here</label>
                <input id={`p${i}-desc`} className="sys-input" maxLength={240} value={p.description} onChange={(e) => edit(i, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="sys-row" style={{ marginTop: 12 }}>
          <button type="button" className="sys-btn" onClick={add} disabled={busy}>Add parameter</button>
          <button type="button" className="sys-btn sys-btn--primary" onClick={save} disabled={busy || draft.length < 2}>Save XP design</button>
          <button type="button" className="sys-btn" onClick={regenerate} disabled={busy}>Regenerate from goals</button>
        </div>
        <p className="sys-small sys-muted">Total weight: {total}. Weights set the split of XP between parameters.</p>
      </Panel>

      <div role="status" aria-live="polite" className="sys-small">{status}</div>
      {error && <p role="alert" className="sys-error sys-small">{error}</p>}
    </div>
  );
}
