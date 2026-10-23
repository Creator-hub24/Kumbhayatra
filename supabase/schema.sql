-- Kumbhayatra: Supabase schema (run once in Supabase > SQL Editor, then run seed.sql)
-- Roles: public visitors (anon), business owners (logged in), admin (profiles.role = 'admin').

-- ---------- helpers ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'business' check (role in ('admin','business')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, role) values (new.id, 'business') on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------- guide content (admin-edited, public read) ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_hi text not null, name_en text not null,
  starts_on date not null, ends_on date not null,
  is_current boolean not null default false,
  note_hi text, note_en text,
  updated_at timestamptz not null default now()
);

create table if not exists public.snan_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  snan_on date not null,
  name_hi text not null, name_en text not null,
  crowd text not null default 'high' check (crowd in ('calm','moderate','high','very_high')),
  tip_hi text, tip_en text,
  is_confirmed boolean not null default false,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_hi text not null, name_en text not null,
  type text not null check (type in ('ghat','temple','heritage','medical','parking','facility','market')),
  area text, lat numeric, lng numeric,
  desc_hi text, desc_en text, timings text,
  is_published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  days int not null check (days between 1 and 7),
  title_hi text not null, title_en text not null,
  summary_hi text, summary_en text,
  stops jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  city_key text unique not null,
  city_hi text not null, city_en text not null,
  summary_hi text, summary_en text,
  modes jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'info' check (kind in ('traffic','safety','weather','info')),
  msg_hi text not null, msg_en text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('winter','bath','documents','kids','elders','money','phone')),
  item_hi text not null, item_en text not null,
  sort int not null default 0
);

create table if not exists public.price_guides (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  label_hi text not null, label_en text not null,
  min_price int, max_price int,
  unit_hi text, unit_en text,
  note_hi text, note_en text,
  is_published boolean not null default true,
  sort int not null default 0
);

-- ---------- businesses ----------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('stay','boat','driver')),
  name text not null check (char_length(name) between 2 and 80),
  area text check (char_length(area) <= 80),
  phone text check (phone ~ '^[0-9+ -]{8,16}$'),
  whatsapp text check (whatsapp ~ '^[0-9]{10,13}$'),
  description text check (char_length(description) <= 600),
  photo_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','verified','suspended')),
  season_active boolean not null default true,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (type in ('room','tent','dormitory','boat_ride','taxi','tempo')),
  title text not null check (char_length(title) between 2 and 80),
  price_min int not null check (price_min >= 0 and price_min <= 1000000),
  price_max int check (price_max is null or (price_max >= price_min and price_max <= 1000000)),
  price_unit text not null default 'per night' check (price_unit in ('per night','per ride','per trip','per day','per person')),
  capacity int check (capacity between 1 and 200),
  details text check (char_length(details) <= 400),
  available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  checked_by uuid references auth.users(id),
  method text not null check (method in ('call','visit','document')),
  notes text,
  checked_on date not null default current_date
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  author_name text check (char_length(author_name) <= 40),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  reason text not null check (reason in ('overcharging','fake','rude','unsafe','other')),
  details text check (char_length(details) <= 800),
  contact text check (char_length(contact) <= 80),
  status text not null default 'open' check (status in ('open','reviewed','action_taken','dismissed')),
  created_at timestamptz not null default now()
);

