import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Availability Engine
 * 
 * Checks for available units of a specific template for a given date range.
 * 
 * @param {string} templateId - The UUID of the vehicle template.
 * @param {string} startDate - ISO date string for pickup.
 * @param {string} endDate - ISO date string for return.
 * @returns {Promise<Array>} - List of available vehicle units.
 */
export async function getAvailableUnits(templateId: string, startDate: string, endDate: string) {
  // 1. Get all active units for this template
  const { data: units, error: unitsError } = await supabase
    .from("vehicle_units")
    .select("*")
    .eq("vehicle_template_id", templateId)
    .eq("status", "available"); // Or 'active' depending on your schema

  if (unitsError) throw unitsError;
  if (!units || units.length === 0) return [];

  // 2. Get overlapping bookings for these units
  const { data: bookings, error: bookingsError } = await supabase
    .from("rentals")
    .select("vehicle_unit_id")
    .in("vehicle_unit_id", units.map(u => u.id))
    .not("status", "eq", "cancelled")
    .or(`and(start_date.lt.${endDate},end_date.gt.${startDate})`);

  if (bookingsError) throw bookingsError;

  // 3. Get overlapping blocks
  const { data: blocks, error: blocksError } = await supabase
    .from("vehicle_availability_blocks")
    .select("vehicle_unit_id")
    .in("vehicle_unit_id", units.map(u => u.id))
    .or(`and(start_datetime.lt.${endDate},end_datetime.gt.${startDate})`);

  if (blocksError) throw blocksError;

  const bookedUnitIds = new Set(bookings.map(b => b.vehicle_unit_id));
  const blockedUnitIds = new Set(blocks.map(b => b.vehicle_unit_id));

  // 4. Filter units that are neither booked nor blocked
  return units.filter(u => !bookedUnitIds.has(u.id) && !blockedUnitIds.has(u.id));
}

/**
 * Aggregated Fleet Search
 * 
 * Returns templates with availability counts and lowest pricing.
 */
export async function searchFleet(params: any = {}) {
  const { startDate, endDate, category } = params;

  // 1. Fetch templates
  let query = supabase.from("vehicle_templates").select(`
    *,
    units:vehicle_units(
      id,
      availability_status
    )
  `);

  if (category) query = query.eq("category", category);

  const { data: templates, error: templateError } = await query;
  if (templateError) throw templateError;
  if (!templates) return [];

  // 2. If no dates provided, return templates with basic info
  if (!startDate || !endDate) {
    return templates.map(t => ({
      ...t,
      available_count: t.units.length,
      lowest_price: t.units.length > 0 ? 1500 : 0
    }));
  }

  // 3. If dates provided, calculate real availability
  const results = await Promise.all(templates.map(async (t) => {
    const availableUnits = await getAvailableUnits(t.id, startDate, endDate);
    return {
      ...t,
      available_count: availableUnits.length,
      lowest_price: availableUnits.length > 0 
        ? 1500
        : (t.units.length > 0 ? 1500 : 0), // Fallback
      is_available: availableUnits.length > 0
    };
  }));

  return results;
}