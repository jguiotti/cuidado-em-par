-- purpose: sprint 2 onboarding — sex assigned at birth (optional), sleep habit prefs,
--   sleep event kinds, and onboarding_stage for wizard progress including skips.
-- affected: user_profiles, user_clinical_conditions, user_habit_prefs,
--   habit_logs, care_events
-- notes: sex_assigned_at_birth is sensitive, optional, and must not alone drive cycle.

alter table public.user_profiles
  add column if not exists onboarding_stage text;

alter table public.user_profiles
  drop constraint if exists user_profiles_onboarding_stage_check;

alter table public.user_profiles
  add constraint user_profiles_onboarding_stage_check check (
    onboarding_stage is null
    or onboarding_stage in (
      'sex_assigned',
      'clinical',
      'mobility',
      'nutrition',
      'cycle',
      'habits',
      'completed'
    )
  );

comment on column public.user_profiles.onboarding_stage is
  'Wizard progress after sprint 1. Null is derived from profile fields until focus is done.';

alter table public.user_clinical_conditions
  add column if not exists sex_assigned_at_birth text;

alter table public.user_clinical_conditions
  drop constraint if exists user_clinical_sex_assigned_check;

alter table public.user_clinical_conditions
  add constraint user_clinical_sex_assigned_check check (
    sex_assigned_at_birth is null
    or sex_assigned_at_birth in (
      'female',
      'male',
      'intersex',
      'prefer_not_to_say'
    )
  );

comment on column public.user_clinical_conditions.sex_assigned_at_birth is
  'Optional sensitive context for cycle/pregnancy care. Never public. Does not enable cycle by itself.';

alter table public.user_habit_prefs
  add column if not exists sleep_reminder_enabled boolean not null default true;

alter table public.user_habit_prefs
  add column if not exists sleep_target_bedtime time;

comment on column public.user_habit_prefs.sleep_reminder_enabled is
  'Optional bedtime reminder. Not a clinical sleep diagnosis.';

alter table public.habit_logs
  drop constraint if exists habit_logs_kind_check;

alter table public.habit_logs
  add constraint habit_logs_kind_check check (
    kind in ('water', 'active-pause', 'workout', 'meal', 'sleep')
  );

alter table public.care_events
  drop constraint if exists care_events_kind_check;

alter table public.care_events
  add constraint care_events_kind_check check (
    kind in ('water', 'active-pause', 'workout', 'meal', 'sleep')
  );
