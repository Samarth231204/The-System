import Link from 'next/link';
import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import Panel from '@/components/arcade/Panel';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import Button from '@/components/arcade/Button';
import LogoutButton from '@/components/auth/LogoutButton';
import AvatarArt from '@/components/avatars/AvatarArt';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';
import { findAvatar } from '@/lib/avatars';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard · The System' };

// Players who have not finished setup are sent to onboarding first.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  const avatar = findAvatar(player.avatarId);

  return (
    <>
      <Ticker items={[`Player ${player.playerName} online`, `Class: ${avatar.name}`, 'Quests arrive in Phase 4']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Player one // online</div>
          <GlitchTitle text="DASHBOARD" />
        </header>

        <Panel>
          <div className="sys-row" style={{ alignItems: 'center', gap: 16 }}>
            <AvatarArt id={player.avatarId} size={72} title={avatar.name} />
            <div>
              <h2 className="sys-h2">{player.playerName}</h2>
              <div className="sys-small sys-muted">{avatar.title}</div>
            </div>
          </div>
          {player.purpose && <p>{player.purpose}</p>}
          <p className="sys-small sys-muted">Signed in as {user.email}</p>
          <div className="sys-row">
            <Button href="/profile" variant="ghost">Edit profile</Button>
            <LogoutButton />
          </div>
        </Panel>
      </main>
    </>
  );
}
