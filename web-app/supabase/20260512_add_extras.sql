-- Ensure the name column has a unique constraint for the upsert to work
ALTER TABLE public.booking_extras ADD CONSTRAINT booking_extras_name_unique UNIQUE (name);

-- Insert new booking extras
INSERT INTO public.booking_extras (name, category, price_per_day, icon_name, is_active)
VALUES 
    ('Child Car Seat', 'safety', 500.00, 'Baby', true),
    ('Apple CarPlay / Android Auto', 'tech', 200.00, 'Smartphone', true),
    ('Bouquet of Flowers', 'luxury', 2500.00, 'Flower', true),
    ('Mobile WiFi Hotspot', 'tech', 300.00, 'Wifi', true)
ON CONFLICT (name) DO UPDATE 
SET price_per_day = EXCLUDED.price_per_day, 
    icon_name = EXCLUDED.icon_name, 
    is_active = EXCLUDED.is_active;
