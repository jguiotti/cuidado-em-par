-- purpose: hide exercises tagged with specialty gear the person does not own
-- affected: list_safe_exercises
-- notes: resistance-band and dumbbells require ownership even when bodyweight
--   is also listed. App-side filter mirrors this rule.

create or replace function public.list_safe_exercises()
returns setof public.exercises_library
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_conditions text[] := '{}';
  v_capabilities text[] := '{}';
  v_equipment text[] := array['bodyweight']::text[];
  v_phases text[] := '{}';
  v_union text[] := '{}';
begin
  if not public.has_accepted_consent('health_personalization') then
    return;
  end if;

  select
    coalesce(clinical.condition_tags, '{}'),
    coalesce(clinical.capability_tags, '{}'),
    coalesce(clinical.available_equipment_tags, array['bodyweight']::text[])
  into v_conditions, v_capabilities, v_equipment
  from public.user_clinical_conditions as clinical
  where clinical.user_id = (select auth.uid());

  if not found then
    return;
  end if;

  if not ('bodyweight' = any (v_equipment)) then
    v_equipment := array_append(v_equipment, 'bodyweight');
  end if;

  select coalesce(cycle.phase_tags, '{}')
  into v_phases
  from public.user_cycle_profiles as cycle
  where cycle.user_id = (select auth.uid());

  if not found then
    v_phases := '{}';
  end if;

  v_union := v_conditions || v_phases;

  if 'hernia' = any (v_union) and not ('disc-herniation' = any (v_union)) then
    v_union := array_append(v_union, 'disc-herniation');
  end if;
  if 'disc-herniation' = any (v_union) and not ('hernia' = any (v_union)) then
    v_union := array_append(v_union, 'hernia');
  end if;

  return query
  select exercise.*
  from public.exercises_library as exercise
  where exercise.is_published = true
    and not (exercise.contraindication_tags && v_union)
    and exercise.required_capability_tags <@ v_capabilities
    and (
      coalesce(cardinality(exercise.equipment_tags), 0) = 0
      or (
        -- specialty gear must be owned when present on the exercise
        not (
          'resistance-band' = any (exercise.equipment_tags)
          and not ('resistance-band' = any (v_equipment))
        )
        and not (
          'dumbbells' = any (exercise.equipment_tags)
          and not ('dumbbells' = any (v_equipment))
        )
        and exercise.equipment_tags && v_equipment
      )
    )
    and not exists (
      select 1
      from public.tag_block_rules as block_rule
      where block_rule.condition_slug = any (v_union)
        and block_rule.blocked_content_tag = any (exercise.intensity_tags)
    )
  order by exercise.title;
end;
$$;

comment on function public.list_safe_exercises() is
  'Motor de treino. Bloqueia contraindicações, capabilities, specialty equipment e tag_block_rules.';

revoke all on function public.list_safe_exercises() from public;
revoke all on function public.list_safe_exercises() from anon;
grant execute on function public.list_safe_exercises() to authenticated;
