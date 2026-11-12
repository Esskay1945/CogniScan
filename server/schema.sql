create table if not exists cogniscan.progress (
  user_id text primary key references cogniscan."user"(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision integer not null check (revision > 0)
);

create table if not exists cogniscan.reminder_device (
  user_id text not null references cogniscan."user"(id) on delete cascade,
  installation uuid not null,
  token text not null check (length(token) between 1 and 2048),
  time_zone text not null check (length(time_zone) <= 100),
  last_reminder_day date,
  primary key (user_id, installation)
);
