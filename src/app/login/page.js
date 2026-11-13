import { redirect } from 'next/navigation';
import Link from 'next/link';
import Ticker from '@/components/arcade/Ticker';
import GlitchTitle from '@/components/arcade/GlitchTitle';
import AuthForm from '@/components/auth/AuthForm';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Log in · The System' };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/dashboard');

  return (
    <>
      <Ticker items={['Player login', 'Accounts · Phase 2', 'Sign up to begin']} />
      <main className="sys-main" style={{ maxWidth: 520 }}>
        <div className="sys-eyebrow">Identify yourself</div>
        <GlitchTitle text="LOG IN" />
        <AuthForm mode="login" />
        <p className="sys-small sys-muted">
          New player? <Link href="/signup">Create an account</Link>
        </p>
      </main>
    </>
  );
}
