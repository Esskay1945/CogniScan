create table public.cogniscan_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision bigint not null check (revision > 0),
  updated_at timestamptz not null default now()
);

create table public.cogniscan_reminder_devices (
  user_id uuid not null references auth.users(id) on delete cascade,
  installation uuid not null,
  token text not null check (length(token) between 1 and 2048),
  time_zone text not null default 'UTC' check (length(time_zone) <= 100),
  last_reminder_day date,
  primary key (user_id, installation)
);

alter table public.cogniscan_user_state enable row level security;
alter table public.cogniscan_reminder_devices enable row level security;

revoke all on public.cogniscan_user_state, public.cogniscan_reminder_devices from public, anon, authenticated;
grant select, insert, update, delete on public.cogniscan_user_state, public.cogniscan_reminder_devices to authenticated;
grant select, update, delete on public.cogniscan_reminder_devices to service_role;

create policy "Owners manage their progress"
on public.cogniscan_user_state for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Owners manage their reminder devices"
on public.cogniscan_reminder_devices for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create function public.erase_cogniscan_progress()
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.cogniscan_reminder_devices where user_id = (select auth.uid());
  delete from public.cogniscan_user_state where user_id = (select auth.uid());
$$;

revoke execute on function public.erase_cogniscan_progress() from public, anon;
grant execute on function public.erase_cogniscan_progress() to authenticated;
