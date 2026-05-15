-- Admin/president allocation policies and helper functions

create or replace function public.is_president()
returns boolean
language sql
stable
as $$
  select public.is_admin('HALL_PRESIDENT');
$$;

create or replace function public.is_master()
returns boolean
language sql
stable
as $$
  select public.is_admin('HALL_MASTER');
$$;

-- Prevent students from changing their own room_id directly
drop policy if exists "profiles_update_own_basic" on public.profiles;
create policy "profiles_update_own_no_room_change"
on public.profiles for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and room_id is not distinct from (
    select p.room_id from public.profiles p where p.user_id = auth.uid()
  )
);

-- Presidents can assign/reassign rooms (must respect capacity in app logic)
drop policy if exists "profiles_update_room_by_president" on public.profiles;
create policy "profiles_update_room_by_president"
on public.profiles for update
to authenticated
using (public.is_president())
with check (public.is_president());

-- Requests: presidents can decide (approve/reject/cancel etc.)
drop policy if exists "requests_update_by_president" on public.room_requests;
create policy "requests_update_by_president"
on public.room_requests for update
to authenticated
using (public.is_president())
with check (public.is_president());

-- Admin roles: presidents can promote/demote
drop policy if exists "admin_roles_manage_by_president" on public.admin_roles;
create policy "admin_roles_manage_by_president"
on public.admin_roles for all
to authenticated
using (public.is_president())
with check (public.is_president());

-- Allow admins (masters/presidents) to read logistics
drop policy if exists "logistics_admin_only" on public.logistics_items;
create policy "logistics_admin_only"
on public.logistics_items for all
to authenticated
using (public.is_master() or public.is_president())
with check (public.is_master() or public.is_president());

