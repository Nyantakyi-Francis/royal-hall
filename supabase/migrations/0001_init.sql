-- Royal Hall (Hall 1) DBMS schema

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'hall_enum') then
    create type hall_enum as enum ('HALL_1');
  end if;
  if not exists (select 1 from pg_type where typname = 'level_enum') then
    create type level_enum as enum ('LEVEL_100', 'LEVEL_200', 'LEVEL_300');
  end if;
  if not exists (select 1 from pg_type where typname = 'blog_enum') then
    create type blog_enum as enum ('MAIN_BLOG', 'ANNEX_BLOG', 'TRASSACO_BLOG', 'EAST_LEGON_BLOG');
  end if;
  if not exists (select 1 from pg_type where typname = 'request_status_enum') then
    create type request_status_enum as enum ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_ASSIGNED', 'CANCELLED');
  end if;
  if not exists (select 1 from pg_type where typname = 'admin_role_enum') then
    create type admin_role_enum as enum ('HALL_MASTER', 'HALL_PRESIDENT');
  end if;
end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name text not null,
  hall hall_enum not null default 'HALL_1',
  level level_enum not null,
  room_id uuid null
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  blog blog_enum not null,
  code text not null unique,
  capacity integer not null check (capacity >= 0)
);

alter table public.profiles
  add constraint profiles_room_fk
  foreign key (room_id) references public.rooms(id) on delete set null;

create table if not exists public.room_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  requested_room_id uuid not null references public.rooms(id) on delete cascade,
  status request_status_enum not null default 'PENDING',
  admin_feedback text null,
  decided_at timestamptz null,
  decided_by uuid null references auth.users(id) on delete set null
);

create unique index if not exists room_requests_one_pending_per_student
on public.room_requests(student_user_id)
where status = 'PENDING';

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  role admin_role_enum not null
);

create table if not exists public.logistics_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  item_description text not null unique,
  quantity integer not null default 0,
  good_condition integer null,
  poor_condition integer null,
  items_in_store integer null,
  items_in_use integer null
);

create or replace view public.rooms_with_occupancy as
select
  r.id,
  r.blog,
  r.code,
  r.capacity,
  coalesce(count(p.user_id), 0)::int as occupied_count
from public.rooms r
left join public.profiles p on p.room_id = r.id
group by r.id, r.blog, r.code, r.capacity;

create or replace function public.is_admin(role_to_check admin_role_enum)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role = role_to_check
  );
$$;

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_requests enable row level security;
alter table public.admin_roles enable row level security;
alter table public.logistics_items enable row level security;

-- profiles: student can see & manage their own profile basics
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (user_id = auth.uid() or public.is_admin('HALL_MASTER') or public.is_admin('HALL_PRESIDENT'));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profiles_update_own_basic" on public.profiles;
create policy "profiles_update_own_basic"
on public.profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- rooms: readable by any authenticated user
drop policy if exists "rooms_select_all" on public.rooms;
create policy "rooms_select_all"
on public.rooms for select
to authenticated
using (true);

-- room_requests: student CRUD own; admins can view and decide
drop policy if exists "requests_select_own_or_admin" on public.room_requests;
create policy "requests_select_own_or_admin"
on public.room_requests for select
to authenticated
using (
  student_user_id = auth.uid()
  or public.is_admin('HALL_MASTER')
  or public.is_admin('HALL_PRESIDENT')
);

drop policy if exists "requests_insert_own" on public.room_requests;
create policy "requests_insert_own"
on public.room_requests for insert
to authenticated
with check (student_user_id = auth.uid());

drop policy if exists "requests_update_own_cancel" on public.room_requests;
create policy "requests_update_own_cancel"
on public.room_requests for update
to authenticated
using (student_user_id = auth.uid())
with check (student_user_id = auth.uid());

-- admin_roles: hidden from normal users
drop policy if exists "admin_roles_select_self_only" on public.admin_roles;
create policy "admin_roles_select_self_only"
on public.admin_roles for select
to authenticated
using (user_id = auth.uid());

-- logistics: admins only
drop policy if exists "logistics_admin_only" on public.logistics_items;
create policy "logistics_admin_only"
on public.logistics_items for all
to authenticated
using (public.is_admin('HALL_MASTER') or public.is_admin('HALL_PRESIDENT'))
with check (public.is_admin('HALL_MASTER') or public.is_admin('HALL_PRESIDENT'));

