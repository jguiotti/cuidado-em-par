-- purpose: sprint 9 daily plan prefs, exercise duration, plans, cardio/custom meal logs, body measurements
-- affected: user_habit_prefs, exercises_library, user_daily_plans, habit_logs, user_body_measurements
-- notes: plans and measurements are owner-only. Cardio aggregates as workout in care_events (app layer).

-- ---------------------------------------------------------------------------
-- workout availability prefs
-- ---------------------------------------------------------------------------

alter table public.user_habit_prefs
  add column if not exists workout_minutes_per_day integer not null default 20;

alter table public.user_habit_prefs
  add column if not exists workout_weekdays smallint[] not null default '{1,2,3,4,5}'::smallint[];

alter table public.user_habit_prefs
  drop constraint if exists user_habit_prefs_workout_minutes_check;

alter table public.user_habit_prefs
  add constraint user_habit_prefs_workout_minutes_check check (
    workout_minutes_per_day between 5 and 120
  );

alter table public.user_habit_prefs
  drop constraint if exists user_habit_prefs_workout_weekdays_check;

alter table public.user_habit_prefs
  add constraint user_habit_prefs_workout_weekdays_check check (
    cardinality(workout_weekdays) between 0 and 7
    and workout_weekdays <@ '{0,1,2,3,4,5,6}'::smallint[]
  );

comment on column public.user_habit_prefs.workout_minutes_per_day is
  'Self-reported minutes available for planned movement on workout days.';

comment on column public.user_habit_prefs.workout_weekdays is
  'Weekdays with a planned workout: 0=Sunday .. 6=Saturday (America/Sao_Paulo).';

-- ---------------------------------------------------------------------------
-- exercise estimated duration
-- ---------------------------------------------------------------------------

alter table public.exercises_library
  add column if not exists estimated_duration_minutes integer not null default 5;

alter table public.exercises_library
  drop constraint if exists exercises_library_duration_check;

alter table public.exercises_library
  add constraint exercises_library_duration_check check (
    estimated_duration_minutes between 1 and 60
  );

comment on column public.exercises_library.estimated_duration_minutes is
  'Approximate minutes used by the deterministic daily packer. Not a clinical prescription.';

update public.exercises_library
set estimated_duration_minutes = case
  when 'active-pause' = any (intensity_tags) then 3
  when 'high-impact' = any (intensity_tags)
    or 'lower-body-plyometrics' = any (intensity_tags) then 8
  else 5
end
where estimated_duration_minutes = 5;

-- ---------------------------------------------------------------------------
-- daily plans
-- ---------------------------------------------------------------------------

create table if not exists public.user_daily_plans (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  exercise_ids uuid[] not null default '{}',
  meals jsonb not null default '{}'::jsonb,
  is_rest_day boolean not null default false,
  cardio_suggestion text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day),
  constraint user_daily_plans_cardio_check check (
    cardio_suggestion in ('walk', 'run', 'seated', 'none')
  ),
  constraint user_daily_plans_meals_object check (jsonb_typeof(meals) = 'object')
);

comment on table public.user_daily_plans is
  'Persisted safe daily movement/meal plan for stable swaps. Owner-only via RLS.';

create index if not exists user_daily_plans_user_day_idx
  on public.user_daily_plans (user_id, day desc);

drop trigger if exists user_daily_plans_set_updated_at on public.user_daily_plans;
create trigger user_daily_plans_set_updated_at
  before update on public.user_daily_plans
  for each row
  execute function public.set_updated_at();

alter table public.user_daily_plans enable row level security;

drop policy if exists "users can select own daily plans" on public.user_daily_plans;
create policy "users can select own daily plans"
  on public.user_daily_plans
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own daily plans" on public.user_daily_plans;
create policy "users can insert own daily plans"
  on public.user_daily_plans
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own daily plans" on public.user_daily_plans;
create policy "users can update own daily plans"
  on public.user_daily_plans
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own daily plans" on public.user_daily_plans;
create policy "users can delete own daily plans"
  on public.user_daily_plans
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- habit_logs: cardio + custom meal fields
-- ---------------------------------------------------------------------------

alter table public.habit_logs
  drop constraint if exists habit_logs_kind_check;

alter table public.habit_logs
  add constraint habit_logs_kind_check check (
    kind in ('water', 'active-pause', 'workout', 'meal', 'sleep', 'cardio')
  );

alter table public.habit_logs
  add column if not exists distance_m integer;

alter table public.habit_logs
  add column if not exists meal_slot text;

alter table public.habit_logs
  add column if not exists note text;

alter table public.habit_logs
  drop constraint if exists habit_logs_distance_check;

alter table public.habit_logs
  add constraint habit_logs_distance_check check (
    distance_m is null or distance_m between 0 and 100000
  );

alter table public.habit_logs
  drop constraint if exists habit_logs_meal_slot_check;

alter table public.habit_logs
  add constraint habit_logs_meal_slot_check check (
    meal_slot is null
    or meal_slot in ('breakfast', 'lunch', 'snack', 'dinner')
  );

-- Allow content_key walk/run/custom:* without content_id; library rows still match uuid text.
alter table public.habit_logs
  drop constraint if exists habit_logs_content_key_matches_id;

alter table public.habit_logs
  add constraint habit_logs_content_key_matches_id check (
    content_key = coalesce(content_id::text, '')
    or (
      content_id is null
      and content_key in ('walk', 'run')
    )
    or (
      content_id is null
      and content_key like 'custom:%'
    )
  );

comment on column public.habit_logs.distance_m is
  'Optional distance in meters for cardio (walk/run). Private habit data.';

comment on column public.habit_logs.meal_slot is
  'Meal slot for library or custom meal completions.';

comment on column public.habit_logs.note is
  'Free-text label for custom meals. Never shared in care_events.';

-- ---------------------------------------------------------------------------
-- optional body measurements (biometrics consent enforced in app + revoke)
-- ---------------------------------------------------------------------------

create table if not exists public.user_body_measurements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_on date not null,
  weight_kg numeric(5, 2),
  waist_cm numeric(5, 1),
  hip_cm numeric(5, 1),
  created_at timestamptz not null default now(),
  constraint user_body_measurements_day_unique unique (user_id, recorded_on),
  constraint user_body_measurements_has_value check (
    weight_kg is not null or waist_cm is not null or hip_cm is not null
  ),
  constraint user_body_measurements_weight_check check (
    weight_kg is null or (weight_kg > 0 and weight_kg <= 500)
  ),
  constraint user_body_measurements_waist_check check (
    waist_cm is null or (waist_cm > 0 and waist_cm <= 300)
  ),
  constraint user_body_measurements_hip_check check (
    hip_cm is null or (hip_cm > 0 and hip_cm <= 300)
  )
);

comment on table public.user_body_measurements is
  'Optional private weight/waist/hip history. Not used for body ranking or IMC.';

create index if not exists user_body_measurements_user_day_idx
  on public.user_body_measurements (user_id, recorded_on desc);

alter table public.user_body_measurements enable row level security;

drop policy if exists "users can select own body measurements" on public.user_body_measurements;
create policy "users can select own body measurements"
  on public.user_body_measurements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own body measurements" on public.user_body_measurements;
create policy "users can insert own body measurements"
  on public.user_body_measurements
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own body measurements" on public.user_body_measurements;
create policy "users can update own body measurements"
  on public.user_body_measurements
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own body measurements" on public.user_body_measurements;
create policy "users can delete own body measurements"
  on public.user_body_measurements
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
