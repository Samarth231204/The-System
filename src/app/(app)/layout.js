import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

// Every route inside (app) requires a logged-in player.
// Anyone else is sent to the login page.
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return children;
}
