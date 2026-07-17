-- =====================================================
-- MIGRATION: Create Memberships, PayoutAccounts,
--            ManualCharges, and Withdrawals tables
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public."Memberships" (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id    UUID NOT NULL REFERENCES public."Salons"(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    duration    TEXT NOT NULL DEFAULT '1 Month',
    perks       TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PAYOUT ACCOUNTS TABLE (one per salon)
CREATE TABLE IF NOT EXISTS public."PayoutAccounts" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id        UUID NOT NULL REFERENCES public."Salons"(id) ON DELETE CASCADE,
    bank_name       TEXT NOT NULL,
    account_last4   TEXT NOT NULL,
    routing_last4   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MANUAL CHARGES TABLE
CREATE TABLE IF NOT EXISTS public."ManualCharges" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id        UUID NOT NULL REFERENCES public."Salons"(id) ON DELETE CASCADE,
    customer_name   TEXT NOT NULL,
    description     TEXT DEFAULT 'Manual Charge',
    amount          NUMERIC(10, 2) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'paid',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public."Withdrawals" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id            UUID NOT NULL REFERENCES public."Salons"(id) ON DELETE CASCADE,
    amount              NUMERIC(10, 2) NOT NULL,
    payout_account_id   UUID REFERENCES public."PayoutAccounts"(id) ON DELETE SET NULL,
    status              TEXT NOT NULL DEFAULT 'completed',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES for fast queries by salon_id
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_memberships_salon_id     ON public."Memberships"(salon_id);
CREATE INDEX IF NOT EXISTS idx_payout_accounts_salon_id ON public."PayoutAccounts"(salon_id);
CREATE INDEX IF NOT EXISTS idx_manual_charges_salon_id  ON public."ManualCharges"(salon_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_salon_id     ON public."Withdrawals"(salon_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- =====================================================
ALTER TABLE public."Memberships"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PayoutAccounts"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ManualCharges"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Withdrawals"     ENABLE ROW LEVEL SECURITY;

-- Memberships Policies
CREATE POLICY "Anyone can view memberships" ON public."Memberships" FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage memberships" ON public."Memberships" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "Memberships".salon_id AND owner_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "Memberships".salon_id AND owner_id = auth.uid())
);

-- Payout Accounts Policies
CREATE POLICY "Owners can manage payout accounts" ON public."PayoutAccounts" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "PayoutAccounts".salon_id AND owner_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "PayoutAccounts".salon_id AND owner_id = auth.uid())
);

-- Manual Charges Policies
CREATE POLICY "Owners can manage manual charges" ON public."ManualCharges" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "ManualCharges".salon_id AND owner_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "ManualCharges".salon_id AND owner_id = auth.uid())
);

-- Withdrawals Policies
CREATE POLICY "Owners can manage withdrawals" ON public."Withdrawals" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "Withdrawals".salon_id AND owner_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public."Salons" WHERE id = "Withdrawals".salon_id AND owner_id = auth.uid())
);
