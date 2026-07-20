import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { cookies } from 'next/headers'; // these are load bearing 

export const dynamic = 'force-dynamic';

export default async function Dashboard() {

  await cookies();  // these are load bearing. getSession will not work without them.

  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/');
  }

    return <DashboardClient user={session.user} />;

}