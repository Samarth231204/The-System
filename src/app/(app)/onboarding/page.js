import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPlayer, toPlayerDto } from '@/lib/player/service';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Setup · The System' };

// First-run setup: name, purpose, class, AI engine and goals. Finished players go to the dashboard.
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const player = toPlayerDto(await getPlayer(user.id));
  if (player?.onboarded) redirect('/dashboard');

  return (
    <>
      <Ticker items={['New player detected', 'Setup sequence', 'Your key never leaves this browser']} />
      <main className="sys-main">
        <OnboardingFlow initial={player || {}} />
      </main>
    </>
  );
}
