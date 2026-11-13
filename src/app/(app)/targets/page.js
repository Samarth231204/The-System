import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import TargetBoard from '@/components/targets/TargetBoard';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Boss Targets · The System' };

export default async function TargetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  return (
    <>
      <Ticker items={['Boss targets', 'Spend XP to claim a target', 'Link quests to track progress']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Boss board</div>
          <GlitchTitle text="TARGETS" />
        </header>
        <TargetBoard />
      </main>
    </>
  );
}
