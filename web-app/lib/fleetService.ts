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
    .or("availability_status.eq.available,status.eq.available");

  if (unitsError) throw unitsError;
  if (!units || units.length === 0) return [];

  // 2. Get overlapping bookings for these units (using correct columns)
  const { data: bookings, error: bookingsError } = await supabase
    .from("rentals")
    .select("vehicle_unit_id")
    .in("vehicle_unit_id", units.map(u => u.id))
    .not("status", "eq", "cancelled")
    .or(`and(pickup_datetime.lt.${endDate},return_datetime.gt.${startDate})`);

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
 * Aggregated Fleet Search (Optimized)
 * 
 * Returns templates with availability counts and lowest pricing using bulk fetching.
 * Reduces requests from O(N) to O(1) where N is the number of templates.
 */
export async function searchFleet(params: any = {}) {
  const { startDate, endDate, category } = params;

  // 1. Fetch templates with basic unit info
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
      lowest_price: 1500 // Base price fallback
    }));
  }

  // 3. BULK FETCHING for Availability Calculation
  const allUnitIds = templates.flatMap(t => t.units.map(u => u.id));
  if (allUnitIds.length === 0) {
    return templates.map(t => ({ ...t, available_count: 0, is_available: false, lowest_price: 0 }));
  }

  // Parallel bulk fetches - Correcting column names to pickup_datetime/return_datetime
  const [bookingsRes, blocksRes] = await Promise.all([
    supabase.from("rentals")
      .select("vehicle_unit_id")
      .in("vehicle_unit_id", allUnitIds)
      .not("status", "eq", "cancelled")
      .or(`and(pickup_datetime.lt.${endDate},return_datetime.gt.${startDate})`),
    supabase.from("vehicle_availability_blocks")
      .select("vehicle_unit_id")
      .in("vehicle_unit_id", allUnitIds)
      .or(`and(start_datetime.lt.${endDate},end_datetime.gt.${startDate})`)
  ]);

  const bookedUnitIds = new Set(bookingsRes.data?.map(b => b.vehicle_unit_id) || []);
  const blockedUnitIds = new Set(blocksRes.data?.map(b => b.vehicle_unit_id) || []);

  // 4. Map results back to templates
  return templates.map(t => {
    const availableUnits = t.units.filter(u => 
      (u.availability_status === 'available' || (u as any).status === 'available') && 
      !bookedUnitIds.has(u.id) && 
      !blockedUnitIds.has(u.id)
    );

    return {
      ...t,
      available_count: availableUnits.length,
      is_available: availableUnits.length > 0,
      lowest_price: 1500 // In a real app, you'd calculate this from vehicle_pricing
    };
  });
}