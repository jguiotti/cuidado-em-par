-- purpose: Sprint 8 — care group create + join limit (max 8)
-- affected: create_care_group, join_care_circle
-- notes: One membership per user remains. Pair max 2 unchanged.

create or replace function public.create_care_group(p_name text default null)
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
    v_name := 'Grupo';
  end if;
  if char_length(v_name) > 60 then
    v_name := left(v_name, 60);
  end if;

  return query
  insert into public.care_circles (kind, name, created_by)
  values ('group', v_name, v_user)
  returning
    public.care_circles.id,
    public.care_circles.invite_code;
end;
$$;

comment on function public.create_care_group(text) is
  'Creates a group circle (max 8 members via join). Fails if already a member of any circle.';

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

  if v_kind = 'group' and v_count >= 8 then
    raise exception 'group_full';
  end if;

  insert into public.care_circle_members (circle_id, user_id)
  values (v_circle, v_user)
  on conflict do nothing;

  return v_circle;
end;
$$;

comment on function public.join_care_circle(text) is
  'Join by invite code. Pair max 2, group max 8. One active membership per user (MVP).';

revoke all on function public.create_care_group(text) from public;
revoke all on function public.create_care_group(text) from anon;
grant execute on function public.create_care_group(text) to authenticated;

revoke all on function public.join_care_circle(text) from public;
revoke all on function public.join_care_circle(text) from anon;
grant execute on function public.join_care_circle(text) to authenticated;
