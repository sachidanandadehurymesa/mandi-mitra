-- Mandi Mitra — initial schema.
-- NOT YET APPLIED to any database in this environment (no Supabase project is
-- configured here). This migration documents the intended production schema
-- so a real Supabase project can be initialized from it later.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users (admins and, optionally, registered farmers)
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete cascade,
  phone_number text unique,
  display_name text,
  role text not null default 'farmer' check (role in ('farmer', 'admin')),
  created_at timestamptz not null default now()
);
create index if not exists idx_users_auth_user_id on users (auth_user_id);

-- ---------------------------------------------------------------------------
-- villages
-- ---------------------------------------------------------------------------
create table if not exists villages (
  id text primary key,
  name text not null,
  name_mr text not null,
  taluka text not null,
  district text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- mandis
-- ---------------------------------------------------------------------------
create table if not exists mandis (
  id text primary key,
  name text not null,
  name_mr text not null,
  taluka text not null,
  district text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- mandi_distances (village -> mandi one-way distance, km)
-- ---------------------------------------------------------------------------
create table if not exists mandi_distances (
  village_id text not null references villages (id) on delete cascade,
  mandi_id text not null references mandis (id) on delete cascade,
  distance_km numeric(6, 2) not null check (distance_km >= 0),
  updated_at timestamptz not null default now(),
  primary key (village_id, mandi_id)
);
create index if not exists idx_mandi_distances_village on mandi_distances (village_id);

-- ---------------------------------------------------------------------------
-- mandi_prices (one row per mandi/crop/quality/date observation)
-- ---------------------------------------------------------------------------
create table if not exists mandi_prices (
  id uuid primary key default gen_random_uuid(),
  mandi_id text not null references mandis (id) on delete cascade,
  crop text not null default 'onion',
  quality text not null default 'reference' check (quality in ('good', 'medium', 'low', 'reference')),
  modal_price_per_quintal numeric(10, 2) not null check (modal_price_per_quintal >= 0),
  min_price_per_quintal numeric(10, 2),
  max_price_per_quintal numeric(10, 2),
  price_date date not null,
  fetched_at timestamptz not null default now(),
  source text not null check (source in ('agmarknet', 'manual-admin', 'demo-dataset')),
  is_quality_adjusted boolean not null default false,
  created_by uuid references users (id)
);
create index if not exists idx_mandi_prices_mandi_date on mandi_prices (mandi_id, price_date desc);

-- ---------------------------------------------------------------------------
-- mandi_charges (current charge configuration per mandi)
-- ---------------------------------------------------------------------------
create table if not exists mandi_charges (
  mandi_id text primary key references mandis (id) on delete cascade,
  commission_rate numeric(5, 4) not null check (commission_rate >= 0 and commission_rate < 1),
  handling_charge_per_quintal numeric(10, 2) not null default 0 check (handling_charge_per_quintal >= 0),
  cess_flat numeric(10, 2) not null default 0 check (cess_flat >= 0),
  notes text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- transport_rates (default rate per vehicle type; farmers may override per request)
-- ---------------------------------------------------------------------------
create table if not exists transport_rates (
  type text primary key check (type in ('tractor', 'tempo', 'truck')),
  label text not null,
  label_mr text not null,
  default_rate_per_km numeric(8, 2) not null check (default_rate_per_km >= 0),
  typical_capacity_quintals numeric(8, 2) not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- comparison_requests / comparison_results
-- ---------------------------------------------------------------------------
create table if not exists comparison_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id),
  village_id text not null references villages (id),
  crop text not null default 'onion',
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null check (unit in ('bags', 'quintals')),
  avg_weight_per_bag_kg numeric(6, 2) not null default 50,
  quality text not null check (quality in ('good', 'medium', 'low')),
  transport_type text not null check (transport_type in ('tractor', 'tempo', 'truck')),
  transport_rate_per_km numeric(8, 2) not null check (transport_rate_per_km >= 0),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_comparison_requests_user on comparison_requests (user_id, created_at desc);

create table if not exists comparison_results (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references comparison_requests (id) on delete cascade,
  mandi_id text not null references mandis (id),
  rank integer not null check (rank > 0),
  distance_km numeric(6, 2) not null,
  price_per_quintal numeric(10, 2) not null,
  expected_sale_value numeric(12, 2) not null,
  transport_cost numeric(12, 2) not null,
  total_mandi_charges numeric(12, 2) not null,
  net_earnings numeric(12, 2) not null,
  net_earnings_per_quintal numeric(12, 2) not null,
  price_source text not null,
  price_date date not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_comparison_results_request on comparison_results (request_id);

-- ---------------------------------------------------------------------------
-- farmer_feedback
-- ---------------------------------------------------------------------------
create table if not exists farmer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id),
  village_id text references villages (id),
  comparison_request_id uuid references comparison_requests (id),
  rating smallint not null check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_farmer_feedback_created_at on farmer_feedback (created_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table users enable row level security;
alter table comparison_requests enable row level security;
alter table comparison_results enable row level security;
alter table farmer_feedback enable row level security;
alter table mandi_prices enable row level security;
alter table mandi_charges enable row level security;
alter table mandi_distances enable row level security;
alter table transport_rates enable row level security;

-- Reference/catalog data (villages, mandis) is public read-only.
alter table villages enable row level security;
alter table mandis enable row level security;

create policy "public read villages" on villages for select using (true);
create policy "public read mandis" on mandis for select using (true);
create policy "public read mandi_distances" on mandi_distances for select using (true);
create policy "public read mandi_prices" on mandi_prices for select using (true);
create policy "public read mandi_charges" on mandi_charges for select using (true);
create policy "public read transport_rates" on transport_rates for select using (true);

-- Only admins can write market/reference data.
create policy "admins write mandi_prices" on mandi_prices for all
  using (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'));

create policy "admins write mandi_charges" on mandi_charges for all
  using (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'));

create policy "admins write mandi_distances" on mandi_distances for all
  using (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'));

create policy "admins write transport_rates" on transport_rates for all
  using (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from users u where u.auth_user_id = auth.uid() and u.role = 'admin'));

-- Farmers only see their own account, requests, results, and feedback.
create policy "users see self" on users for select using (auth_user_id = auth.uid());

create policy "farmers see own requests" on comparison_requests for select
  using (user_id in (select id from users where auth_user_id = auth.uid()));
create policy "farmers insert own requests" on comparison_requests for insert
  with check (user_id in (select id from users where auth_user_id = auth.uid()));

create policy "farmers see own results" on comparison_results for select
  using (request_id in (
    select cr.id from comparison_requests cr
    join users u on u.id = cr.user_id
    where u.auth_user_id = auth.uid()
  ));

create policy "farmers see own feedback" on farmer_feedback for select
  using (user_id in (select id from users where auth_user_id = auth.uid()));
create policy "farmers insert own feedback" on farmer_feedback for insert
  with check (user_id in (select id from users where auth_user_id = auth.uid()));
