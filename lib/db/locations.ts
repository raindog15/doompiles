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

export async function createLocation(
    name: string, 
    category: string, 
    floor: number default 1, 
    parent_location: number) {
  const rows = await sql`
    insert into locations
      (name, category, floor, parent_location)
    values
      (${name}, ${category}, ${floor}, ${parent_location})
      returning location_id, name, category, floor, parent_location
      `;
  return rows
}