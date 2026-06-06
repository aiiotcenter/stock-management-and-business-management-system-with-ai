-- TechField next changes:
-- customer stock, stock transfer RPCs, job photo storage.

create table if not exists public.customer_stock (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (customer_id, item_id)
);

create index if not exists idx_customer_stock_customer on public.customer_stock(customer_id);
alter table public.customer_stock enable row level security;

drop policy if exists "customer_stock_select_authenticated" on public.customer_stock;
create policy "customer_stock_select_authenticated" on public.customer_stock
  for select using (auth.role() = 'authenticated');

drop policy if exists "customer_stock_admin_all" on public.customer_stock;
create policy "customer_stock_admin_all" on public.customer_stock
  for all using (public.is_admin()) with check (public.is_admin());

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

insert into storage.buckets (id, name, public)
values ('fault-photos', 'fault-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "fault_photos_storage_read" on storage.objects;
create policy "fault_photos_storage_read" on storage.objects
  for select using (bucket_id = 'fault-photos' and auth.role() = 'authenticated');

drop policy if exists "fault_photos_storage_insert" on storage.objects;
create policy "fault_photos_storage_insert" on storage.objects
  for insert with check (bucket_id = 'fault-photos' and auth.role() = 'authenticated');

drop policy if exists "fault_photos_select" on public.fault_photos;
create policy "fault_photos_select" on public.fault_photos
  for select using (
    uploaded_by = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.jobs j
      where j.id = fault_photos.job_id
        and j.assigned_employee_id = auth.uid()
    )
  );

drop policy if exists "fault_photos_insert_self" on public.fault_photos;
create policy "fault_photos_insert_self" on public.fault_photos
  for insert with check (uploaded_by = auth.uid() or uploaded_by is null);

drop policy if exists "ai_messages_delete_self" on public.ai_messages;
create policy "ai_messages_delete_self" on public.ai_messages
  for delete using (user_id = auth.uid() or public.is_admin());

-- Ask Supabase PostgREST API to reload the schema cache.
notify pgrst, 'reload schema';
