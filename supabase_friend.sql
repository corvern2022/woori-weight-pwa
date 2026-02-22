create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  primary key (household_id, user_id),
  unique (user_id)
);

create table if not exists public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0 and weight_kg < 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.weigh_ins add column if not exists drank boolean not null default false;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal_kg numeric(5,2),
  diet_start_date date,
  updated_at timestamptz not null default now()
);
alter table public.user_profiles add column if not exists diet_start_date date;

create index if not exists weigh_ins_household_date_idx on public.weigh_ins(household_id, date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_weigh_ins_updated_at on public.weigh_ins;
create trigger trg_weigh_ins_updated_at
before update on public.weigh_ins
for each row
execute function public.set_updated_at();

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  ok boolean := false;
begin
  while not ok loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;

    select not exists(select 1 from public.households h where h.invite_code = candidate)
    into ok;
  end loop;

  return candidate;
end;
$$;

create or replace function public.get_my_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select hm.household_id
  from public.household_members hm
  where hm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.create_my_household(p_display_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
  v_invite text;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select hm.household_id into v_household_id
  from public.household_members hm
  where hm.user_id = v_user_id
  limit 1;

  if v_household_id is not null then
    return (select h.invite_code from public.households h where h.id = v_household_id);
  end if;

  v_invite := public.generate_invite_code();

  insert into public.households (invite_code, created_by)
  values (v_invite, v_user_id)
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id, display_name)
  values (v_household_id, v_user_id, coalesce(nullif(trim(p_display_name), ''), '사용자'));

  return v_invite;
end;
$$;

create or replace function public.join_household_with_code(p_invite_code text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
  v_member_count int;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select hm.household_id into v_household_id
  from public.household_members hm
  where hm.user_id = v_user_id
  limit 1;

  if v_household_id is not null then
    return v_household_id;
  end if;

  select h.id into v_household_id
  from public.households h
  where h.invite_code = upper(trim(p_invite_code))
  limit 1;

  if v_household_id is null then
    raise exception 'invalid invite code';
  end if;

  select count(*) into v_member_count
  from public.household_members hm
  where hm.household_id = v_household_id;

  if v_member_count >= 2 then
    raise exception 'household is full';
  end if;

  insert into public.household_members (household_id, user_id, display_name)
  values (v_household_id, v_user_id, coalesce(nullif(trim(p_display_name), ''), '사용자'));

  return v_household_id;
end;
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.weigh_ins enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists households_select_same_household on public.households;
create policy households_select_same_household
on public.households
for select to authenticated
using (id = public.get_my_household_id());

drop policy if exists members_select_same_household on public.household_members;
create policy members_select_same_household
on public.household_members
for select to authenticated
using (household_id = public.get_my_household_id());

drop policy if exists weigh_ins_select_same_household on public.weigh_ins;
create policy weigh_ins_select_same_household
on public.weigh_ins
for select to authenticated
using (household_id = public.get_my_household_id());

drop policy if exists weigh_ins_insert_self on public.weigh_ins;
create policy weigh_ins_insert_self
on public.weigh_ins
for insert to authenticated
with check (
  household_id = public.get_my_household_id()
  and user_id = auth.uid()
);

drop policy if exists weigh_ins_update_self on public.weigh_ins;
create policy weigh_ins_update_self
on public.weigh_ins
for update to authenticated
using (
  household_id = public.get_my_household_id()
  and user_id = auth.uid()
)
with check (
  household_id = public.get_my_household_id()
  and user_id = auth.uid()
);

drop policy if exists user_profiles_select_self on public.user_profiles;
create policy user_profiles_select_self
on public.user_profiles
for select to authenticated
using (user_id = auth.uid());

drop policy if exists user_profiles_insert_self on public.user_profiles;
create policy user_profiles_insert_self
on public.user_profiles
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists user_profiles_update_self on public.user_profiles;
create policy user_profiles_update_self
on public.user_profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant execute on function public.get_my_household_id() to authenticated;
grant execute on function public.create_my_household(text) to authenticated;
grant execute on function public.join_household_with_code(text, text) to authenticated;
grant execute on function public.generate_invite_code() to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_rel pr
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_publication p on p.oid = pr.prpubid
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'weigh_ins'
  ) then
    alter publication supabase_realtime add table public.weigh_ins;
  end if;
end $$;
