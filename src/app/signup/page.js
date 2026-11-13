import { redirect } from 'next/navigation';
import Link from 'next/link';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import AuthForm from '@/components/auth/AuthForm';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create account · The System' };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/dashboard');

  return (
    <>
      <Ticker items={['New player registration', 'Accounts · Phase 2', 'Onboarding arrives in Phase 3']} />
      <main className="sys-main" style={{ maxWidth: 520 }}>
        <div className="sys-eyebrow">Register</div>
        <GlitchTitle text="NEW PLAYER" />
        <AuthForm mode="signup" />
        <p className="sys-small sys-muted">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </main>
    </>
  );
}
