import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import ProfileForm from '@/components/profile/ProfileForm';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profile · The System' };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const player = toPlayerDto(await getPlayer(user.id));
  if (!player?.onboarded) redirect('/onboarding');

  return (
    <>
      <Ticker items={['Profile editor', 'Changes save instantly']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Player file</div>
          <GlitchTitle text="PROFILE" />
        </header>
        <ProfileForm initial={player} />
      </main>
    </>
  );
}
