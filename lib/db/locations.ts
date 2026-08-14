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