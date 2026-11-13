import Link from 'next/link';
import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import Panel from '@/components/arcade/Panel';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import Button from '@/components/arcade/Button';
import LogoutButton from '@/components/auth/LogoutButton';
import AvatarArt from '@/components/avatars/AvatarArt';
import { getCurrentUser } from '@/lib/auth/current-user';
import { connectToDatabase } from '@/lib/db/connect';
import { Task } from '@/lib/db/models/Task';
import { Target } from '@/lib/db/models/Target';
import { getPlayer, toPlayerDto } from '@/lib/player/service';
import { findAvatar } from '@/lib/avatars';
import { computeStats } from '@/lib/stats/service';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard · The System' };

// Players who have not finished setup are sent to onboarding first.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  await connectToDatabase();
  const [stats, openQuests, nearest, claimedCount] = await Promise.all([
    computeStats(user.id),
    Task.countDocuments({ userId: user.id, status: 'open', kind: { $ne: 'note' } }),
    Target.findOne({ userId: user.id, claimedAt: null }).sort({ deadline: 1 }).lean(),
    Target.countDocuments({ userId: user.id, claimedAt: { $ne: null } }),
  ]);
  const avatar = findAvatar(player.avatarId);

  return (
    <>
      <Ticker items={[`Player ${player.playerName} online`, `Level ${stats.level} ${stats.title}`, `${stats.totalXp} XP`]} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Player one // online</div>
          <GlitchTitle text="DASHBOARD" />
        </header>

        <Panel>
          <div className="sys-row" style={{ alignItems: 'center', gap: 16 }}>
            <AvatarArt id={player.avatarId} size={72} title={avatar.name} />
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <h2 className="sys-h2">{player.playerName}</h2>
              <div className="sys-small sys-muted">{avatar.title}</div>
              <Link href="/stats" className="sys-xp">Level {stats.level} · {stats.title}</Link>
              <div className="sys-small"><Link href="/stats">{stats.totalXp} XP earned</Link> · <span className="sys-muted">{stats.completedQuests} quests judged</span></div>
            </div>
          </div>
          {player.purpose && <p>{player.purpose}</p>}
        </Panel>

        <div className="sys-grid">
          <Panel>
            <h2 className="sys-h2">Quest log</h2>
            <p className="sys-small sys-muted">{openQuests === 0 ? 'No open quests. Add today’s work to earn XP.' : `${openQuests} open quest${openQuests === 1 ? '' : 's'} waiting.`}</p>
            <Button href="/quests">Open quest log</Button>
          </Panel>
          <Panel>
            <h2 className="sys-h2">Boss target</h2>
            {nearest
              ? <p className="sys-small">Nearest: <strong>{nearest.title}</strong> · due {new Date(nearest.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
              : <p className="sys-small sys-muted">No open boss target. Set one to give your XP a purpose.</p>}
            <p className="sys-small sys-muted">{claimedCount} defeated so far.</p>
            <Button href="/targets">Boss board</Button>
          </Panel>
          <Panel>
            <h2 className="sys-h2">Tune the system</h2>
            <p className="sys-small sys-muted">XP parameters, alert timing, AI engine and your details.</p>
            <div className="sys-row">
              <Button href="/rubric">XP design</Button>
              <Button href="/profile" variant="ghost">Profile</Button>
            </div>
          </Panel>
        </div>

        <div className="sys-row">
          <LogoutButton />
        </div>
      </main>
    </>
  );
}
