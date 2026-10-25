import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getItems } from '@/lib/db/items';

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
  
  const res = NextResponse;
  
  return res;
}