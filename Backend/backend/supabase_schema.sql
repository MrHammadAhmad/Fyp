-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Optional if you rely solely on auth.users, but good for custom profile data)
-- Let's link it to Supabase auth.users
create table public."Users" (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null unique,
    role text not null check (role in ('customer', 'owner', 'admin')) default 'customer',
    phone text,
    is_blocked boolean default false not null,
    referral_code text unique,
    referred_by uuid references public."Users"(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Salons Table
create table public."Salons" (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    location text not null,
    owner_id uuid references public."Users"(id) on delete cascade not null,
    is_approved boolean default false not null,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    ai_aggregate_rating numeric
);

-- 3. Services Table
create table public."Services" (
    id uuid default uuid_generate_v4() primary key,
    salon_id uuid references public."Salons"(id) on delete cascade not null,
    name text not null,
    price numeric not null,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Appointments Table
create table public."Appointments" (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public."Users"(id) on delete cascade, -- nullable for walk-in
    salon_id uuid references public."Salons"(id) on delete cascade not null,
    service_id uuid references public."Services"(id) on delete cascade not null,
    date date not null,
    time time not null,
    status text not null check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')) default 'pending',
    booking_type text not null check (booking_type in ('online', 'walk-in')),
    payment_status text not null check (payment_status in ('paid', 'unpaid', 'refunded')) default 'unpaid',
    stripe_payment_intent_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Reviews Table
create table public."Reviews" (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public."Users"(id) on delete cascade not null,
    salon_id uuid references public."Salons"(id) on delete cascade not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    ai_rating integer
);

-- 6. Announcements Table
create table public."Announcements" (
    id uuid default uuid_generate_v4() primary key,
    salon_id uuid references public."Salons"(id) on delete cascade not null,
    title text not null,
    description text not null,
    discount_percentage numeric check (discount_percentage >= 0 and discount_percentage <= 100),
    valid_until timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SupportTickets Table
create table public."SupportTickets" (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public."Users"(id) on delete set null,
    name text not null,
    email text not null,
    subject text not null,
    message text not null,
    status text check (status in ('open', 'resolved')) default 'open',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Notifications Table
create table public."Notifications" (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public."Users"(id) on delete cascade not null,
    title text not null,
    message text not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. ServiceEvaluations Table
create table public."ServiceEvaluations" (
    id uuid default uuid_generate_v4() primary key,
    appointment_id uuid references public."Appointments"(id) on delete cascade unique not null,
    service_id uuid references public."Services"(id) on delete cascade not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    feedback text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. FAQs Table
create table public."FAQs" (
    id uuid default uuid_generate_v4() primary key,
    question text not null,
    answer text not null,
    category text default 'general'
);

-- Row Level Security (RLS) basics
alter table public."Users" enable row level security;
alter table public."Salons" enable row level security;
alter table public."Services" enable row level security;
alter table public."Appointments" enable row level security;
alter table public."Reviews" enable row level security;
alter table public."Announcements" enable row level security;
alter table public."SupportTickets" enable row level security;
alter table public."Notifications" enable row level security;
alter table public."ServiceEvaluations" enable row level security;
alter table public."FAQs" enable row level security;

-- Policies for Users
create policy "Users can view their own profile" on public."Users" for select using (auth.uid() = id);
create policy "Users can update their own profile" on public."Users" for update using (auth.uid() = id);
create policy "Admins can view and edit all users" on public."Users" for all using (
    exists (select 1 from public."Users" where id = auth.uid() and role = 'admin')
);

-- Policies for Salons
create policy "Anyone can view approved salons" on public."Salons" for select using (is_approved = true or auth.uid() = owner_id or exists (select 1 from public."Users" where id = auth.uid() and role = 'admin'));
create policy "Owners can insert salons" on public."Salons" for insert with check (auth.uid() = owner_id);
create policy "Owners can update their salons" on public."Salons" for update using (auth.uid() = owner_id);
create policy "Admins have full access to salons" on public."Salons" for all using (
    exists (select 1 from public."Users" where id = auth.uid() and role = 'admin')
);

-- Policies for Services
create policy "Anyone can view services" on public."Services" for select using (true);
create policy "Owners can manage services of their salons" on public."Services" for all using (
    exists (select 1 from public."Salons" where id = "Services".salon_id and owner_id = auth.uid())
);

-- Policies for Appointments
create policy "Users can view their own appointments" on public."Appointments" for select using (auth.uid() = user_id);
create policy "Owners can view appointments at their salons" on public."Appointments" for select using (
    exists (select 1 from public."Salons" where id = "Appointments".salon_id and owner_id = auth.uid())
);
create policy "Users can insert their own appointment" on public."Appointments" for insert with check (auth.uid() = user_id or user_id is null);
create policy "Owners can update appointments" on public."Appointments" for update using (
    exists (select 1 from public."Salons" where id = "Appointments".salon_id and owner_id = auth.uid())
);

-- Policies for Reviews
create policy "Anyone can view reviews" on public."Reviews" for select using (true);
create policy "Users can create reviews" on public."Reviews" for insert with check (auth.uid() = user_id);

-- Policies for Announcements
create policy "Anyone can view announcements" on public."Announcements" for select using (true);
create policy "Owners can manage announcements" on public."Announcements" for all using (
    exists (select 1 from public."Salons" where id = "Announcements".salon_id and owner_id = auth.uid())
);

-- Policies for SupportTickets
create policy "Users can view their own support tickets" on public."SupportTickets" for select using (auth.uid() = user_id);
create policy "Users can create support tickets" on public."SupportTickets" for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admins can view and update support tickets" on public."SupportTickets" for all using (
    exists (select 1 from public."Users" where id = auth.uid() and role = 'admin')
);

-- Policies for Notifications
create policy "Users can view their own notifications" on public."Notifications" for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on public."Notifications" for update using (auth.uid() = user_id);

-- Policies for ServiceEvaluations
create policy "Anyone can view service evaluations" on public."ServiceEvaluations" for select using (true);
create policy "Users can submit evaluations for their appointments" on public."ServiceEvaluations" for insert with check (
    exists (select 1 from public."Appointments" where id = appointment_id and user_id = auth.uid())
);

-- Policies for FAQs
create policy "Anyone can view FAQs" on public."FAQs" for select using (true);
create policy "Admins can manage FAQs" on public."FAQs" for all using (
    exists (select 1 from public."Users" where id = auth.uid() and role = 'admin')
);
