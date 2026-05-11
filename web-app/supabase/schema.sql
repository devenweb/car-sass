-- Safe database reset script that handles all edge cases

-- Step 1: Create tables if they don't exist (to avoid errors when dropping policies)
CREATE TABLE IF NOT EXISTS cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_per_day DECIMAL(10, 2),
    image_url TEXT,
    rating DECIMAL(2, 1),
    seats INTEGER,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    car_id UUID REFERENCES cars(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Drop policies safely (now that tables exist)
DROP POLICY IF EXISTS "Allow public read for cars" ON cars;
DROP POLICY IF EXISTS "Allow authenticated insert for customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated read own customer data" ON customers;
DROP POLICY IF EXISTS "Allow authenticated update own customer data" ON customers;

-- Step 3: Drop tables in reverse dependency order
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS cars CASCADE;

-- Step 4: Recreate tables with proper schema
CREATE TABLE cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_per_day DECIMAL(10, 2),
    image_url TEXT,
    rating DECIMAL(2, 1),
    seats INTEGER,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    car_id UUID REFERENCES cars(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cars_category ON cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price_per_day);
CREATE INDEX IF NOT EXISTS idx_cars_seats ON cars(seats);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_car ON rentals(car_id);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

-- Insert sample cars data only if not already present
INSERT INTO cars (name, description, category, price_per_day, image_url, rating, seats, features) 
SELECT 'BMW X3', 'Luxury SUV with premium interior and advanced safety features', 'SUV', 89.99, '/assets/bmw_x3.jpg', 4.7, 5, '["GPS", "Bluetooth", "Leather Seats", "Sunroof"]'
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE name = 'BMW X3');

INSERT INTO cars (name, description, category, price_per_day, image_url, rating, seats, features) 
SELECT 'Hyundai Accent', 'Reliable and fuel-efficient sedan perfect for city driving', 'Sedan', 39.99, '/assets/hyundai_accent.jpg', 4.2, 5, '["AC", "Bluetooth", "USB Port"]'
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE name = 'Hyundai Accent');

INSERT INTO cars (name, description, category, price_per_day, image_url, rating, seats, features) 
SELECT 'Toyota Camry', 'Comfortable mid-size sedan with excellent reliability', 'Sedan', 49.99, '/assets/toyota_camry.jpg', 4.5, 5, '["GPS", "Backup Camera", "Bluetooth"]'
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE name = 'Toyota Camry');

INSERT INTO cars (name, description, category, price_per_day, image_url, rating, seats, features) 
SELECT 'Kia Sportage', 'Spacious crossover SUV with modern features', 'SUV', 59.99, '/assets/kia_sportage.jpg', 4.4, 5, '["All Wheel Drive", "Panoramic Sunroof", "Apple CarPlay"]'
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE name = 'Kia Sportage');

INSERT INTO cars (name, description, category, price_per_day, image_url, rating, seats, features) 
SELECT 'Honda Jazz', 'Compact hatchback ideal for urban commuting', 'Hatchback', 34.99, '/assets/honda_jazz.jpg', 4.3, 5, '["Fuel Efficient", "Bluetooth", "Rear Camera"]'
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE name = 'Honda Jazz');

INSERT INTO cars (name, description, category, price_per_day, image_url, rating, seats, features) 
SELECT 'Toyota Hilux', 'Durable pickup truck for heavy-duty tasks', 'Truck', 79.99, '/assets/toyota_hilux.jpg', 4.6, 5, '["4WD", "Towing Package", "Off-Road Tires"]'
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE name = 'Toyota Hilux');

-- Enable Row Level Security (RLS)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read for cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for customers" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read own customer data" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow authenticated update own customer data" ON customers FOR UPDATE USING (auth.uid() = id);