import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { cookies } from 'next/headers'; // these are load bearing 
import { getUser } from '@/lib/db/users';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {

  await cookies();  // these are load bearing. getSession will not work without them.

  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/');
  }

  const user = await getUser(session.user.id);

    return (
      <DashboardClient
        user={session.user}
        needsHouseHold={!user?.household_id} 
        />
    );
}