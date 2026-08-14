import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export async function getHousehold(householdId: string) {
    console.log('getHousehold called with householdId', householdId);
    const rows = await sql`
    select    
        h.household_id,
        h.household_name
    from 
        public.households h using (household_id)
    where 
        h.household_id = ${householdId}
        and h.deleted_at is null
    limit 1
  `;
  console.log('getHousehold rows:', JSON.stringify(rows));
  return rows[0] ?? null;
}