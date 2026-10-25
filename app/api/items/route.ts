import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getItems } from '@/lib/db/items';
import { getUser } from '@/lib/db/users';

export async function POST(request: NextRequest) {

  return NextResponse(405, 'POST not implemented');
};

export async function GET(request: NextRequest){
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
    const items = await getItems(userData.household_id);
    return NextResponse.json(items);
  } catch (error) {
    console.error('get items error:', error);
    return NextResponse.json({ error: 'failed to fetch items' }, { status: 500 });
  }
}