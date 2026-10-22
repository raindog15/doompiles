import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/users';
import { createLocation } from '@/lib/db/locations';

type LocationInput = {
  name: string;
  floor: number | null;
  category: string;
};

export async function GET() {
  return NextResponse.json({ message: 'not implemented' }, { status: 501 });
}

export async function POST(request: NextRequest) {
  await cookies();
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await getUser(session.user.id);
  if (!user?.household_id) {
    return NextResponse.json({ error: 'no household' }, { status: 400 });
  }

  const body = await request.json();
  const locations: LocationInput[] = body.locations;
  
  console.log('locations received:', JSON.stringify(locations));

  if (!locations?.length) {
    return NextResponse.json({ error: 'locations required' }, { status: 400 });
  }

  const results = [];

  for (const location of locations) {
    const created = await createLocation(
      location.name,
      location.category,
      location.floor,
      null,
      user.household_id
    );
    results.push(created);
  }

  return NextResponse.json(results, { status: 201 });
}