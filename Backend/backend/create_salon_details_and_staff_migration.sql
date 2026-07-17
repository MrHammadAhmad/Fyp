-- Migration: Adding Salon Location details and creating Staff Table

-- 1. Add structured location and image columns to Salons
ALTER TABLE public."Salons" 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS town text,
ADD COLUMN IF NOT EXISTS shop_no text,
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS images text[];

-- 2. Create Staff / Barbers Table
CREATE TABLE IF NOT EXISTS public."Staff" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    salon_id uuid REFERENCES public."Salons"(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    role text,
    avatar text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Staff
ALTER TABLE public."Staff" ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view staff" ON public."Staff";
DROP POLICY IF EXISTS "Owners can manage staff of their salons" ON public."Staff";

-- Staff RLS Policies
CREATE POLICY "Anyone can view staff" ON public."Staff" FOR SELECT USING (true);
CREATE POLICY "Owners can manage staff of their salons" ON public."Staff"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public."Salons" WHERE id = "Staff".salon_id AND owner_id = auth.uid())
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public."Salons" WHERE id = "Staff".salon_id AND owner_id = auth.uid())
    );
