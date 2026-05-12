-- Add missing high-margin extras identified in competitor analysis
BEGIN;

INSERT INTO public.booking_extras (name, category, price_per_day, icon_name, is_active)
VALUES 
    ('Airport Pick Up', 'logistics', 1000.00, 'MapPin', true),
    ('Airport Drop Off', 'logistics', 1000.00, 'MapPin', true),
    ('Baby Seat', 'safety', 1000.00, 'Baby', true),
    ('Airport Premium Meet & Greet', 'logistics', 1500.00, 'UserPlus', true)
ON CONFLICT (name) DO UPDATE SET price_per_day = EXCLUDED.price_per_day;

COMMIT;
