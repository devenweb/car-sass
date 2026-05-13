-- FULL ADMIN PERMISSIONS FIX (TABLES + STORAGE)
-- Generated: 2026-05-13

-- 1. ENABLE RLS ON ALL RELEVANT TABLES (Just in case)
ALTER TABLE vehicle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_template_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING ADMIN POLICIES
DROP POLICY IF EXISTS "Admin All Templates" ON vehicle_templates;
DROP POLICY IF EXISTS "Admin All Units" ON vehicle_units;
DROP POLICY IF EXISTS "Admin All Images" ON vehicle_template_images;
DROP POLICY IF EXISTS "Admin All Pricing" ON vehicle_pricing;
DROP POLICY IF EXISTS "Admin All Customers" ON customers;
DROP POLICY IF EXISTS "Admin All Rentals" ON rentals;
DROP POLICY IF EXISTS "Admin All Extras" ON booking_extras;

-- 3. RECREATE WITH FULL PERMISSIONS (ALL, USING true, WITH CHECK true)
CREATE POLICY "Admin All Templates" ON vehicle_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Units" ON vehicle_units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Images" ON vehicle_template_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Pricing" ON vehicle_pricing FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Rentals" ON rentals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Extras" ON booking_extras FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. STORAGE POLICIES for 'car-assets' bucket
-- These must be run in the Supabase SQL editor.
-- If the bucket doesn't exist, it should be created first.

-- Allow public read access to car-assets
-- Note: Replace 'car-assets' with your bucket name if different
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-assets', 'car-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies for this bucket
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;

-- Create Public Read Policy
CREATE POLICY "Public Read" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'car-assets');

-- Create Admin All Policy (Authenticated users)
CREATE POLICY "Admin Storage All" ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'car-assets')
    WITH CHECK (bucket_id = 'car-assets');
