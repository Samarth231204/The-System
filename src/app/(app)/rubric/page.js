import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import RubricEditor from '@/components/rubric/RubricEditor';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'XP Design · The System' };

export default async function RubricPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  return (
    <>
      <Ticker items={['XP design', 'Parameters come from your goals', 'Edit by hand or regenerate']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Judgement matrix</div>
          <GlitchTitle text="XP DESIGN" />
        </header>
        <RubricEditor />
      </main>
    </>
  );
}
