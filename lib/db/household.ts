import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export async function getHousehold(householdId: string) {
    console.log('getHousehold called with householdId', householdId);
    const rows = await sql`
    select    
        h.household_id,
        h.name
    from 
        public.households h
    where 
        h.household_id = ${householdId}
        and h.deleted_at is null
    limit 1
  `;
  console.log('getHousehold rows:', JSON.stringify(rows));
  return rows[0] ?? null;
}

export async function createHousehold(name: string, userId: string) {

    // create the household and get the ID
    const rows = await sql`
    insert into households (name)
    values (${name})
    returning household_id, name
  `;
  
  // set the household_id for the user who created the household
  await sql`
    update users
    set household_id = ${rows[0].household_id}
    where auth_id = ${userId}
  `;

  await sql`
  insert into locations (name, category, floor, parent_location_id, household_id, is_administrative)
    values ('Lost', 'unknown', 0, null, ${rows[0].household_id}, true);
    insert into locations (name, category, floor, parent_location_id, household_id, is_administrative)
    values ('Trash', 'unknown', 0, null, ${rows[0].household_id}, true);
  `;

  return rows[0];
}