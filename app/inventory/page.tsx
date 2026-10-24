import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/users';
import { ManageInventory } from '../ManageInventory';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  await cookies();
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect('/');

  const user = await getUser(session.user.id);
  if (!user?.household_id) redirect('/dashboard'); // no household yet, go back
  return (
    <ManageInventory
      householdId={user.household_id}
    />
  );
}