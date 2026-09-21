-- purpose: Allow per-exercise and per-meal habit completions in the same day
-- affected: habit_logs.content_id, habit_logs.content_key, unique constraint
-- notes: Day-level habits (water, sleep, active-pause) keep content_key = ''.
--   Workout/meal rows set content_id to the library item uuid and content_key to its text.

alter table public.habit_logs
  add column if not exists content_id uuid;

alter table public.habit_logs
  add column if not exists content_key text not null default '';

comment on column public.habit_logs.content_id is
  'Exercise or meal library id when kind is workout or meal. Null for day-level habits.';

comment on column public.habit_logs.content_key is
  'Dedup key: empty for day-level habits; content_id::text for per-item completions.';

update public.habit_logs
set content_key = coalesce(content_id::text, '')
where content_key is distinct from coalesce(content_id::text, '');

alter table public.habit_logs
  drop constraint if exists habit_logs_user_id_day_kind_key;

alter table public.habit_logs
  drop constraint if exists habit_logs_user_day_kind_unique;

-- Original create used: unique (user_id, day, kind) — Postgres names it habit_logs_user_id_day_kind_key
do $$
declare
  constraint_name text;
begin
  select tc.constraint_name
  into constraint_name
  from information_schema.table_constraints as tc
  where tc.table_schema = 'public'
    and tc.table_name = 'habit_logs'
    and tc.constraint_type = 'unique'
    and tc.constraint_name like '%day%kind%'
  limit 1;

  if constraint_name is not null then
    execute format(
      'alter table public.habit_logs drop constraint %I',
      constraint_name
    );
  end if;
end;
$$;

alter table public.habit_logs
  drop constraint if exists habit_logs_user_day_kind_content_key;

alter table public.habit_logs
  add constraint habit_logs_user_day_kind_content_key
  unique (user_id, day, kind, content_key);

alter table public.habit_logs
  drop constraint if exists habit_logs_content_key_matches_id;

alter table public.habit_logs
  add constraint habit_logs_content_key_matches_id check (
    content_key = coalesce(content_id::text, '')
  );
