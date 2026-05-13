-- Migration: Enhanced Pricing & Marketing Controls
-- Targets: Marketing strikethrough, independent Rs/% discounts, and long-term rental rules

BEGIN;

-- 1. Enhance vehicle_templates with detailed pricing and discount rules
ALTER TABLE public.vehicle_templates 
ADD COLUMN IF NOT EXISTS marketing_strikethrough_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS fixed_discount_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage_discount_rate NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS long_term_threshold_days INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS long_term_discount_percent NUMERIC(5, 2) DEFAULT 0;

-- 2. Add comment for clarity
COMMENT ON COLUMN public.vehicle_templates.marketing_strikethrough_price IS 'The previous/original price to show with a strikethrough for marketing effect.';
COMMENT ON COLUMN public.vehicle_templates.fixed_discount_amount IS 'Fixed Rs discount to subtract from the final calculation.';
COMMENT ON COLUMN public.vehicle_templates.percentage_discount_rate IS 'Standard percentage discount to apply.';

COMMIT;
