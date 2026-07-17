-- Migration: Add walk-in booking fields to Appointments table
-- Run this in Supabase SQL Editor

ALTER TABLE public."Appointments"
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS staff_id uuid REFERENCES public."Staff"(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes text;
