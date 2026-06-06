-- TechField full Supabase setup
-- Run this in Supabase SQL Editor after creating the project.
-- Auth users are still created from Supabase Auth UI/API; this schema stores app data.

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing old TechField databases may already have profiles(ad, rol, telefon).
-- This upgrades that table without deleting existing users.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text default 'employee';
alter table public.profiles add column if not exists active boolean default true;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'ad') then
    execute 'update public.profiles set full_name = coalesce(full_name, ad) where full_name is null';
  end if;

  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'telefon') then
    execute 'update public.profiles set phone = coalesce(phone, telefon) where phone is null';
  end if;

  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'rol') then
    execute 'update public.profiles set role = coalesce(role, rol) where role is null or role = ''employee''';
  end if;
end $$;

update public.profiles
set full_name = coalesce(full_name, email, id::text),
    role = case when role = 'admin' then 'admin' else 'employee' end,
    active = coalesce(active, true)
where full_name is null
   or role is null
   or active is null;

-- ---------- helpers ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'ad', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'rol', 'employee')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- customers ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  district text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- inventory ----------
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  warehouse text not null default 'Merkez Depo',
  quantity integer not null default 0 check (quantity >= 0),
  min_quantity integer not null default 2 check (min_quantity >= 0),
  unit text not null default 'adet',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stock assigned to an employee.
create table if not exists public.employee_stock (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (employee_id, item_id)
);

-- Stock installed/sold to customers.
create table if not exists public.customer_stock (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (customer_id, item_id)
);

-- Every inventory/employee stock action.
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.profiles(id) on delete set null,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  job_id uuid,
  movement_type text not null check (movement_type in ('main_in', 'main_out', 'employee_in', 'employee_out', 'sale', 'job_use', 'adjustment')),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2),
  total_price numeric(12,2) generated always as (coalesce(unit_price, 0) * quantity) stored,
  note text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- ---------- jobs ----------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  assigned_employee_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category text check (category in ('camera', 'antenna', 'internet', 'it', 'other')),
  priority text not null default 'normal' check (priority in ('normal', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  address text,
  district text,
  planned_date date,
  completed_at timestamptz,
  fee numeric(12,2),
  ai_diagnosis text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stock_movements
  drop constraint if exists stock_movements_job_id_fkey;
alter table public.stock_movements
  add constraint stock_movements_job_id_fkey
  foreign key (job_id) references public.jobs(id) on delete set null;

create table if not exists public.job_used_stock (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

-- ---------- live location ----------
create table if not exists public.employee_locations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade unique,
  lat double precision not null,
  lng double precision not null,
  accuracy double precision,
  updated_at timestamptz not null default now()
);

-- ---------- AI ----------
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null default auth.uid(),
  job_id uuid references public.jobs(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- AI may propose database-changing actions; app should require confirmation first.
create table if not exists public.ai_action_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references public.profiles(id) on delete set null default auth.uid(),
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'executed', 'failed')),
  result jsonb,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  executed_at timestamptz
);

-- Fault photos uploaded by employees.
create table if not exists public.fault_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  image_url text not null,
  note text,
  ai_result text,
  created_at timestamptz not null default now()
);

