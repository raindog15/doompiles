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

export async function searchItems(householdId: number, q: string) {
  const sql = `
    SELECT * 
    FROM items i 
      LEFT JOIN locations lo
    WHERE i.household_id = $1 
      AND i.name ILIKE '%'' || $2 || ''%'
      AND i.deleted_at is NULL
      order by i.name`

  const rows = await sql `
  execute immediate ${sql}
  using ${householdId}, ${q}`

  return rows;
}