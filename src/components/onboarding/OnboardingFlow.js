'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TypeWriter from './TypeWriter';
import AvatarArt from '@/components/avatars/AvatarArt';
import { AVATARS, findAvatar } from '@/lib/avatars';

export const AI_KEY_STORAGE = 'ts.aiKey';

const ENGINES = [
  { id: 'gemini', name: 'Gemini', note: 'Free tier available. Recommended to start.', guide: [
    'Open Google AI Studio and sign in with your Google account.',
    'Choose Get API key, then Create API key.',
    'Copy the key and paste it into the field.',
  ] },
  { id: 'claude', name: 'Claude', note: 'Needs an Anthropic Console account with credit.', guide: [
    'Open the Claude Console at console.anthropic.com and sign in.',
    'Add credit under Billing, then open API keys and create a key.',
    'Copy the key and paste it into the field.',
  ] },
  { id: 'openai', name: 'OpenAI', note: 'Needs an OpenAI platform account with billing set up.', guide: [
    'Open platform.openai.com and sign in.',
    'Add billing under Settings, then create a secret key under API keys.',
    'Copy the key and paste it into the field.',
  ] },
];

const STEPS = ['boot', 'name', 'purpose', 'avatar', 'engine', 'goals', 'enter'];

const PROMPTS = {
  name: 'Identify yourself. What shall the System call you?',
  purpose: 'State your purpose. Why do you play?',
  avatar: 'Select your class.',
  engine: 'Connect your judge. The engine that reads your work runs on your own key.',
  goals: 'Describe your goals. The System will design the criteria that earn XP.',
};

// Scrambles a masked preview of the key so typing it feels like a hack in progress.
function useScramble(value) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!value) {
      setShown('');
      return;
    }
    const chars = '█▓▒░#%&*+=<>';
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const masked = value.slice(-4).padStart(Math.min(value.length, 12), '•');
      setShown(
        masked
          .split('')
          .map((c, i) => (frame < 6 && i < 8 ? chars[(frame + i) % chars.length] : c))
          .join('')
      );
      if (frame >= 8) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [value]);
  return shown;
}

