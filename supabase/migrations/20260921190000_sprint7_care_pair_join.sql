-- purpose: Sprint 7 — harden pair join (max 2, one membership) + care_events day index
-- affected: join_care_circle, create_care_pair, care_events index
-- notes: care_events.kind already includes sleep (Sprint 2). Feed never stores clinical detail.

create index if not exists care_events_circle_day_idx
  on public.care_events (circle_id, day desc);

create or replace function public.create_care_pair(p_name text default null)
returns table (circle_id uuid, invite_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_name text;
begin
  v_user := (select auth.uid());
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  if exists (
    select 1
    from public.care_circle_members as members
    where members.user_id = v_user
  ) then
    raise exception 'already_in_circle';
  end if;

  v_name := nullif(trim(coalesce(p_name, '')), '');
  if v_name is null then
    v_name := 'Dupla';
  end if;
  if char_length(v_name) > 60 then
    v_name := left(v_name, 60);
  end if;

  return query
  insert into public.care_circles (kind, name, created_by)
  values ('pair', v_name, v_user)
  returning
    public.care_circles.id,
    public.care_circles.invite_code;
end;
$$;

comment on function public.create_care_pair(text) is
  'Creates a pair circle for the caller. Fails if already a member of any circle.';

create or replace function public.join_care_circle(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_circle uuid;
  v_kind text;
  v_user uuid;
  v_count integer;
  v_code text;
begin
  v_user := (select auth.uid());
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  v_code := lower(trim(coalesce(p_invite_code, '')));
  if v_code = '' then
    raise exception 'invalid_invite';
  end if;

  if exists (
    select 1
    from public.care_circle_members as members
    where members.user_id = v_user
  ) then
    raise exception 'already_in_circle';
  end if;

  select circles.id, circles.kind
  into v_circle, v_kind
  from public.care_circles as circles
  where lower(circles.invite_code) = v_code
  for update;

  if v_circle is null then
    raise exception 'invalid_invite';
  end if;

  select count(*)::integer
  into v_count
  from public.care_circle_members as members
  where members.circle_id = v_circle;

  if v_kind = 'pair' and v_count >= 2 then
    raise exception 'pair_full';
  end if;

  insert into public.care_circle_members (circle_id, user_id)
  values (v_circle, v_user)
  on conflict do nothing;

  return v_circle;
end;
$$;

comment on function public.join_care_circle(text) is
  'Join by invite code. Pair max 2 members. One active membership per user (MVP).';

revoke all on function public.create_care_pair(text) from public;
revoke all on function public.create_care_pair(text) from anon;
grant execute on function public.create_care_pair(text) to authenticated;

revoke all on function public.join_care_circle(text) from public;
revoke all on function public.join_care_circle(text) from anon;
grant execute on function public.join_care_circle(text) to authenticated;
