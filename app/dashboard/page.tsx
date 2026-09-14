import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { getUser } from '@/lib/db/users';
import { cookies } from 'next/headers';
import { getLocationsByHousehold } from '@/lib/db/locations';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('cookies on server:', JSON.stringify(allCookies.map(c => c.name)));

  const { data: session } = await auth.getSession();

  console.log('session:', JSON.stringify(session));

  
  if (!session?.user) {
    return <h1>Not logged in</h1>;
  }

  let userData;
  try {
    userData = await getUser(session.user.id || '');
  } catch (error) {
    console.error("Error fetching user data:", error);
    return <h1>Error fetching user data</h1>;
  }

  let householdLocations: Array<{
    location_id: string;
    name: string;
    parent_location_id: string | null;
    floor: string | null;
  }>;
  try {
    householdLocations = (await getLocationsByHousehold(userData.household_id || '')) as Array<{
      location_id: string;
      name: string;
      parent_location_id: string | null;
      floor: string | null;
    }>;
  } catch (error) {
    console.error("Error fetching household locations:", error);
    return <h1>Error fetching household locations</h1>;
  }

  return <DashboardClient user={{ ...userData, householdLocations }} />;
}
