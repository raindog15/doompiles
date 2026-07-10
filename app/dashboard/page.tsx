import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/');
  }

  return <DashboardClient user={session.user} />;
}