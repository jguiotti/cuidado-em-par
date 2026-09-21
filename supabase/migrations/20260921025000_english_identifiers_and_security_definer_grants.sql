-- purpose: align identifiers and stored values to english; harden security definer grants
--   flagged by supabase security advisor (public/anon execute on definer functions).
-- affected: check constraints, tag slugs, tag_block_rules, list_safe_meals,
--   execute privileges on security definer functions, is_admin volatility.
-- notes: tags.label stays in brazilian portuguese (user-facing). no personal data migrated.

-- ---------------------------------------------------------------------------
-- 1) security advisor: revoke execute on security definer from public roles
--    trigger-only functions: no grant to anon/authenticated
--    rls/rpc helpers: grant only to authenticated after revoke
-- ---------------------------------------------------------------------------

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.add_circle_creator_as_member() from public;
revoke all on function public.add_circle_creator_as_member() from anon;
revoke all on function public.add_circle_creator_as_member() from authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
revoke all on function public.is_admin() from authenticated;

revoke all on function public.is_circle_member(uuid) from public;
revoke all on function public.is_circle_member(uuid) from anon;
revoke all on function public.is_circle_member(uuid) from authenticated;

revoke all on function public.is_circle_mate(uuid) from public;
revoke all on function public.is_circle_mate(uuid) from anon;
revoke all on function public.is_circle_mate(uuid) from authenticated;

revoke all on function public.join_care_circle(text) from public;
revoke all on function public.join_care_circle(text) from anon;
revoke all on function public.join_care_circle(text) from authenticated;

-- is_admin only reads the caller's own role row (rls allows that) — invoker is enough
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'Returns true when the authenticated caller has role admin. Security invoker; relies on user_roles rls.';

grant execute on function public.is_admin() to authenticated;

-- circle helpers must stay security definer to avoid rls recursion on membership
grant execute on function public.is_circle_member(uuid) to authenticated;
grant execute on function public.is_circle_mate(uuid) to authenticated;
grant execute on function public.join_care_circle(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 2) english check-constraint values
-- ---------------------------------------------------------------------------

alter table public.user_profiles
  drop constraint if exists user_profiles_health_focus_check;

update public.user_profiles
set health_focus = case health_focus
  when 'qualidade-de-vida' then 'quality-of-life'
  when 'preparo-fisico' then 'physical-preparation'
  when 'manutencao' then 'maintenance'
  when 'composicao-corporal' then 'body-composition'
  else health_focus
end
where health_focus is not null;

alter table public.user_profiles
  add constraint user_profiles_health_focus_check check (
    health_focus is null
    or health_focus in (
      'quality-of-life',
      'physical-preparation',
      'maintenance',
      'body-composition'
    )
  );

alter table public.user_nutrition_profiles
  drop constraint if exists user_nutrition_profiles_diet_check;

update public.user_nutrition_profiles
set diet_pattern = case diet_pattern
  when 'sem-padrao' then 'no-restriction'
  when 'vegetariano' then 'vegetarian'
  when 'vegano' then 'vegan'
  else diet_pattern
end;

alter table public.user_nutrition_profiles
  alter column diet_pattern set default 'no-restriction';

alter table public.user_nutrition_profiles
  add constraint user_nutrition_profiles_diet_check check (
    diet_pattern in ('no-restriction', 'vegetarian', 'vegan')
  );

alter table public.user_cycle_profiles
  drop constraint if exists user_cycle_profiles_mode_check;

update public.user_cycle_profiles
set mode = case mode
  when 'ciclo' then 'menstrual-cycle'
  when 'gestacao' then 'pregnancy'
  when 'pos-gestacao' then 'postpartum'
  else mode
end;

alter table public.user_cycle_profiles
  add constraint user_cycle_profiles_mode_check check (
    mode in ('menstrual-cycle', 'pregnancy', 'postpartum')
  );

alter table public.habit_logs
  drop constraint if exists habit_logs_kind_check;

