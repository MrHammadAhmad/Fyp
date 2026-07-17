-- Migration to add wallet features and UserFavorites table

-- 1. Add wallet and loyalty fields to Users table
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS wallet_balance numeric(10, 2) DEFAULT 0.0 NOT NULL;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS loyalty_points integer DEFAULT 0 NOT NULL;

-- 2. Make booking_id nullable in Payments table (to allow wallet top-ups without bookings)
ALTER TABLE public."Payments" ALTER COLUMN booking_id DROP NOT NULL;

-- 3. Create UserFavorites Table
CREATE TABLE IF NOT EXISTS public."UserFavorites" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public."Users"(id) ON DELETE CASCADE NOT NULL,
    salon_id uuid REFERENCES public."Salons"(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, salon_id)
);

-- Enable RLS for UserFavorites
ALTER TABLE public."UserFavorites" ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public."UserFavorites";

-- RLS Policy: Users can perform all operations (Select, Insert, Delete) on their own favorites
CREATE POLICY "Users can manage their own favorites" ON public."UserFavorites"
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
