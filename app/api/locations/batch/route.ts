import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@lib/auth/server'
import { createLocation } from '@lib/db/locations'

export async function GET() {
  return NextResponse.json({ message: 'not implemented' }, { status: 501 });
}

export async function POST(request: NextRequest) {

  await cookies();
  const { data: session } = await auth.getSession();
  
  console.log('session in route:', JSON.stringify(session));
  console.log('cookies header:', request.headers.get('cookie'));
  
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();

  if (!toCreate.household_id?.trim()) {
    return NextResponse.json({ error: 'household_id required' }, { status: 400 });
  }
    
    )
  return NextResponse.json({ message: 'not implemented' }, { status: 501 });

  
}