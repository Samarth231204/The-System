import { redirect } from 'next/navigation';
import Ticker from '@/components/arcade/Ticker';
import Panel from '@/components/arcade/Panel';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import LogoutButton from '@/components/auth/LogoutButton';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard · The System' };

// Placeholder dashboard for Phase 2. Quests, XP and levels arrive in later phases.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      <Ticker items={[`Logged in as ${user.email}`, 'Accounts · Phase 2', 'Onboarding arrives in Phase 3']} />
      <main className="sys-main">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sys-eyebrow">Player one // online</div>
          <GlitchTitle text="DASHBOARD" />
        </header>

        <Panel>
          <h2 className="sys-h2">Account</h2>
          <p>
            Logged in as <strong>{user.email}</strong>
          </p>
          <p className="sys-small sys-muted">Your player profile, quests and XP arrive in the next phases.</p>
          <div className="sys-row">
            <LogoutButton />
          </div>
        </Panel>
      </main>
    </>
  );
}
