import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import QuestBoard from '@/components/quests/QuestBoard';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quests · The System' };

export default async function QuestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  return (
    <>
      <Ticker items={['Quest log', 'Daily quests reset each day', 'Side quests and notes live here too']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Quest log</div>
          <GlitchTitle text="QUESTS" />
        </header>
        <QuestBoard />
      </main>
    </>
  );
}
