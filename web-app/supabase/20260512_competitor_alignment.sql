-- Competitor Alignment Migration
-- Targets: Precise timing, flexible addressing, and tax transparency

BEGIN;

-- 1. Enhance vehicle_templates for more data points
ALTER TABLE public.vehicle_templates 
ADD COLUMN IF NOT EXISTS has_apple_carplay BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_android_auto BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS luggage_large INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS luggage_small INTEGER DEFAULT 1;

-- 2. Update rentals for precise timing and accounting
-- We use a safe cast for dates to timestamps
ALTER TABLE public.rentals 
ALTER COLUMN start_date TYPE TIMESTAMPTZ USING start_date::TIMESTAMPTZ,
ALTER COLUMN end_date TYPE TIMESTAMPTZ USING end_date::TIMESTAMPTZ;

ALTER TABLE public.rentals RENAME COLUMN start_date TO pickup_datetime;
ALTER TABLE public.rentals RENAME COLUMN end_date TO return_datetime;

ALTER TABLE public.rentals 
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS return_address TEXT,
ADD COLUMN IF NOT EXISTS pickup_location_type TEXT DEFAULT 'airport',
ADD COLUMN IF NOT EXISTS return_location_type TEXT DEFAULT 'airport',
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS internal_comments TEXT;

-- 3. Add SIM Card extra if not exists
INSERT INTO public.booking_extras (name, category, price_per_day, icon_name, is_active)
VALUES ('SIM Card (Unlimited Data)', 'tech', 600.00, 'Smartphone', true)
ON CONFLICT (name) DO UPDATE SET price_per_day = 600.00;

COMMIT;
