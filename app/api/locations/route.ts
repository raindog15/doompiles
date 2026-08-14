import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getLocationsByHousehold } from '@/lib/db/locations';

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