-- ---------- visitors and leads ----------
create table if not exists public.trip_requests (
  id uuid primary key default gen_random_uuid(),
  city text check (char_length(city) <= 60),
  adults int not null default 1 check (adults between 0 and 60),
  kids int not null default 0 check (kids between 0 and 60),
  elders int not null default 0 check (elders between 0 and 60),
  days int not null check (days between 1 and 7),
  arrive_on date,
  stay_pref text check (stay_pref in ('hotel','dharamshala','tent','any')),
  lang text check (lang in ('hi','en')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','call')),
  status text not null default 'sent' check (status in ('sent','contacted','booked','closed')),
  created_at timestamptz not null default now()
);

-- ---------- triggers ----------
create or replace function public.guard_business() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      new.owner_id := auth.uid();
      new.status := 'pending';
      new.verified_at := null;
    end if;
    return new;
  end if;
  -- UPDATE
  if not public.is_admin() then
    new.owner_id := old.owner_id;
    new.verified_at := old.verified_at;
    new.status := old.status;
    -- identity/contact changes on a verified listing send it back for re-check
    if old.status = 'verified' and (new.name is distinct from old.name or new.phone is distinct from old.phone or new.whatsapp is distinct from old.whatsapp) then
      new.status := 'pending';
      new.verified_at := null;
    end if;
  elsif new.status = 'verified' and old.status <> 'verified' then
    new.verified_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_guard_business on public.businesses;
create trigger trg_guard_business before insert or update on public.businesses
  for each row execute function public.guard_business();

drop trigger if exists trg_touch_offers on public.offers;
create trigger trg_touch_offers before update on public.offers
  for each row execute function public.touch_updated_at();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.snan_dates enable row level security;
alter table public.places enable row level security;
alter table public.itineraries enable row level security;
alter table public.routes enable row level security;
alter table public.notices enable row level security;
alter table public.checklists enable row level security;
alter table public.price_guides enable row level security;
alter table public.businesses enable row level security;
alter table public.offers enable row level security;
alter table public.verifications enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.trip_requests enable row level security;
alter table public.leads enable row level security;

-- profiles: you can read your own row; only admins change roles
create policy profiles_read_own on public.profiles for select using (user_id = auth.uid() or public.is_admin());
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- guide content: public read, admin write
do $$
declare t text;
begin
  foreach t in array array['events','snan_dates','places','itineraries','routes','checklists','price_guides'] loop
    execute format('create policy %I on public.%I for select using (true)', t || '_public_read', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', t || '_admin_write', t);
  end loop;
end $$;

-- notices: public sees active, in-window notices
create policy notices_public_read on public.notices for select
  using (is_active and starts_at <= now() and (ends_at is null or ends_at > now()));
create policy notices_admin_all on public.notices for all using (public.is_admin()) with check (public.is_admin());

-- businesses
create policy biz_public_read on public.businesses for select using (status = 'verified' and season_active);
create policy biz_owner_read on public.businesses for select using (owner_id = auth.uid());
create policy biz_owner_insert on public.businesses for insert with check (owner_id = auth.uid());
create policy biz_owner_update on public.businesses for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy biz_admin_all on public.businesses for all using (public.is_admin()) with check (public.is_admin());

-- offers
create policy offers_public_read on public.offers for select using (
  available and exists (select 1 from public.businesses b where b.id = business_id and b.status = 'verified' and b.season_active));
create policy offers_owner_all on public.offers for all
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy offers_admin_all on public.offers for all using (public.is_admin()) with check (public.is_admin());

-- verifications: admin only (internal)
create policy verif_admin_all on public.verifications for all using (public.is_admin()) with check (public.is_admin());

-- reviews: anyone may submit (held for approval); public reads approved only
create policy reviews_public_read on public.reviews for select using (approved);
create policy reviews_public_insert on public.reviews for insert with check (approved = false);
create policy reviews_admin_all on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- reports: anyone may submit; only admin reads
create policy reports_public_insert on public.reports for insert with check (status = 'open');
create policy reports_admin_all on public.reports for all using (public.is_admin()) with check (public.is_admin());

-- trip requests: anyone may submit; only admin reads
create policy trips_public_insert on public.trip_requests for insert with check (true);
create policy trips_admin_all on public.trip_requests for all using (public.is_admin()) with check (public.is_admin());

-- leads: anyone may log a lead for a live business; owners read their own; admin all
create policy leads_public_insert on public.leads for insert with check (
  status = 'sent' and exists (select 1 from public.businesses b where b.id = business_id and b.status = 'verified' and b.season_active));
create policy leads_owner_read on public.leads for select using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy leads_admin_all on public.leads for all using (public.is_admin()) with check (public.is_admin());

-- ---------- make yourself admin (run AFTER you sign in once on admin.html) ----------
-- update public.profiles set role = 'admin' where user_id = (select id from auth.users where email = 'YOUR_EMAIL');
