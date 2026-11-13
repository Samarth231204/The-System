import { redirect } from 'next/navigation';

// Home sends everyone to the dashboard; the (app) layout sends logged-out players to /login.
export default function Home() {
  redirect('/dashboard');
}
