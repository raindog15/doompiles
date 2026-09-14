import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function testHouseHoldId(rawHouseholdId: unknown) {
  const householdId = String(rawHouseholdId).trim();
  if (!/^\d+$/.test(householdId)) {
    throw new Error('Invalid household_id');
  }
  return BigInt(householdId);
}

export async function getLocationsByHousehold(householdId: string, is_administrative: boolean = false) {
  const validatedHouseholdId = await testHouseHoldId(householdId);
  const rows = await sql`
    SELECT
      location_id,
      name,
      parent_location_id,
      floor,
      category,
      household_id
    FROM locations
    WHERE household_id = ${validatedHouseholdId}
    and deleted_at is null
    and is_administrative is ${is_administrative}
    ORDER BY floor, category, name
  `;
  return rows;
}

export async function getLocationId(name: string, householdId: string){
  const validatedHouseholdId = await testHouseHoldId(householdId);
  const rows = await sql`
    select
      location_id from locations
    where household_id = ${validatedHouseholdId}
      and name = ${name}
    and deleted_at is null
    limit 1
    `;
  return rows;
}

export async function createLocation(
    name: string, 
    category: string, 
    floor: string, 
    parent_location_id: string,
    household_id: string,
    is_administrative: boolean = false) {
      
  const validatedHouseholdId = await testHouseHoldId(household_id);

  let finalName = name;
  if (parent_location_id) {
    const parent = await sql `
    select name from locations
    where location_id = ${BigInt(parent_location_id)}
    `;
    if (parent[0]) {
      finalName = `${parent[0].name} ${name} `
    }
  }
  
  // then check for duplicates on the composed name
  const existing = await sql`
    SELECT name FROM locations
    WHERE household_id = ${household_id}
    AND floor IS NOT DISTINCT FROM ${floor}
    AND name ~ ${'^' + finalName + '( \\d+)?$'}
    AND deleted_at IS NULL
  `;

  if (existing.length > 0) {
    const numbers = existing.map((row: { name: string }) => {
      const match = row.name.match(/(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
    const next = Math.max(...numbers) + 1;
    finalName = `${finalName} ${next}`;
  }

  
  const rows = await sql`
    insert into locations
      (name, category, floor, parent_location_id, household_id, is_administrative)
    values
      (${finalName}, ${category}, ${floor}, ${parent_location_id}, ${validatedHouseholdId}, ${is_administrative})
      returning location_id, name, category, floor, parent_location
      `;
  return rows
}