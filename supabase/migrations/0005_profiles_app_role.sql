-- Make role management editable via `profiles.app_role` (Table Editor friendly)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role_enum') then
    create type app_role_enum as enum ('STUDENT', 'HALL_MASTER', 'HALL_PRESIDENT');
  end if;
end $$;

alter table public.profiles
  add column if not exists app_role app_role_enum not null default 'STUDENT';

-- Backfill from existing admin_roles, so current admins keep access.
update public.profiles p
set app_role = ar.role::text::app_role_enum
from public.admin_roles ar
where ar.user_id = p.user_id;

create or replace function public.sync_admin_roles_from_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Ensure admin_roles mirrors profiles.app_role.
  if new.app_role = 'STUDENT' then
    delete from public.admin_roles where user_id = new.user_id;
  else
    insert into public.admin_roles (user_id, role)
    values (new.user_id, new.app_role::text::admin_role_enum)
    on conflict (user_id) do update set role = excluded.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_admin_roles on public.profiles;
create trigger profiles_sync_admin_roles
  after insert or update of app_role
  on public.profiles
  for each row
  execute procedure public.sync_admin_roles_from_profile_role();

-- Prevent students from changing their own role via RLS.
drop policy if exists "profiles_update_own_no_room_change" on public.profiles;
create policy "profiles_update_own_no_room_change"
on public.profiles for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and room_id is not distinct from (
    select p.room_id from public.profiles p where p.user_id = auth.uid()
  )
  and app_role is not distinct from (
    select p.app_role from public.profiles p where p.user_id = auth.uid()
  )
);

