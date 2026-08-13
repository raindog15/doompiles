import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getHousehold } from '@/lib/db/household';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {

  await cookies();
  const { data: session } = await auth.getSession();
  
  console.log('session in route:', JSON.stringify(session));
  console.log('cookies header:', request.headers.get('cookie'));
  
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'household name required' }, { status: 400 });
  }

  try{

    const [household] = await sql`
      INSERT INTO households (name)
      VALUES (${name.trim()})
      RETURNING household_id, name
      `;

    await sql`
      UPDATE users
      SET household_id = ${household.household_id}
      WHERE auth_id = ${session.user.id}
      `;

    return NextResponse.json(household, { status: 201 });

  } catch (error) {
    console.error('create household error:', error);
    return NextResponse.json({ error: 'failed to create household' }, { status: 500 });
  }
}