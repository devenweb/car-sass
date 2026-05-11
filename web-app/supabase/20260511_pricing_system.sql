-- Create vehicle_pricing table for date-based daily pricing
CREATE TABLE IF NOT EXISTS public.vehicle_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_template_id UUID REFERENCES public.vehicle_templates(id) ON DELETE CASCADE,
    pricing_date DATE NOT NULL,
    daily_price NUMERIC(10, 2) NOT NULL,
    is_stop_sale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vehicle_template_id, pricing_date)
);

-- Enable RLS
ALTER TABLE public.vehicle_pricing ENABLE ROW LEVEL SECURITY;

-- Add Policies
CREATE POLICY "Allow public read for vehicle_pricing" ON public.vehicle_pricing FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access for vehicle_pricing" ON public.vehicle_pricing 
    FOR ALL USING (auth.role() = 'authenticated');