update public.habit_logs
set kind = case kind
  when 'agua' then 'water'
  when 'pausa' then 'active-pause'
  when 'treino' then 'workout'
  when 'refeicao' then 'meal'
  else kind
end;

alter table public.habit_logs
  add constraint habit_logs_kind_check check (
    kind in ('water', 'active-pause', 'workout', 'meal')
  );

alter table public.care_events
  drop constraint if exists care_events_kind_check;

update public.care_events
set kind = case kind
  when 'agua' then 'water'
  when 'pausa' then 'active-pause'
  when 'treino' then 'workout'
  when 'refeicao' then 'meal'
  else kind
end;

alter table public.care_events
  add constraint care_events_kind_check check (
    kind in ('water', 'active-pause', 'workout', 'meal')
  );

alter table public.meals_library
  drop constraint if exists meals_library_slot_check;

update public.meals_library
set meal_slot = case meal_slot
  when 'cafe' then 'breakfast'
  when 'almoco' then 'lunch'
  when 'lanche' then 'snack'
  when 'jantar' then 'dinner'
  else meal_slot
end;

alter table public.meals_library
  add constraint meals_library_slot_check check (
    meal_slot in ('breakfast', 'lunch', 'snack', 'dinner')
  );

-- ---------------------------------------------------------------------------
-- 3) english tag slugs (label stays pt-BR)
-- ---------------------------------------------------------------------------

