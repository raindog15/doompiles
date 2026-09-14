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
    floor: number, 
    parent_location_id: number,
    household_id: string,
    is_administrative: boolean = false) {
      
  const validatedHouseholdId = await testHouseHoldId(household_id);
  const rows = await sql`
    insert into locations
      (name, category, floor, parent_location_id, household_id, is_administrative)
    values
      (${name}, ${category}, ${floor}, ${parent_location_id}, ${validatedHouseholdId}, ${is_administrative})
      returning location_id, name, category, floor, parent_location
      `;
  return rows
}