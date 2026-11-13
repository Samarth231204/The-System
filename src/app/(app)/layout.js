import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { urgencyFor } from '@/lib/urgency/service';
import UrgencyLayer from '@/components/urgency/UrgencyLayer';

export const dynamic = 'force-dynamic';

// Every route inside (app) requires a logged-in player.
// Anyone else is sent to the login page. Logged-in pages also get the urgency theme and alerts.
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const state = await urgencyFor(user.id);
  return (
    <>
      <UrgencyLayer hue={state.hue} urgency={state.urgency} banner={state.banner} alerts={state.alerts} />
      {children}
    </>
  );
}