create or replace function public.map_tag_slug(p_slug text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case p_slug
    when 'lca-rompido' then 'torn-acl'
    when 'hernia' then 'hernia'
    when 'condromalacia' then 'chondromalacia'
    when 'hipertensao' then 'hypertension'
    when 'labirintite' then 'labyrinthitis'
    when 'cadeirante' then 'wheelchair-user'
    when 'mobilidade-reduzida' then 'reduced-mobility'
    when 'gestacao-trimestre-1' then 'pregnancy-trimester-1'
    when 'gestacao-trimestre-2' then 'pregnancy-trimester-2'
    when 'gestacao-trimestre-3' then 'pregnancy-trimester-3'
    when 'pos-parto' then 'postpartum'
    when 'em-pe' then 'standing'
    when 'sentado' then 'seated'
    when 'deitado' then 'lying'
    when 'unilateral' then 'unilateral'
    when 'sem-impacto' then 'low-impact'
    when 'peso-corporal' then 'bodyweight'
    when 'parede' then 'wall'
    when 'cadeira' then 'chair'
    when 'garrafa' then 'bottle'
    when 'toalha' then 'towel'
    when 'saco-alimento' then 'food-bag'
    when 'pausa-ativa' then 'active-pause'
    when 'intensidade-baixa' then 'low-intensity'
    when 'intensidade-media' then 'medium-intensity'
    when 'intensidade-alta' then 'high-intensity'
    when 'alto-impacto' then 'high-impact'
    when 'pliometria-inferior' then 'lower-body-plyometrics'
    when 'carga-axial' then 'axial-load'
    when 'decubito-ventral' then 'prone-position'
    when 'giro' then 'spin'
    when 'inversao' then 'inversion'
    when 'gluten' then 'gluten'
    when 'lactose' then 'lactose'
    when 'ovo' then 'egg'
    when 'amendoim' then 'peanut'
    when 'soja' then 'soy'
    when 'carne' then 'meat'
    when 'peixe' then 'fish'
    when 'vegano' then 'vegan'
    when 'vegetariano' then 'vegetarian'
    when 'baixo-custo' then 'low-cost'
    when 'ciclo-ativo' then 'cycle-active'
    when 'ciclo-menstrual' then 'menstrual-phase'
    when 'ciclo-folicular' then 'follicular-phase'
    when 'ovulacao' then 'ovulation'
    when 'lutea' then 'luteal-phase'
    else p_slug
  end;
$$;

create or replace function public.map_tag_slug_array(p_slugs text[])
returns text[]
language sql
immutable
security invoker
set search_path = ''
as $$
  select coalesce(
    array(
      select public.map_tag_slug(slug)
      from unnest(coalesce(p_slugs, '{}'::text[])) as slug
    ),
    '{}'::text[]
  );
$$;

alter table public.tag_block_rules
  drop constraint if exists tag_block_rules_condition_slug_fkey;

alter table public.tag_block_rules
  drop constraint if exists tag_block_rules_blocked_content_tag_fkey;

-- drop any auto-named fkeys if the default names differ
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select pg_constraint.conname as name
    from pg_constraint
    where pg_constraint.conrelid = 'public.tag_block_rules'::regclass
      and pg_constraint.contype = 'f'
  loop
    execute format(
      'alter table public.tag_block_rules drop constraint %I',
      constraint_row.name
    );
  end loop;
end;
$$;

update public.tag_block_rules
set
  condition_slug = public.map_tag_slug(condition_slug),
  blocked_content_tag = public.map_tag_slug(blocked_content_tag);

update public.tags
set slug = public.map_tag_slug(slug)
where slug is distinct from public.map_tag_slug(slug);

alter table public.tag_block_rules
  add constraint tag_block_rules_condition_slug_fkey
  foreign key (condition_slug) references public.tags (slug);

alter table public.tag_block_rules
  add constraint tag_block_rules_blocked_content_tag_fkey
  foreign key (blocked_content_tag) references public.tags (slug);

update public.user_clinical_conditions
set
  condition_tags = public.map_tag_slug_array(condition_tags),
  capability_tags = public.map_tag_slug_array(capability_tags);

update public.user_nutrition_profiles
set avoids_tags = public.map_tag_slug_array(avoids_tags);

update public.user_cycle_profiles
set phase_tags = public.map_tag_slug_array(phase_tags);

update public.exercises_library
set
  equipment_tags = public.map_tag_slug_array(equipment_tags),
  contraindication_tags = public.map_tag_slug_array(contraindication_tags),
  required_capability_tags = public.map_tag_slug_array(required_capability_tags),
  intensity_tags = public.map_tag_slug_array(intensity_tags);

update public.meals_library
set
  contains_tags = public.map_tag_slug_array(contains_tags),
  diet_compatible_tags = public.map_tag_slug_array(diet_compatible_tags),
  phase_tags = public.map_tag_slug_array(phase_tags);

-- one-off mappers; keep the database free of portuguese slug helpers
drop function public.map_tag_slug_array(text[]);
drop function public.map_tag_slug(text);

-- ---------------------------------------------------------------------------
-- 4) motor: english diet pattern / diet tags
-- ---------------------------------------------------------------------------

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
begin
  if not public.has_accepted_consent('health_personalization') then
    return;
  end if;

  select nutrition.diet_pattern, coalesce(nutrition.avoids_tags, '{}')
  into v_pattern, v_avoids
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
  order by
    (meal.diet_compatible_tags @> array['low-cost']::text[]) desc,
    meal.title;
end;
$$;

comment on function public.list_safe_meals() is
  'Meal engine. Blocks contains_tags vs avoids_tags and enforces vegan/vegetarian patterns.';

revoke all on function public.list_safe_meals() from public;
revoke all on function public.list_safe_meals() from anon;
grant execute on function public.list_safe_meals() to authenticated;

revoke all on function public.list_safe_exercises() from public;
revoke all on function public.list_safe_exercises() from anon;
grant execute on function public.list_safe_exercises() to authenticated;

revoke all on function public.has_accepted_consent(text) from public;
revoke all on function public.has_accepted_consent(text) from anon;
grant execute on function public.has_accepted_consent(text) to authenticated;

revoke all on function public.tags_all_exist(text[], text[]) from public;
revoke all on function public.tags_all_exist(text[], text[]) from anon;
grant execute on function public.tags_all_exist(text[], text[]) to authenticated;
