-- Migration: Add Discount and Marketing Pricing Support
-- Targets: Marketing price effects and long-term rental discounts

BEGIN;

-- 1. Enhance vehicle_templates with marketing and discount rules
ALTER TABLE public.vehicle_templates 
ADD COLUMN IF NOT EXISTS marketing_original_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS long_term_discount_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS long_term_discount_percent NUMERIC(5, 2) DEFAULT 0;

-- 2. Enhance vehicle_units with unit-specific discount overrides (optional but good for precision)
ALTER TABLE public.vehicle_units
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10, 2);

-- 3. Update existing data (optional, set defaults)
UPDATE public.vehicle_templates 
SET long_term_discount_threshold = 5, long_term_discount_percent = 10
WHERE long_term_discount_percent = 0;

COMMIT;