export default function OnboardingFlow({ initial }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [transition, setTransition] = useState('');
  const [name, setName] = useState(initial.playerName || '');
  const [purpose, setPurpose] = useState(initial.purpose || '');
  const [avatarId, setAvatarId] = useState(initial.avatarId || 'magician');
  const [provider, setProvider] = useState(initial.provider || 'gemini');
  const [aiKey, setAiKey] = useState('');
  const [goals, setGoals] = useState(initial.goals || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [promptDone, setPromptDone] = useState(false);
  const scrambled = useScramble(aiKey);

  // The key is kept in this browser only. It is never sent to or stored by the server here.
  useEffect(() => {
    try {
      setAiKey(localStorage.getItem(AI_KEY_STORAGE) || '');
    } catch {}
  }, []);

  const current = STEPS[step];
  const engine = ENGINES.find((e) => e.id === provider) || ENGINES[0];
  const avatar = findAvatar(avatarId);

  const go = useCallback((next) => {
    setError('');
    setPromptDone(false);
    setTransition('out');
    setTimeout(() => {
      setStep(next);
      setTransition('in');
    }, 320);
  }, []);

  async function save(fields) {
    setBusy(true);
    setError('');
    const res = await fetch('/api/player', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Could not save. Try again.');
      return false;
    }
    return true;
  }

  async function next() {
    if (current === 'name') {
      if (!name.trim()) return setError('Enter a player name to continue.');
      if (!(await save({ playerName: name }))) return;
    }
    if (current === 'purpose') {
      if (!(await save({ purpose }))) return;
    }
    if (current === 'avatar') {
      if (!(await save({ avatarId }))) return;
    }
    if (current === 'engine') {
      if (!(await save({ provider }))) return;
      try {
        if (aiKey.trim()) localStorage.setItem(AI_KEY_STORAGE, aiKey.trim());
        else localStorage.removeItem(AI_KEY_STORAGE);
      } catch {
        setError('This browser would not save the key. Check that storage is allowed.');
        return;
      }
    }
    if (current === 'goals') {
      if (!(await save({ goals }))) return;
    }
    go(step + 1);
  }

  async function finish() {
    if (await save({ onboarded: true })) {
      router.replace('/dashboard');
      router.refresh();
    }
  }

  function back() {
    if (step > 1) go(step - 1);
  }

  const stepBar = useMemo(
    () => (
      <div className="sys-steps" aria-label={`Step ${Math.max(step, 1)} of ${STEPS.length - 2}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} className={step >= n ? 'on' : ''} />
        ))}
      </div>
    ),
    [step]
  );

  return (
    <div className="sys-onb">
      <div className={`sys-onb-panel sys-onb-${transition || 'in'}`} key={current}>
        {current === 'boot' && (
          <section className="sys-panel sys-boot" style={{ textAlign: 'center', alignItems: 'center', gap: 22 }}>
            <div className="sys-eyebrow">System initialising</div>
            <h1 className="sys-glitch sys-glitch--big" data-text="THE SYSTEM">
              THE SYSTEM
            </h1>
            <p className="sys-muted">
              <TypeWriter text="Your life, rendered as a game. Clear quests, earn XP, claim what you have earned." speed={18} onDone={() => setPromptDone(true)} />
            </p>
            <button className="sys-btn sys-btn--primary sys-blink" onClick={() => go(1)}>
              Press start
            </button>
          </section>
        )}

        {current === 'name' && (
          <section className="sys-panel" style={{ gap: 18 }}>
            {stepBar}
            <p className="sys-prompt">
              <TypeWriter text={PROMPTS.name} speed={22} />
            </p>
            <div className="sys-field">
              <label className="sys-label" htmlFor="onb-name">Player name</label>
              <input id="onb-name" className="sys-input sys-type-display" maxLength={24} value={name} autoComplete="off" onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="sys-card-preview" aria-live="polite">
              <AvatarArt id={avatarId} size={56} />
              <div>
                <div className="sys-type-display sys-flicker">{name || 'Unnamed player'}</div>
                <div className="sys-small sys-muted">{avatar.title}</div>
              </div>
            </div>
          </section>
        )}

        {current === 'purpose' && (
          <section className="sys-panel" style={{ gap: 18 }}>
            {stepBar}
            <p className="sys-prompt">
              <TypeWriter text={PROMPTS.purpose} speed={22} />
            </p>
            <div className="sys-field">
              <label className="sys-label" htmlFor="onb-purpose">Purpose (your bio)</label>
              <textarea id="onb-purpose" className="sys-input sys-type-display" rows={3} maxLength={160} value={purpose} onChange={(e) => setPurpose(e.target.value)} autoFocus />
              <div className="sys-charge" aria-hidden="true"><i style={{ width: `${Math.round((purpose.length / 160) * 100)}%` }} /></div>
              <span className="sys-small sys-muted">{purpose.length} / 160</span>
            </div>
          </section>
        )}

        {current === 'avatar' && (
          <section className="sys-panel" style={{ gap: 18 }}>
            {stepBar}
            <p className="sys-prompt">
              <TypeWriter text={PROMPTS.avatar} speed={22} />
            </p>
            <div className="sys-avatar-grid" role="radiogroup" aria-label="Choose your class">
              {AVATARS.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={avatarId === a.id}
                  className={`sys-avatar-card${avatarId === a.id ? ' is-chosen' : ''}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                  onClick={() => setAvatarId(a.id)}
                >
                  <AvatarArt id={a.id} size={64} />
                  <span className="sys-type-display">{a.name}</span>
                </button>
              ))}
            </div>
            <div className="sys-card-preview">
              <AvatarArt id={avatarId} size={48} />
              <div>
                <div className="sys-type-display">{avatar.title}</div>
                <div className="sys-small sys-muted">{avatar.blurb}</div>
              </div>
            </div>
          </section>
        )}

        {current === 'engine' && (
          <section className="sys-panel" style={{ gap: 16 }}>
            {stepBar}
            <p className="sys-prompt">
              <TypeWriter text={PROMPTS.engine} speed={18} />
            </p>
            <div className="sys-engine-grid" role="radiogroup" aria-label="AI provider">
              {ENGINES.map((e) => (
                <button key={e.id} type="button" role="radio" aria-checked={provider === e.id} className={`sys-engine${provider === e.id ? ' is-chosen' : ''}`} onClick={() => setProvider(e.id)}>
                  <span className="sys-type-display">{e.name}</span>
                  <span className="sys-small sys-muted">{e.note}</span>
                </button>
              ))}
            </div>
            <div className="sys-field">
              <label className="sys-label" htmlFor="onb-key">{engine.name} API key</label>
              <input id="onb-key" className="sys-input sys-type-display" type="password" autoComplete="off" value={aiKey} onChange={(e) => setAiKey(e.target.value)} placeholder="Paste your key" />
              <span className="sys-scramble sys-small" aria-live="polite">{aiKey ? `key link ${scrambled}` : 'No key yet. You can add one later in your profile.'}</span>
            </div>
            <details className="sys-guide">
              <summary>How do I get a {engine.name} key?</summary>
              <ol>
                {engine.guide.map((g) => <li key={g}>{g}</li>)}
              </ol>
              <p className="sys-small sys-muted">Your key stays in this browser. It is not stored on the server.</p>
            </details>
          </section>
        )}

        {current === 'goals' && (
          <section className="sys-panel" style={{ gap: 16 }}>
            {stepBar}
            <p className="sys-prompt">
              <TypeWriter text={PROMPTS.goals} speed={20} />
            </p>
            <div className="sys-field">
              <label className="sys-label" htmlFor="onb-goals">Your goals</label>
              <textarea id="onb-goals" className="sys-input" rows={5} maxLength={1000} value={goals} placeholder="Example: earn from freelancing, get fitter, and finish my DSA prep." onChange={(e) => setGoals(e.target.value)} autoFocus />
            </div>
            <p className="sys-small sys-muted">XP criteria are designed from these goals in the next step of setup.</p>
          </section>
        )}

        {current === 'enter' && (
          <section className="sys-panel sys-enter" style={{ textAlign: 'center', alignItems: 'center', gap: 16 }}>
            <AvatarArt id={avatarId} size={96} />
            <div className="sys-eyebrow">Player online</div>
            <h1 className="sys-glitch sys-glitch--big" data-text={name || 'PLAYER'}>{name || 'PLAYER'}</h1>
            <p className="sys-muted">{avatar.title}</p>
            <button className="sys-btn sys-btn--primary" onClick={finish} disabled={busy}>
              {busy ? 'Entering…' : 'Enter The System'}
            </button>
          </section>
        )}

        {error && <p role="alert" className="sys-error sys-small">{error}</p>}

        {current !== 'boot' && current !== 'enter' && (
          <div className="sys-row sys-between" style={{ marginTop: 14 }}>
            <button type="button" className="sys-btn sys-btn--ghost" onClick={back} disabled={step <= 1 || busy}>
              Back
            </button>
            <button type="button" className="sys-btn sys-btn--primary" onClick={next} disabled={busy}>
              {busy ? 'Saving…' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
