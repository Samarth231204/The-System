import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import Panel from '@/components/arcade/Panel';
import AvatarArt from '@/components/avatars/AvatarArt';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';
import { computeStats } from '@/lib/stats/service';
import { findAvatar } from '@/lib/avatars';
import { xpToReach } from '@/lib/levels/curve';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Stats · The System' };

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  const stats = await computeStats(user.id);
  const avatar = findAvatar(player.avatarId);
  const curve = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <>
      <Ticker items={[`${player.playerName} · Level ${stats.level} ${stats.title}`, `${stats.totalXp} XP`, 'Parameter levels below']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Character sheet</div>
          <GlitchTitle text="STATS" />
        </header>

        <Panel>
          <div className="sys-row" style={{ alignItems: 'center', gap: 18 }}>
            <AvatarArt id={player.avatarId} size={72} title={avatar.name} />
            <div style={{ flex: '1 1 260px' }}>
              <div className="sys-eyebrow">Overall level</div>
              <h2 className="sys-h2">Level {stats.level} · {stats.title}</h2>
              <div className="sys-xp">{stats.totalXp} XP total · {stats.completedQuests} quests judged</div>
            </div>
          </div>
          <Bar ratio={stats.ratio} />
          <p className="sys-small sys-muted">
            {stats.into} of {stats.span} XP into this level. Level {stats.level + 1} at {stats.next} XP.
          </p>
        </Panel>

        <Panel>
          <h2 className="sys-h2">Parameters</h2>
          {stats.parameters.length === 0 && <p className="sys-muted">No parameters yet. Design them on the XP design page.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {stats.parameters.map((p) => (
              <div key={p.key} style={{ display: 'grid', gap: 8, padding: 14, border: '1px solid var(--line)', background: 'var(--deep)' }}>
                <div className="sys-row" style={{ justifyContent: 'space-between' }}>
                  <span className="sys-type-display">{p.label}</span>
                  <span className="sys-small sys-muted">weight {p.weight}</span>
                </div>
                <div>Level {p.level} · {p.title}</div>
                <div className="sys-xp">{p.xp} XP</div>
                <Bar ratio={p.ratio} />
                <div className="sys-small sys-muted">{p.into} / {p.span} XP to level {p.level + 1}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="sys-h2">How levels work</h2>
          <p className="sys-small sys-muted">
            Your overall level uses all XP earned. Each parameter also levels on its own, using only its XP. Every level costs more XP than the one before.
          </p>
          <table className="sys-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={{ textAlign: 'left' }}>Level</th><th style={{ textAlign: 'left' }}>XP needed in total</th></tr>
            </thead>
            <tbody>
              {curve.map((l) => (
                <tr key={l}><td>{l}</td><td>{xpToReach(l)}</td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </main>
    </>
  );
}

function Bar({ ratio }) {
  return (
    <div className="sys-charge" role="img" aria-label={`${Math.round(ratio * 100)} percent to next level`}>
      <i style={{ width: `${Math.round(ratio * 100)}%` }} />
    </div>
  );
}
