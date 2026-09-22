-- purpose: Sprint 10 — circle weekly care goal, rest-day kind, care_nudges
-- affected: care_circles, habit_logs, care_events, care_nudges, RLS
-- notes: rest-day is aggregated presence only (no clinical reason).
--   weekly_care_goal editable by members via RPC (column-scoped).

alter table public.care_circles
  add column if not exists weekly_care_goal smallint not null default 3;

alter table public.care_circles
  drop constraint if exists care_circles_weekly_care_goal_check;

alter table public.care_circles
  add constraint care_circles_weekly_care_goal_check check (
    weekly_care_goal in (3, 5, 7)
  );

comment on column public.care_circles.weekly_care_goal is
  'Shared weekly target for days of care together (Mon–Sun America/Sao_Paulo). Not clinical.';

alter table public.habit_logs
  drop constraint if exists habit_logs_kind_check;

alter table public.habit_logs
  add constraint habit_logs_kind_check check (
    kind in (
      'water',
      'active-pause',
      'workout',
      'meal',
      'sleep',
      'cardio',
      'rest-day'
    )
  );

alter table public.care_events
  drop constraint if exists care_events_kind_check;

alter table public.care_events
  add constraint care_events_kind_check check (
    kind in (
      'water',
      'active-pause',
      'workout',
      'meal',
      'sleep',
      'rest-day'
    )
  );

create table if not exists public.care_nudges (
  id bigint generated always as identity primary key,
  circle_id uuid not null references public.care_circles (id) on delete cascade,
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  constraint care_nudges_not_self check (from_user_id <> to_user_id),
  constraint care_nudges_unique_day unique (circle_id, from_user_id, to_user_id, day)
);

comment on table public.care_nudges is
  'Light peer support within a care circle. No free text. Visible only to circle members.';

create index if not exists care_nudges_circle_day_idx
  on public.care_nudges (circle_id, day desc);

create index if not exists care_nudges_to_user_day_idx
  on public.care_nudges (to_user_id, day);

alter table public.care_nudges enable row level security;

create policy "members can select care nudges"
  on public.care_nudges
  for select
  to authenticated
  using ((select public.is_circle_member(circle_id)));

create policy "members can insert own care nudges"
  on public.care_nudges
  for insert
  to authenticated
  with check (
    (select auth.uid()) = from_user_id
    and (select public.is_circle_member(circle_id))
    and exists (
      select 1
      from public.care_circle_members as mates
      where mates.circle_id = care_nudges.circle_id
        and mates.user_id = to_user_id
    )
  );

create policy "senders can delete own care nudges"
  on public.care_nudges
  for delete
  to authenticated
  using ((select auth.uid()) = from_user_id);

create or replace function public.set_circle_weekly_care_goal(p_goal smallint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_circle uuid;
begin
  v_user := (select auth.uid());
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  if p_goal not in (3, 5, 7) then
    raise exception 'invalid_goal';
  end if;

  select membership.circle_id
  into v_circle
  from public.care_circle_members as membership
  where membership.user_id = v_user
  limit 1;

  if v_circle is null then
    raise exception 'not_in_circle';
  end if;

  update public.care_circles as circles
  set weekly_care_goal = p_goal
  where circles.id = v_circle;
end;
$$;

comment on function public.set_circle_weekly_care_goal(smallint) is
  'Any circle member may set weekly_care_goal to 3, 5, or 7. Does not expose other columns.';

revoke all on function public.set_circle_weekly_care_goal(smallint) from public;
revoke all on function public.set_circle_weekly_care_goal(smallint) from anon;
grant execute on function public.set_circle_weekly_care_goal(smallint) to authenticated;
