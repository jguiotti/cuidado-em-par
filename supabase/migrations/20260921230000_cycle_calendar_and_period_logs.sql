-- purpose: menstrual cycle calendar fields, period logs, and reminder prefs
-- affected: user_cycle_profiles, cycle_period_logs
-- notes: module remains opt-in (row presence + cycle_module consent).
--   Dates are sensitive; RLS owner-only. Phase tags still feed list_safe_exercises.

alter table public.user_cycle_profiles
  add column if not exists last_period_start date;

alter table public.user_cycle_profiles
  add column if not exists average_cycle_length_days integer not null default 28;

alter table public.user_cycle_profiles
  add column if not exists average_period_length_days integer not null default 5;

alter table public.user_cycle_profiles
  add column if not exists remind_period_approaching boolean not null default true;

alter table public.user_cycle_profiles
  add column if not exists remind_fertile_window boolean not null default true;

alter table public.user_cycle_profiles
  add column if not exists remind_late_or_possible_pregnancy boolean not null default true;

alter table public.user_cycle_profiles
  drop constraint if exists user_cycle_profiles_cycle_length_check;

alter table public.user_cycle_profiles
  add constraint user_cycle_profiles_cycle_length_check check (
    average_cycle_length_days between 21 and 45
  );

alter table public.user_cycle_profiles
  drop constraint if exists user_cycle_profiles_period_length_check;

alter table public.user_cycle_profiles
  add constraint user_cycle_profiles_period_length_check check (
    average_period_length_days between 2 and 10
  );

comment on column public.user_cycle_profiles.last_period_start is
  'Start date of the most recently logged menstrual period (calendar method). Not a diagnosis.';

comment on column public.user_cycle_profiles.average_cycle_length_days is
  'Self-reported typical cycle length used for fertile-window estimates.';

comment on column public.user_cycle_profiles.average_period_length_days is
  'Self-reported typical bleeding length.';

comment on column public.user_cycle_profiles.remind_period_approaching is
  'Local reminder preference: period approaching.';

comment on column public.user_cycle_profiles.remind_fertile_window is
  'Local reminder preference: fertile window starting.';

comment on column public.user_cycle_profiles.remind_late_or_possible_pregnancy is
  'Local reminder preference: late period / consider logging or possible pregnancy.';

create table if not exists public.cycle_period_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  period_start date not null,
  period_end date,
  created_at timestamptz not null default now(),
  constraint cycle_period_logs_range_check check (
    period_end is null or period_end >= period_start
  ),
  unique (user_id, period_start)
);

comment on table public.cycle_period_logs is
  'Sensitive menstrual period log entries for calendar view. Owner-only via RLS.';

create index if not exists cycle_period_logs_user_start_idx
  on public.cycle_period_logs (user_id, period_start desc);

alter table public.cycle_period_logs enable row level security;

drop policy if exists "users can select own cycle period logs" on public.cycle_period_logs;
create policy "users can select own cycle period logs"
  on public.cycle_period_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own cycle period logs" on public.cycle_period_logs;
create policy "users can insert own cycle period logs"
  on public.cycle_period_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own cycle period logs" on public.cycle_period_logs;
create policy "users can update own cycle period logs"
  on public.cycle_period_logs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own cycle period logs" on public.cycle_period_logs;
create policy "users can delete own cycle period logs"
  on public.cycle_period_logs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
