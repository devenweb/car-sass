-- BEGIN TRANSACTION
BEGIN;

-- 1. Create vehicle_templates
CREATE TABLE IF NOT EXISTS public.vehicle_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    category TEXT,
    transmission TEXT,
    fuel_type TEXT,
    seats INTEGER,
    luggage_capacity INTEGER,
    description TEXT,
    features JSONB DEFAULT '[]'::JSONB,
    published_status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create vehicle_template_images
CREATE TABLE IF NOT EXISTS public.vehicle_template_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_template_id UUID REFERENCES public.vehicle_templates(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create vehicle_units
CREATE TABLE IF NOT EXISTS public.vehicle_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_template_id UUID REFERENCES public.vehicle_templates(id) ON DELETE CASCADE,
    plate_number TEXT UNIQUE NOT NULL,
    vin_number TEXT UNIQUE,
    color TEXT,
    trim_variant TEXT,
    mileage INTEGER DEFAULT 0,
    daily_price NUMERIC(10, 2),
    weekly_price NUMERIC(10, 2),
    monthly_price NUMERIC(10, 2),
    security_deposit NUMERIC(10, 2),
    status TEXT DEFAULT 'available', -- available, reserved, rented, maintenance, damaged, cleaning, inactive
    current_location TEXT,
    insurance_expiry DATE,
    registration_expiry DATE,
    last_service_date DATE,
    next_service_date DATE,
    notes TEXT,
    partner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Migrate Data from cars to vehicle_templates
INSERT INTO public.vehicle_templates (brand, model, category, seats, description, features, created_at, updated_at)
SELECT 
    CASE 
        WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 1)
        ELSE name
    END as brand,
    CASE 
        WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
        ELSE ''
    END as model,
    category,
    seats,
    description,
    features,
    created_at,
    updated_at
FROM (SELECT DISTINCT name, category, seats, description, features, created_at, updated_at FROM public.cars) as distinct_cars;

-- 5. Migrate images to vehicle_template_images
INSERT INTO public.vehicle_template_images (vehicle_template_id, image_url)
SELECT vt.id, c.image_url
FROM public.cars c
JOIN public.vehicle_templates vt ON vt.brand || ' ' || vt.model = c.name
ON CONFLICT DO NOTHING;

-- 6. Create initial vehicle_units from cars
INSERT INTO public.vehicle_units (id, vehicle_template_id, plate_number, daily_price, status, created_at, updated_at)
SELECT 
    c.id,
    vt.id,
    'TEMP-' || substring(c.id::text, 1, 8), 
    c.price_per_day,
    c.status,
    c.created_at,
    c.updated_at
FROM public.cars c
JOIN public.vehicle_templates vt ON vt.brand || ' ' || vt.model = c.name;

-- 7. Update rentals table to reference vehicle_units
-- car_id was referencing cars.id. Now vehicle_units.id is cars.id.
ALTER TABLE public.rentals DROP CONSTRAINT IF EXISTS rentals_car_id_fkey;
ALTER TABLE public.rentals ADD CONSTRAINT rentals_vehicle_unit_id_fkey FOREIGN KEY (car_id) REFERENCES public.vehicle_units(id);
ALTER TABLE public.rentals RENAME COLUMN car_id TO vehicle_unit_id;

-- 8. Enable RLS
ALTER TABLE public.vehicle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_template_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_units ENABLE ROW LEVEL SECURITY;

-- 9. Add Policies
CREATE POLICY "Allow public read for vehicle_templates" ON public.vehicle_templates FOR SELECT USING (true);
CREATE POLICY "Allow public read for vehicle_template_images" ON public.vehicle_template_images FOR SELECT USING (true);
CREATE POLICY "Allow public read for vehicle_units" ON public.vehicle_units FOR SELECT USING (true);

COMMIT;