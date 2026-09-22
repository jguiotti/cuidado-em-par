-- purpose: close LGPD blockers — mates cannot read full user_profiles;
--          account deletion audit survives auth.users cascade
-- affected: user_profiles RLS, list_circle_member_display_names,
--           account_deletion_audit, record_own_account_deletion

-- ---------------------------------------------------------------------------
-- 1) Circle mates: drop row-level access to full profiles; expose names only
-- ---------------------------------------------------------------------------

drop policy if exists "circle mates can select public profile"
  on public.user_profiles;

create or replace function public.list_circle_member_display_names(
  p_user_ids uuid[]
)
returns table (
  id uuid,
  display_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profiles.id,
    profiles.display_name
  from public.user_profiles as profiles
  where profiles.id = any (p_user_ids)
    and public.is_circle_mate(profiles.id);
$$;

comment on function public.list_circle_member_display_names(uuid[]) is
  'Returns only id + display_name for circle mates (incl. self). No health_focus, gender_identity, or onboarding fields.';

revoke all on function public.list_circle_member_display_names(uuid[]) from public;
grant execute on function public.list_circle_member_display_names(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Account deletion audit — no FK to auth.users (survives delete cascade)
-- ---------------------------------------------------------------------------

create table if not exists public.account_deletion_audit (
  id bigint generated always as identity primary key,
  deleted_user_id uuid not null,
  deleted_at timestamptz not null default now(),
  source text not null default 'self_service'
    check (source in ('self_service', 'admin', 'system'))
);

comment on table public.account_deletion_audit is
  'Tombstone for account deletion. Intentionally has no FK to auth.users so the row survives cascade after deleteUser.';

create index if not exists account_deletion_audit_user_idx
  on public.account_deletion_audit (deleted_user_id, deleted_at desc);

alter table public.account_deletion_audit enable row level security;

-- No policies for authenticated/anon: only service role / security definer write.
-- Admins may inspect via service role in Dashboard if needed.

create or replace function public.record_own_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.account_deletion_audit (deleted_user_id, source)
  values (v_uid, 'self_service');
end;
$$;

comment on function public.record_own_account_deletion() is
  'Records a deletion tombstone for the calling user before auth.users delete.';

revoke all on function public.record_own_account_deletion() from public;
grant execute on function public.record_own_account_deletion() to authenticated;
