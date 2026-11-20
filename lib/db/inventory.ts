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

  const q_pattern = `%${q.toLowerCase().replace(/[%_\\]/g, "\\$&")}%`;
    
  const rows = await sql `
    SELECT * 
    FROM items i 
      LEFT JOIN locations lo
    WHERE i.household_id = ${householdId}
      AND i.name ILIKE ${q_pattern}
      AND i.deleted_at is NULL
      order by i.name`
    ;

  return rows;
}

export async function createItem(householdId: number, itemName: string, locationId: number, parentItem: number | null ) {

  const rows = await sql `
  insert into items
  (name, location_id, parent_item_id, household_id)
  values
  (${itemName},${locationId},${parentItem},${householdId})
  returning item_id, name, location_id, parent_item_id, household_id
  `;
  return rows;
}