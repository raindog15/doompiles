import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export async function getUser(authId: string) {
    console.log('getUser called with authId:', authId);
    const rows = await sql`
    select    
        u.user_id,
        u.auth_id,
        u.display_name,
        u.email,
        u.email_validated,
        u.household_id,
        h.name as household_name,
        u.created_at
    from 
        public.users u 
        left join public.households h using (household_id)
    where 
        auth_id = ${authId}
    limit 1
  `;
  console.log('getUser rows:', JSON.stringify(rows));
  return rows[0] ?? null;
}