'use client';

import { useEffect, useState } from 'react';
import Panel from '@/components/arcade/Panel';
import AvatarArt from '@/components/avatars/AvatarArt';
import { AVATARS } from '@/lib/avatars';
import { AI_KEY_STORAGE } from '@/components/onboarding/OnboardingFlow';

export default function ProfileForm({ initial }) {
  const [form, setForm] = useState({
    playerName: initial.playerName || '',
    purpose: initial.purpose || '',
    avatarId: initial.avatarId,
    provider: initial.provider,
    goals: initial.goals || '',
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    try {
      setHasKey(Boolean(localStorage.getItem(AI_KEY_STORAGE)));
    } catch {}
  }, []);

  async function save(fields) {
    setError('');
    setStatus('Saving…');
    const res = await fetch('/api/player', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus('');
      setError(data.error || 'Could not save.');
      return false;
    }
    setStatus('Saved');
    return true;
  }

  function saveKey(value) {
    try {
      if (value.trim()) localStorage.setItem(AI_KEY_STORAGE, value.trim());
      else localStorage.removeItem(AI_KEY_STORAGE);
      setHasKey(Boolean(value.trim()));
      setKeyInput('');
      setStatus(value.trim() ? 'Key saved in this browser' : 'Key removed from this browser');
    } catch {
      setError('This browser would not save the key.');
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="sys-stack" style={{ display: 'grid', gap: 18 }}>
      <Panel>
        <h2 className="sys-h2">Identity</h2>
        <div className="sys-field">
          <label className="sys-label" htmlFor="p-name">Player name</label>
          <input id="p-name" className="sys-input" maxLength={24} value={form.playerName} onChange={(e) => update('playerName', e.target.value)} />
        </div>
        <div className="sys-field">
          <label className="sys-label" htmlFor="p-purpose">Purpose (bio)</label>
          <textarea id="p-purpose" className="sys-input" rows={3} maxLength={160} value={form.purpose} onChange={(e) => update('purpose', e.target.value)} />
        </div>
        <div className="sys-row" style={{ gap: 14 }}>
          <button type="button" className="sys-btn sys-btn--primary" onClick={() => save({ playerName: form.playerName, purpose: form.purpose })}>
            Save identity
          </button>
        </div>
      </Panel>

      <Panel>
        <h2 className="sys-h2">Class</h2>
        <div className="sys-avatar-grid" role="radiogroup" aria-label="Choose your class">
          {AVATARS.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={form.avatarId === a.id} className={`sys-avatar-card${form.avatarId === a.id ? ' is-chosen' : ''}`} onClick={() => { update('avatarId', a.id); save({ avatarId: a.id }); }}>
              <AvatarArt id={a.id} size={56} />
              <span className="sys-type-display">{a.name}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="sys-h2">Goals</h2>
        <div className="sys-field">
          <label className="sys-label" htmlFor="p-goals">Goals</label>
          <textarea id="p-goals" className="sys-input" rows={5} maxLength={1000} value={form.goals} onChange={(e) => update('goals', e.target.value)} />
        </div>
        <p className="sys-small sys-muted">Changing goals does not change XP criteria yet. Criteria are set in Phase 5.</p>
        <div className="sys-row">
          <button type="button" className="sys-btn sys-btn--primary" onClick={() => save({ goals: form.goals })}>Save goals</button>
        </div>
      </Panel>

      <Panel>
        <h2 className="sys-h2">AI engine</h2>
        <div className="sys-engine-grid" role="radiogroup" aria-label="AI provider">
          {[['gemini', 'Gemini'], ['claude', 'Claude'], ['openai', 'OpenAI']].map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={form.provider === id} className={`sys-engine${form.provider === id ? ' is-chosen' : ''}`} onClick={() => { update('provider', id); save({ provider: id }); }}>
              <span className="sys-type-display">{label}</span>
            </button>
          ))}
        </div>
        <div className="sys-field">
          <label className="sys-label" htmlFor="p-key">{hasKey ? 'Key saved in this browser. Paste a new one to replace it.' : 'No key saved in this browser.'}</label>
          <input id="p-key" className="sys-input" type="password" autoComplete="off" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Paste API key" />
        </div>
        <div className="sys-row">
          <button type="button" className="sys-btn sys-btn--primary" disabled={!keyInput.trim()} onClick={() => saveKey(keyInput)}>Save key here</button>
          <button type="button" className="sys-btn sys-btn--ghost" disabled={!hasKey} onClick={() => saveKey('')}>Remove key</button>
        </div>
        <p className="sys-small sys-muted">Keys stay in this browser and are never stored on the server.</p>
      </Panel>

      <div role="status" aria-live="polite" className="sys-small">{status}</div>
      {error && <p role="alert" className="sys-error sys-small">{error}</p>}
    </div>
  );
}
