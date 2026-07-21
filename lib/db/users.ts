import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export async function getUser(authId: string) {
    const rows = await sql`
    select    
        user_id,
        auth_id,
        display_name,
        email,
        email_validated,
        household_id,
        created_at
    from 
        public.users
    where 
        auth_id = ${authId}
    limit 1
  `;

  return rows[0] ?? null;
}