-- ---------- useful RPCs ----------
create or replace function public.assign_stock_to_employee(
  p_employee_id uuid,
  p_item_id uuid,
  p_quantity integer,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign stock';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  update public.inventory_items
  set quantity = quantity - p_quantity,
      updated_at = now()
  where id = p_item_id
    and quantity >= p_quantity;

  if not found then
    raise exception 'Main inventory stock is insufficient';
  end if;

  insert into public.employee_stock (employee_id, item_id, quantity)
  values (p_employee_id, p_item_id, p_quantity)
  on conflict (employee_id, item_id)
  do update set
    quantity = public.employee_stock.quantity + excluded.quantity,
    updated_at = now();

  insert into public.stock_movements (employee_id, item_id, movement_type, quantity, note)
  values (p_employee_id, p_item_id, 'employee_in', p_quantity, coalesce(p_note, 'Stock assigned to employee'));

  insert into public.stock_movements (employee_id, item_id, movement_type, quantity, note)
  values (p_employee_id, p_item_id, 'main_out', p_quantity, coalesce(p_note, 'Stock moved from main inventory to employee'));
end;
$$;

create or replace function public.sell_employee_stock_to_customer(
  p_employee_id uuid,
  p_customer_id uuid,
  p_item_id uuid,
  p_quantity integer,
  p_unit_price numeric default 0,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can transfer stock to customer';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  update public.employee_stock
  set quantity = quantity - p_quantity,
      updated_at = now()
  where employee_id = p_employee_id
    and item_id = p_item_id
    and quantity >= p_quantity;

  if not found then
    raise exception 'Employee stock is insufficient';
  end if;

  insert into public.customer_stock (customer_id, item_id, quantity)
  values (p_customer_id, p_item_id, p_quantity)
  on conflict (customer_id, item_id)
  do update set
    quantity = public.customer_stock.quantity + excluded.quantity,
    updated_at = now();

  insert into public.stock_movements (employee_id, customer_id, item_id, movement_type, quantity, unit_price, note)
  values (p_employee_id, p_customer_id, p_item_id, 'sale', p_quantity, p_unit_price, coalesce(p_note, 'Stock transferred to customer'));
end;
$$;

create or replace function public.complete_job_with_stock(
  p_job_id uuid,
  p_item_id uuid default null,
  p_quantity integer default 0,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_employee_id uuid;
begin
  select assigned_employee_id into v_employee_id
  from public.jobs
  where id = p_job_id;

  if v_employee_id is null then
    raise exception 'Job has no assigned employee';
  end if;

  if auth.uid() <> v_employee_id and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  if p_item_id is not null and p_quantity > 0 then
    update public.employee_stock
    set quantity = quantity - p_quantity,
        updated_at = now()
    where employee_id = v_employee_id
      and item_id = p_item_id
      and quantity >= p_quantity;

    if not found then
      raise exception 'Employee stock is insufficient';
    end if;

    insert into public.job_used_stock (job_id, employee_id, item_id, quantity)
    values (p_job_id, v_employee_id, p_item_id, p_quantity);

    insert into public.stock_movements (employee_id, item_id, job_id, movement_type, quantity, note)
    values (v_employee_id, p_item_id, p_job_id, 'job_use', p_quantity, coalesce(p_note, 'Used while completing job'));
  end if;

  update public.jobs
  set status = 'completed',
      completed_at = now(),
      updated_at = now()
  where id = p_job_id;
end;
$$;

-- ---------- indexes ----------
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_jobs_assigned_employee on public.jobs(assigned_employee_id);
create index if not exists idx_jobs_status_date on public.jobs(status, planned_date);
create index if not exists idx_employee_stock_employee on public.employee_stock(employee_id);
create index if not exists idx_customer_stock_customer on public.customer_stock(customer_id);
create index if not exists idx_stock_movements_employee_date on public.stock_movements(employee_id, created_at desc);
create index if not exists idx_employee_locations_employee on public.employee_locations(employee_id);
create index if not exists idx_ai_messages_user_date on public.ai_messages(user_id, created_at desc);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.employee_stock enable row level security;
alter table public.customer_stock enable row level security;
alter table public.stock_movements enable row level security;
alter table public.jobs enable row level security;
alter table public.job_used_stock enable row level security;
alter table public.employee_locations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_action_requests enable row level security;
alter table public.fault_photos enable row level security;

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- customers
drop policy if exists "customers_select_authenticated" on public.customers;
create policy "customers_select_authenticated" on public.customers
  for select using (auth.role() = 'authenticated');

drop policy if exists "customers_admin_all" on public.customers;
create policy "customers_admin_all" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

-- inventory
drop policy if exists "inventory_select_authenticated" on public.inventory_items;
create policy "inventory_select_authenticated" on public.inventory_items
  for select using (auth.role() = 'authenticated');

drop policy if exists "inventory_admin_all" on public.inventory_items;
create policy "inventory_admin_all" on public.inventory_items
  for all using (public.is_admin()) with check (public.is_admin());

-- employee stock
drop policy if exists "employee_stock_select" on public.employee_stock;
create policy "employee_stock_select" on public.employee_stock
  for select using (employee_id = auth.uid() or public.is_admin());

drop policy if exists "employee_stock_admin_all" on public.employee_stock;
create policy "employee_stock_admin_all" on public.employee_stock
  for all using (public.is_admin()) with check (public.is_admin());

-- customer stock
drop policy if exists "customer_stock_select_authenticated" on public.customer_stock;
create policy "customer_stock_select_authenticated" on public.customer_stock
  for select using (auth.role() = 'authenticated');

drop policy if exists "customer_stock_admin_all" on public.customer_stock;
create policy "customer_stock_admin_all" on public.customer_stock
  for all using (public.is_admin()) with check (public.is_admin());

-- stock movements
drop policy if exists "stock_movements_select" on public.stock_movements;
create policy "stock_movements_select" on public.stock_movements
  for select using (employee_id = auth.uid() or created_by = auth.uid() or public.is_admin());

drop policy if exists "stock_movements_admin_insert" on public.stock_movements;
create policy "stock_movements_admin_insert" on public.stock_movements
  for insert with check (public.is_admin());

-- jobs
drop policy if exists "jobs_select" on public.jobs;
create policy "jobs_select" on public.jobs
  for select using (assigned_employee_id = auth.uid() or public.is_admin());

drop policy if exists "jobs_admin_all" on public.jobs;
create policy "jobs_admin_all" on public.jobs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "jobs_employee_update_assigned" on public.jobs;
create policy "jobs_employee_update_assigned" on public.jobs
  for update using (assigned_employee_id = auth.uid())
  with check (assigned_employee_id = auth.uid());

-- used stock
drop policy if exists "job_used_stock_select" on public.job_used_stock;
create policy "job_used_stock_select" on public.job_used_stock
  for select using (employee_id = auth.uid() or public.is_admin());

drop policy if exists "job_used_stock_employee_insert" on public.job_used_stock;
create policy "job_used_stock_employee_insert" on public.job_used_stock
  for insert with check (employee_id = auth.uid() or public.is_admin());

-- locations
drop policy if exists "locations_select" on public.employee_locations;
create policy "locations_select" on public.employee_locations
  for select using (employee_id = auth.uid() or public.is_admin());

drop policy if exists "locations_employee_upsert" on public.employee_locations;
create policy "locations_employee_upsert" on public.employee_locations
  for all using (employee_id = auth.uid())
  with check (employee_id = auth.uid());

-- AI messages
drop policy if exists "ai_messages_select" on public.ai_messages;
create policy "ai_messages_select" on public.ai_messages
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai_messages_insert_self" on public.ai_messages;
create policy "ai_messages_insert_self" on public.ai_messages
  for insert with check (user_id = auth.uid() or user_id is null);

drop policy if exists "ai_messages_delete_self" on public.ai_messages;
create policy "ai_messages_delete_self" on public.ai_messages
  for delete using (user_id = auth.uid() or public.is_admin());

-- AI actions
drop policy if exists "ai_actions_select" on public.ai_action_requests;
create policy "ai_actions_select" on public.ai_action_requests
  for select using (requested_by = auth.uid() or public.is_admin());

drop policy if exists "ai_actions_insert_self" on public.ai_action_requests;
create policy "ai_actions_insert_self" on public.ai_action_requests
  for insert with check (requested_by = auth.uid() or requested_by is null);

drop policy if exists "ai_actions_admin_update" on public.ai_action_requests;
create policy "ai_actions_admin_update" on public.ai_action_requests
  for update using (requested_by = auth.uid() or public.is_admin())
  with check (requested_by = auth.uid() or public.is_admin());

-- fault photos
drop policy if exists "fault_photos_select" on public.fault_photos;
create policy "fault_photos_select" on public.fault_photos
  for select using (uploaded_by = auth.uid() or public.is_admin());

drop policy if exists "fault_photos_insert_self" on public.fault_photos;
create policy "fault_photos_insert_self" on public.fault_photos
  for insert with check (uploaded_by = auth.uid() or uploaded_by is null);

-- ---------- storage notes ----------
-- In Supabase Dashboard > Storage, create a bucket named:
-- fault-photos
-- For this frontend prototype, public bucket is easiest because the app stores public URLs.
insert into storage.buckets (id, name, public)
values ('fault-photos', 'fault-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "fault_photos_storage_read" on storage.objects;
create policy "fault_photos_storage_read" on storage.objects
  for select using (bucket_id = 'fault-photos' and auth.role() = 'authenticated');

drop policy if exists "fault_photos_storage_insert" on storage.objects;
create policy "fault_photos_storage_insert" on storage.objects
  for insert with check (bucket_id = 'fault-photos' and auth.role() = 'authenticated');

-- ---------- admin fix helper ----------
-- Login yaptigin e-posta icin profiles satirini Auth kullanicisiyle esitlemek istersen:
-- 1) Asagidaki e-postayi kendi admin e-postanla degistir.
-- 2) Sadece bu blogu Supabase SQL Editor'de calistir.
/*
insert into public.profiles (id, full_name, email, role, active)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'ad', split_part(u.email, '@', 1)),
  u.email,
  'admin',
  true
from auth.users u
where lower(u.email) = lower('ADMIN_EMAILINI_BURAYA_YAZ')
on conflict (id) do update
set role = 'admin',
    active = true,
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

select id, full_name, email, role, active
from public.profiles
where lower(email) = lower('ADMIN_EMAILINI_BURAYA_YAZ');
*/
