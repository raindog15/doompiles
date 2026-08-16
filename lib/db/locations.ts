import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getLocationsByHousehold(householdId: number) {
  const rows = await sql`
    SELECT
      location_id,
      name,
      parent_location_id,
      floor,
      category,
      household_id
    FROM locations
    WHERE household_id = ${householdId}
    and deleted_at is null
    ORDER BY category, floor, name
  `;
  return rows;
}

export async function getLocationId(name: string, householdId: number){
  const rows = await sql`
    select
      location_id from locations
    where household_id = ${household_id}
      and name = ${name}
    and deleted_at is null
    limit 1
    `;
  return rows;
}

export async function createLocation(
    name: string, 
    category: string, 
    floor: number, 
    parent_location: number,
    household_id: number) {
  const rows = await sql`
    insert into locations
      (name, category, floor, parent_location, household_id)
    values
      (${name}, ${category}, ${floor}, ${parent_location}, ${household_id})
      returning location_id, name, category, floor, parent_location
      `;
  return rows
}