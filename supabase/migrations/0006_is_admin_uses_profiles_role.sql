-- Ensure RLS admin checks work when roles are managed via `profiles.app_role`.
-- `requireAdmin()` checks `profiles.app_role`, but older RLS policies rely on `public.is_admin()`,
-- which historically read from `admin_roles`. This function now supports both sources.

create or replace function public.is_admin(role_to_check admin_role_enum)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      exists (
        select 1
        from public.profiles p
        where p.user_id = auth.uid()
          and p.app_role::text = role_to_check::text
      )
      or exists (
        select 1
        from public.admin_roles ar
        where ar.user_id = auth.uid()
          and ar.role = role_to_check
      )
    );
$$;
