-- REFINED ADMIN RLS POLICIES WITH WITH CHECK
-- Generated: 2026-05-13

-- 1. Drop existing broad admin policies to recreate them properly
DROP POLICY IF EXISTS "Admin All Templates" ON vehicle_templates;
DROP POLICY IF EXISTS "Admin All Units" ON vehicle_units;
DROP POLICY IF EXISTS "Admin All Images" ON vehicle_template_images;
DROP POLICY IF EXISTS "Admin All Customers" ON customers;
DROP POLICY IF EXISTS "Admin All Rentals" ON rentals;
DROP POLICY IF EXISTS "Admin All Extras" ON booking_extras;

-- 2. Recreate with explicit permissions
-- Templates
CREATE POLICY "Admin All Templates" ON vehicle_templates 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Units
CREATE POLICY "Admin All Units" ON vehicle_units 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Images
CREATE POLICY "Admin All Images" ON vehicle_template_images 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Customers
CREATE POLICY "Admin All Customers" ON customers 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Rentals
CREATE POLICY "Admin All Rentals" ON rentals 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Extras
CREATE POLICY "Admin All Extras" ON booking_extras 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 3. STORAGE POLICIES (Assuming bucket 'vehicle-images')
-- Note: Storage policies are handled in the 'storage' schema
-- We'll try to apply them but they might need manual UI setup depending on Supabase version
-- Insert/Update/Delete for authenticated admins
-- CREATE POLICY "Admin Storage Access" ON storage.objects
--     FOR ALL
--     TO authenticated
--     USING (bucket_id = 'vehicle-images')
--     WITH CHECK (bucket_id = 'vehicle-images');
