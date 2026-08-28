import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getLocationsByHousehold,
         getLocationId,
         createLocation } from '@/lib/db/locations';

export async function GET(request: NextRequest) {
  await cookies();
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const householdId = request.nextUrl.searchParams.get('household_id');

  if (!householdId) {
    return NextResponse.json({ error: 'household_id required' }, { status: 400 });
  }

  try {
    const locations = await getLocationsByHousehold(Number(householdId));
    return NextResponse.json(locations);
  } catch (error) {
    console.error('get locations error:', error);
    return NextResponse.json({ error: 'failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {

  await cookies();
  const { data: session } = await auth.getSession();
  
  console.log('session in route:', JSON.stringify(session));
  console.log('cookies header:', request.headers.get('cookie'));
  
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { name, category, floor, parent_location_id, household_id } = await request.json();

  if (!household_id?.trim()) {
    return NextResponse.json({ error: 'household id required' }, { status: 400 });
  }

  try{

    const [location] = await createLocation(
        name,
        category,
        floor,
        parent_location_id,
        household_id
    );

    return NextResponse.json(location, { status: 201 });
    
  } catch (error) {
    console.error('create location error:', error);
    return NextResponse.json({ error: 'failed to create location' }, { status: 500 });
  }
}