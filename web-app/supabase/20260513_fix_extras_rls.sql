-- Fix RLS for booking_extras table
-- This allows the public to read extras (for the marketplace)
-- and authenticated admins to manage them (for the admin dashboard)

BEGIN;

-- 1. Ensure RLS is enabled
ALTER TABLE public.booking_extras ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.booking_extras;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.booking_extras;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.booking_extras;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.booking_extras;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.booking_extras;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.booking_extras;

-- 3. Create Policy: Public Read Access
CREATE POLICY "Allow public read access" 
ON public.booking_extras
FOR SELECT 
USING (true);

-- 4. Create Policy: Full Admin Access
CREATE POLICY "Allow full access for authenticated users" 
ON public.booking_extras
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

COMMIT;
