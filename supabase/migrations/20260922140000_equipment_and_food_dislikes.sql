-- purpose: home equipment selection + taste dislikes for meal/exercise engines
-- affected: user_clinical_conditions, user_nutrition_profiles, tags,
--   user_profiles.onboarding_stage, list_safe_exercises, list_safe_meals
-- notes: available_equipment_tags starts as bodyweight; person selects catalog items
--   (chair, band, bottle…). disliked_foods are taste prefs; meals with alt still pass.

insert into public.tags (slug, domain, kind, label)
values
  ('dumbbells', 'movement', 'equipment', 'Halteres'),
  ('resistance-band', 'movement', 'equipment', 'Elástico'),
  ('broomstick', 'movement', 'equipment', 'Cabo de vassoura'),
  ('backpack', 'movement', 'equipment', 'Mochila'),
  ('cushion', 'movement', 'equipment', 'Almofada'),
  ('wall', 'movement', 'equipment', 'Parede'),
  ('chair', 'movement', 'equipment', 'Cadeira'),
  ('bottle', 'movement', 'equipment', 'Garrafa'),
  ('towel', 'movement', 'equipment', 'Toalha'),
  ('food-bag', 'movement', 'equipment', 'Saco de alimento'),
  ('bodyweight', 'movement', 'equipment', 'Peso corporal')
on conflict (slug) do update
set domain = excluded.domain,
    kind = excluded.kind,
    label = excluded.label;

alter table public.user_clinical_conditions
  add column if not exists available_equipment_tags text[] not null
  default array['bodyweight']::text[];

comment on column public.user_clinical_conditions.available_equipment_tags is
  'Equipment the person can use at home. Always includes bodyweight; other tags come from onboarding/account selection.';

create index if not exists user_clinical_available_equipment_tags_gin
  on public.user_clinical_conditions using gin (available_equipment_tags);

alter table public.user_nutrition_profiles
  add column if not exists disliked_foods text[] not null default '{}'::text[];

comment on column public.user_nutrition_profiles.disliked_foods is
  'Taste dislikes (normalized tokens). Distinct from clinical avoids_tags. Ingredient with alt is still allowed.';

create index if not exists user_nutrition_disliked_foods_gin
  on public.user_nutrition_profiles using gin (disliked_foods);

alter table public.user_profiles
  drop constraint if exists user_profiles_onboarding_stage_check;

alter table public.user_profiles
  add constraint user_profiles_onboarding_stage_check check (
    onboarding_stage is null
    or onboarding_stage in (
      'sex_assigned',
      'clinical',
      'mobility',
      'equipment',
      'nutrition',
      'cycle',
      'habits',
      'completed'
    )
  );

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

  -- legacy alias: hernia ↔ disc-herniation
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
      or exercise.equipment_tags && v_equipment
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
  'Motor de treino. Bloqueia por contraindication_tags, capabilities, equipment overlap e tag_block_rules.';

revoke all on function public.list_safe_exercises() from public;
revoke all on function public.list_safe_exercises() from anon;
grant execute on function public.list_safe_exercises() to authenticated;

create or replace function public.list_safe_meals()
returns setof public.meals_library
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_pattern text;
  v_avoids text[] := '{}';
  v_dislikes text[] := '{}';
begin
  if not public.has_accepted_consent('health_personalization') then
    return;
  end if;

  select
    nutrition.diet_pattern,
    coalesce(nutrition.avoids_tags, '{}'),
    coalesce(nutrition.disliked_foods, '{}')
  into v_pattern, v_avoids, v_dislikes
  from public.user_nutrition_profiles as nutrition
  where nutrition.user_id = (select auth.uid());

  if not found then
    return;
  end if;

  return query
  select meal.*
  from public.meals_library as meal
  where meal.is_published = true
    and not (meal.contains_tags && v_avoids)
    and (
      v_pattern = 'no-restriction'
      or (
        v_pattern = 'vegan'
        and meal.diet_compatible_tags @> array['vegan']::text[]
      )
      or (
        v_pattern = 'vegetarian'
        and (
          meal.diet_compatible_tags @> array['vegetarian']::text[]
          or meal.diet_compatible_tags @> array['vegan']::text[]
        )
      )
    )
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(meal.ingredients, '[]'::jsonb)) as ing
      where exists (
        select 1
        from unnest(v_dislikes) as dislike(token)
        where dislike.token <> ''
          and translate(
            lower(coalesce(ing ->> 'item', '')),
            'áàâãäéèêëíìîïóòôõöúùûüçñ',
            'aaaaaeeeeiiiiooooouuuucn'
          ) like '%' || dislike.token || '%'
      )
      and (
        ing ->> 'alt' is null
        or btrim(ing ->> 'alt') = ''
      )
    )
  order by
    (meal.diet_compatible_tags @> array['low-cost']::text[]) desc,
    meal.title;
end;
$$;

comment on function public.list_safe_meals() is
  'Meal engine. Blocks contains_tags vs avoids_tags, diet_pattern, and disliked foods without substitute (alt).';

revoke all on function public.list_safe_meals() from public;
revoke all on function public.list_safe_meals() from anon;
grant execute on function public.list_safe_meals() to authenticated;
