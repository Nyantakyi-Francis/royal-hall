-- Auto-create profiles on signup (works even when email confirmations are required)

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, hall, level, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    'HALL_1',
    coalesce((new.raw_user_meta_data->>'level')::level_enum, 'LEVEL_100'::level_enum),
    new.email
  )
  on conflict (user_id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

