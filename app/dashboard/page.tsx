import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { data: session } = await auth.getSession();
  
console.log('session:', JSON.stringify(session));

  
  if (!session?.user) {
    return <h1>Not logged in</h1>;
  } else {
    return <DashboardClient user={session.user} />;
  }
  
}