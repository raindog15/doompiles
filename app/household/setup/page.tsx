import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/users';
import { getLocationsByHousehold } from '@/lib/db/locations';
import SetupClient from './SetupClient';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  await cookies();
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/');

  const user = await getUser(session.user.id);
  if (!user?.household_id) redirect('/dashboard'); // no household yet, go back

  const locations = await getLocationsByHousehold(user.household_id);

  return (
    <SetupClient
      householdId={user.household_id}
      hasLocations={locations.length > 0}
    />
  );
}