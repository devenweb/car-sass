-- FULL DATABASE BACKUP & CONSOLIDATED SCHEMA
-- Generated: 2026-05-13
-- Project: Royal Car Rental (Drive Mauritius)

-- 1. VEHICLE TEMPLATES (Models)
CREATE TABLE IF NOT EXISTS vehicle_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    transmission VARCHAR(50),
    seats INTEGER DEFAULT 5,
    doors INTEGER DEFAULT 5,
    engine_size VARCHAR(50),
    fuel_type VARCHAR(50),
    luggage_large INTEGER DEFAULT 2,
    luggage_small INTEGER DEFAULT 1,
    description TEXT,
    features_json JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    rating DECIMAL(2, 1) DEFAULT 5.0,
    daily_price DECIMAL(10, 2),
    marketing_strikethrough_price DECIMAL(10, 2),
    fixed_discount_amount DECIMAL(10, 2) DEFAULT 0,
    percentage_discount_rate DECIMAL(10, 2) DEFAULT 0,
    long_term_threshold_days INTEGER DEFAULT 5,
    long_term_discount_percent DECIMAL(10, 2) DEFAULT 10,
    published_status VARCHAR(20) DEFAULT 'published',
    default_thumbnail TEXT,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. VEHICLE UNITS (Inventory)
CREATE TABLE IF NOT EXISTS vehicle_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_template_id UUID REFERENCES vehicle_templates(id) ON DELETE CASCADE,
    license_plate VARCHAR(50) UNIQUE,
    color VARCHAR(50),
    mileage INTEGER DEFAULT 0,
    availability_status VARCHAR(50) DEFAULT 'available',
    daily_price DECIMAL(10, 2), -- Specific override for this unit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VEHICLE GALLERY
CREATE TABLE IF NOT EXISTS vehicle_template_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_template_id UUID REFERENCES vehicle_templates(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RENTALS & BOOKINGS
CREATE TABLE IF NOT EXISTS rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    vehicle_unit_id UUID REFERENCES vehicle_units(id),
    pickup_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    return_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location_type VARCHAR(50),
    return_location_type VARCHAR(50),
    pickup_address TEXT,
    return_address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    agreed_to_terms BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BOOKING EXTRAS (Add-ons)
CREATE TABLE IF NOT EXISTS booking_extras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10, 2) NOT NULL,
    icon_name VARCHAR(50),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RLS POLICIES & SECURITY
ALTER TABLE vehicle_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_template_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Templates" ON vehicle_templates FOR SELECT USING (published_status = 'published');
CREATE POLICY "Public Read Units" ON vehicle_units FOR SELECT USING (true);
CREATE POLICY "Public Read Images" ON vehicle_template_images FOR SELECT USING (true);
CREATE POLICY "Public Read Extras" ON booking_extras FOR SELECT USING (is_active = true);

-- Admin full access (Authenticated)
CREATE POLICY "Admin All Templates" ON vehicle_templates ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Units" ON vehicle_units ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Images" ON vehicle_template_images ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Customers" ON customers ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Rentals" ON rentals ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Extras" ON booking_extras ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_template_slug ON vehicle_templates(slug);
CREATE INDEX IF NOT EXISTS idx_rental_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_unit_status ON vehicle_units(availability_status);
