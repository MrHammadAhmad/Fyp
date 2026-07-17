-- =====================================================
-- MIGRATION: Add Salon Settings Columns
-- (Booking preferences, cancellation policy)
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

ALTER TABLE public."Salons"
ADD COLUMN IF NOT EXISTS enable_online_booking BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_walkin_bookings BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS cancellation_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_noshow_rebooking BOOLEAN NOT NULL DEFAULT TRUE;
