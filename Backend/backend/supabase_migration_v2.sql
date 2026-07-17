-- Migration V2: Adding Missing Requirements

-- 1. Updates to Salons Table (SC-05, CM-03)
ALTER TABLE public."Salons" 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS contact_info text,
ADD COLUMN IF NOT EXISTS opening_hours text,
ADD COLUMN IF NOT EXISTS average_rating numeric(3, 2) DEFAULT 0.0;

-- 2. Updates to Services Table (SV-06)
ALTER TABLE public."Services"
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 30; -- duration in minutes

-- 3. Create Payments Table (PY-01, PY-02, PY-03)
CREATE TABLE IF NOT EXISTS public."Payments" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id uuid REFERENCES public."Appointments"(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public."Users"(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'online')),
    payment_status text NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_reference text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public."Payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON public."Payments" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public."Payments" FOR ALL USING (
    EXISTS (SELECT 1 FROM public."Users" WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Owners can view payments for their salon" ON public."Payments" FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public."Appointments" a
        JOIN public."Salons" s ON a.salon_id = s.id
        WHERE a.id = "Payments".booking_id AND s.owner_id = auth.uid()
    )
);

-- 4. Create RecommendationHistory Table (AI-04 to AI-10)
CREATE TABLE IF NOT EXISTS public."RecommendationHistory" (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public."Users"(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('service', 'salon', 'style', 'skin', 'hair')),
    input_data text,
    recommendation_result text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public."RecommendationHistory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recommendations" ON public."RecommendationHistory" FOR SELECT USING (auth.uid() = user_id);

-- 5. Updates to Notifications Table (NT-01 to NT-03)
ALTER TABLE public."Notifications"
ADD COLUMN IF NOT EXISTS type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent';

