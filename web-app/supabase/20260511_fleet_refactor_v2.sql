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
    engine_size TEXT,
    seats INTEGER,
    doors INTEGER,
    luggage_capacity TEXT,
    air_conditioning BOOLEAN DEFAULT TRUE,
    description TEXT,
    features_json JSONB DEFAULT '[]'::JSONB,
    default_thumbnail TEXT,
    published_status TEXT DEFAULT 'published',
    sort_order INTEGER DEFAULT 0,
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
    partner_id UUID,
    branch_id UUID,
    plate_number TEXT UNIQUE NOT NULL,
    vin_number TEXT UNIQUE,
    internal_reference TEXT,
    color TEXT,
    trim_variant TEXT,
    year_registered INTEGER,
    mileage INTEGER DEFAULT 0,
    fuel_level TEXT,
    transmission_override TEXT,
    status TEXT DEFAULT 'active', -- active, inactive, archived
    availability_status TEXT DEFAULT 'available', -- available, reserved, rented, maintenance, damaged, cleaning, inspection
    condition_status TEXT DEFAULT 'excellent', -- excellent, good, fair, repair_needed
    purchase_price NUMERIC(12, 2),
    market_value NUMERIC(12, 2),
    daily_price NUMERIC(10, 2),
    weekly_price NUMERIC(10, 2),
    monthly_price NUMERIC(10, 2),
    weekend_price NUMERIC(10, 2),
    minimum_rental_days INTEGER DEFAULT 1,
    security_deposit NUMERIC(10, 2),
    insurance_provider TEXT,
    insurance_expiry DATE,
    registration_expiry DATE,
    road_tax_expiry DATE,
    last_service_date DATE,
    next_service_due DATE,
    last_maintenance_notes TEXT,
    current_location TEXT,
    gps_device_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create vehicle_availability_blocks
CREATE TABLE IF NOT EXISTS public.vehicle_availability_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_unit_id UUID REFERENCES public.vehicle_units(id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    block_type TEXT NOT NULL, -- maintenance, repair, admin_hold, inspection, cleaning
    reason TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create vehicle_maintenance_records
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_unit_id UUID REFERENCES public.vehicle_units(id) ON DELETE CASCADE,
    maintenance_type TEXT,
    cost NUMERIC(10, 2),
    description TEXT,
    service_provider TEXT,
    service_date DATE,
    next_service_due DATE,
    attachments_json JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Migrate Data from cars to vehicle_templates
INSERT INTO public.vehicle_templates (brand, model, category, seats, description, features_json, default_thumbnail, created_at, updated_at)
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
    features, -- formerly 'features' jsonb in cars table
    image_url,
    created_at,
    updated_at
FROM (SELECT DISTINCT ON (name) name, category, seats, description, features, image_url, created_at, updated_at FROM public.cars) as distinct_cars;

-- 7. Migrate images to vehicle_template_images
INSERT INTO public.vehicle_template_images (vehicle_template_id, image_url)
SELECT vt.id, c.image_url
FROM public.cars c
JOIN public.vehicle_templates vt ON vt.brand || ' ' || vt.model = c.name;

-- 8. Create initial vehicle_units from cars
INSERT INTO public.vehicle_units (id, vehicle_template_id, plate_number, daily_price, availability_status, created_at, updated_at)
SELECT 
    c.id,
    vt.id,
    'TEMP-' || substring(c.id::text, 1, 8), 
    c.price_per_day,
    CASE 
        WHEN c.status = 'available' THEN 'available'
        WHEN c.status = 'rented' THEN 'rented'
        WHEN c.status = 'maintenance' THEN 'maintenance'
        ELSE 'available'
    END,
    c.created_at,
    c.updated_at
FROM public.cars c
JOIN public.vehicle_templates vt ON vt.brand || ' ' || vt.model = c.name;

-- 9. Update rentals table to reference vehicle_units
ALTER TABLE public.rentals DROP CONSTRAINT IF EXISTS rentals_car_id_fkey;
ALTER TABLE public.rentals ADD CONSTRAINT rentals_vehicle_unit_id_fkey FOREIGN KEY (car_id) REFERENCES public.vehicle_units(id);
ALTER TABLE public.rentals RENAME COLUMN car_id TO vehicle_unit_id;

-- 10. Enable RLS
ALTER TABLE public.vehicle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_template_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;

-- 11. Add Policies
CREATE POLICY "Allow public read for vehicle_templates" ON public.vehicle_templates FOR SELECT USING (true);
CREATE POLICY "Allow public read for vehicle_template_images" ON public.vehicle_template_images FOR SELECT USING (true);
CREATE POLICY "Allow public read for vehicle_units" ON public.vehicle_units FOR SELECT USING (true);
CREATE POLICY "Allow public read for vehicle_availability_blocks" ON public.vehicle_availability_blocks FOR SELECT USING (true);

COMMIT;