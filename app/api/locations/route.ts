import { neon } from '@neondatabase/serverless'
import { auth } from '@/lib/auth/server'
import { getUser } from '@/lib/db/users'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getLocationsByHousehold,
         getLocationId,
         createLocation } from '@/lib/db/locations'

export async function GET(request: NextRequest) {
  await cookies();
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const userData = await getUser(session.user.id);

  if (!userData.household_id) {
    return NextResponse.json({ error: 'user is missing household_id' }, { status: 500 });
  }

  try {
    const locations = await getLocationsByHousehold(userData.household_idd);
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

  const userData = await getUser(session.user.id);

  if (!userData.household_id) {
    return NextResponse.json({ error: 'user is missing household_id' }, { status: 500 });
  }
  
  const { name, category, floor, parent_location_id, is_administrative } = await request.json();

  try{

    const [location] = await createLocation(
        name,
        category,
        floor,
        parent_location_id,
        userData.household_id,
        is_administrative
    );

    return NextResponse.json(location, { status: 201 });
    
  } catch (error) {
    console.error('create location error:', error);
    return NextResponse.json({ error: 'failed to create location' }, { status: 500 });
  }
}