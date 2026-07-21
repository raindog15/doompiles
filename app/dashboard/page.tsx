import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { cookies } from 'next/headers'; // these are load bearing 
import { getUser } from '@/lib/db/users';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {

  await cookies();  // these are load bearing. getSession will not work without them.

  const { data: session } = await auth.getSession();
  console.log('post session check, session:', JSON.stringify(session));

  if (!session?.user) {
    redirect('/');
  }

  console.log('has db url:', !!process.env.DATABASE_URL);

  console.log('pre getUser call');
  const user = await getUser(session.user.id);
  console.log('post getUser call');
  
    return (
      <DashboardClient
        user={session.user}
        needsHouseHold={!user?.household_id} 
        />
    );
}