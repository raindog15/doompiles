import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getItems(householdId: number, locationId: number | null = null) {
  const rows = await sql`
    SELECT *
    FROM items
    WHERE household_id = ${householdId}
      AND (${locationId}::int IS NULL OR location_id = ${locationId}::int)
      AND deleted_at IS NULL
    ORDER BY name
  `;
  return rows;
}