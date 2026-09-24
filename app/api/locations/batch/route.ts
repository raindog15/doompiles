import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@lib/auth/server'
import { cookies } from 'next/headers'

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

  const { batchLocations } = await request.json();

  if (!batchLocations.household_id?.trim()) {
    return NextResponse.json({ error: 'household_id required' }, { status: 400 });
  }

  // begin processing batch
  for ( let _location in batchLocations.toCreate ) {

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({_location}),
      });

      return NextResponse.json({status: res.status });
  } 
    catch { return NextRequest.json(  { message: 'error posting batch'} )
     }
  }
}
