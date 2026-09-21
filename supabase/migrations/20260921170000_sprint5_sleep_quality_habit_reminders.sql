-- purpose: Sprint 5 — sleep quality on habit logs + habit_reminders consent purpose
-- affected: habit_logs.sleep_quality, lgpd_consent_logs.purpose check
-- notes: sleep_quality is subjective habit data, not clinical diagnosis.
--   day timezone for habit_logs is owned by the app (America/Sao_Paulo).

alter table public.habit_logs
  add column if not exists sleep_quality text;

comment on column public.habit_logs.sleep_quality is
  'Subjective sleep quality for kind=sleep: poor | ok | good. Not a clinical assessment.';

alter table public.habit_logs
  drop constraint if exists habit_logs_sleep_quality_check;

alter table public.habit_logs
  add constraint habit_logs_sleep_quality_check check (
    sleep_quality is null
    or sleep_quality in ('poor', 'ok', 'good')
  );

alter table public.lgpd_consent_logs
  drop constraint if exists lgpd_consent_logs_purpose_check;

alter table public.lgpd_consent_logs
  add constraint lgpd_consent_logs_purpose_check check (
    purpose in (
      'terms',
      'health_personalization',
      'cycle_module',
      'biometrics',
      'habit_reminders'
    )
  );
