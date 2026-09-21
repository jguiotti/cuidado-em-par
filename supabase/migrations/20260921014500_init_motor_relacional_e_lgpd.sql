-- purpose: criar o schema do mvp com fronteira publico/sensivel, consentimento
--   auditavel, motor de tags e rls estrito. nenhum dado clinico de pessoa real
--   e inserido aqui.
-- affected: tags, user_*, lgpd_consent_logs, libraries, care_*, storage bucket
-- notes: altura e data de nascimento ficam de fora (sem finalidade no mvp).
--   identidade de genero nao alimenta o motor. admin nao le tabelas sensiveis.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- catalogo de tags (conteudo, nao e dado pessoal)
-- ---------------------------------------------------------------------------

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  domain text not null,
  kind text not null,
  label text not null,
  constraint tags_domain_check check (
    domain in ('movement', 'food', 'habit', 'cycle')
  ),
  constraint tags_kind_check check (
    kind in (
      'condition',
      'capability',
      'equipment',
      'contains',
      'diet',
      'intensity',
      'phase'
    )
  )
);

comment on table public.tags is
  'Catalogo estável de slugs do motor relacional. Educador Fisico e Nutricionista donos do significado; o slug nao muda.';

create or replace function public.tags_all_exist(p_slugs text[], p_kinds text[])
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(cardinality(p_slugs), 0) = 0
    or not exists (
      select 1
      from unnest(p_slugs) as wanted(slug)
      where not exists (
        select 1
        from public.tags as tags
        where tags.slug = wanted.slug
          and tags.kind = any (p_kinds)
      )
    );
$$;

create table public.tag_block_rules (
  id bigint generated always as identity primary key,
  condition_slug text not null references public.tags (slug),
  blocked_content_tag text not null references public.tags (slug),
  unique (condition_slug, blocked_content_tag)
);

comment on table public.tag_block_rules is
  'Mapa condicao da pessoa -> tag de intensidade/conteudo bloqueada. Evita depender so da memoria de quem cadastra exercicio.';

-- ---------------------------------------------------------------------------
-- perfil publico e papéis
-- ---------------------------------------------------------------------------

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  gender_identity text,
  health_focus text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_health_focus_check check (
    health_focus is null
    or health_focus in (
      'qualidade-de-vida',
      'preparo-fisico',
      'manutencao',
      'composicao-corporal'
    )
  )
);

comment on table public.user_profiles is
  'Perfil visivel em dupla/grupo: apelido e foco declarado. Sem lesao, peso, ciclo, alergia ou gestacao.';

comment on column public.user_profiles.gender_identity is
  'Campo opcional de respeito. Nao dispara treino, dieta nem modulo de ciclo.';

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member',
  constraint user_roles_role_check check (role in ('member', 'admin'))
);

comment on table public.user_roles is
  'RBAC do backoffice. member e o padrao. admin so edita biblioteca, nunca dado de saude alheio.';

-- ---------------------------------------------------------------------------
-- dados sensiveis (1:1 com a pessoa, so a propria pessoa le)
-- ---------------------------------------------------------------------------

create table public.lgpd_consent_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null,
  accepted boolean not null,
  recorded_at timestamptz not null default now(),
  constraint lgpd_consent_logs_purpose_check check (
    purpose in (
      'terms',
      'health_personalization',
      'cycle_module',
      'biometrics'
    )
  )
);

comment on table public.lgpd_consent_logs is
  'Auditoria append-only de consentimento. Revogacao e um novo evento com accepted = false. Sem update.';

create table public.user_biometrics (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weight_kg numeric,
  updated_at timestamptz not null default now(),
  constraint user_biometrics_weight_check check (
    weight_kg is null or (weight_kg > 0 and weight_kg < 500)
  )
);

comment on table public.user_biometrics is
  'Dado sensivel opcional. So peso, com finalidade unica de sugerir meta de agua. Sem altura e sem data de nascimento neste corte.';

create table public.user_clinical_conditions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  condition_tags text[] not null default '{}',
  capability_tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

comment on table public.user_clinical_conditions is
  'Dado sensivel de movimento: lesoes/condicoes e capacidades. Alimenta o motor; nunca vai para perfil publico.';

create table public.user_nutrition_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  diet_pattern text not null default 'sem-padrao',
  avoids_tags text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint user_nutrition_profiles_diet_check check (
    diet_pattern in ('sem-padrao', 'vegetariano', 'vegano')
  )
);

comment on table public.user_nutrition_profiles is
  'Dado sensivel alimentar. avoids_tags e o que a pessoa nao pode comer; diet_pattern e exigencia positiva.';

create table public.user_cycle_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mode text not null,
  phase_tags text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint user_cycle_profiles_mode_check check (
    mode in ('ciclo', 'gestacao', 'pos-gestacao')
  )
);

comment on table public.user_cycle_profiles is
  'Modulo opt-in. Ausencia de linha = desligado. Nao e inferido da identidade de genero.';

create table public.user_habit_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  water_goal_ml integer not null default 2000,
  water_reminder_enabled boolean not null default true,
  active_pause_enabled boolean not null default true,
  active_pause_interval_minutes integer not null default 90,
  updated_at timestamptz not null default now(),
  constraint user_habit_prefs_water_check check (water_goal_ml between 250 and 8000),
  constraint user_habit_prefs_pause_check check (
    active_pause_interval_minutes between 30 and 240
  )
);

comment on table public.user_habit_prefs is
  'Preferencias de habito comuns a todo perfil. Nao sao dado clinico, mas so a pessoa dona le e altera.';

create table public.habit_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default ((timezone('utc', now()))::date),
  kind text not null,
  value integer,
  created_at timestamptz not null default now(),
  constraint habit_logs_kind_check check (
    kind in ('agua', 'pausa', 'treino', 'refeicao')
  ),
  unique (user_id, day, kind)
);

comment on table public.habit_logs is
  'Registro diario de habito da pessoa. value pode ser ml de agua. Nao e compartilhado com o circulo.';

-- ---------------------------------------------------------------------------
-- bibliotecas de conteudo
-- ---------------------------------------------------------------------------

create table public.exercises_library (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_paths text[] not null default '{}',
  video_url text,
  target_muscles text[] not null default '{}',
  equipment_tags text[] not null default '{}',
  contraindication_tags text[] not null default '{}',
  required_capability_tags text[] not null,
  intensity_tags text[] not null default '{}',
  is_published boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_published_need_capabilities check (
    is_published = false or cardinality(required_capability_tags) >= 1
  )
);

comment on table public.exercises_library is
  'Conteudo de calistenia. Publicar exige capacidade obrigatoria para nao gerar falso seguro.';

create table public.meals_library (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  ingredients jsonb not null default '[]'::jsonb,
  image_paths text[] not null default '{}',
  meal_slot text not null,
  contains_tags text[] not null default '{}',
  diet_compatible_tags text[] not null default '{}',
  phase_tags text[] not null default '{}',
  is_published boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meals_library_slot_check check (
    meal_slot in ('cafe', 'almoco', 'lanche', 'jantar')
  )
);

comment on table public.meals_library is
  'Conteudo de refeicoes acessiveis. contains_tags descreve o que ha no prato, nao a alergia da pessoa.';

-- ---------------------------------------------------------------------------
-- cuidado coletivo (sem payload clinico)
-- ---------------------------------------------------------------------------

create table public.care_circles (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  name text not null,
  invite_code text not null unique default encode(extensions.gen_random_bytes(5), 'hex'),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint care_circles_kind_check check (kind in ('pair', 'group'))
);

comment on table public.care_circles is
  'Dupla ou grupo de constancia. Sem dado de saude no circulo.';

create table public.care_circle_members (
  circle_id uuid not null references public.care_circles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

comment on table public.care_circle_members is
  'Membros do circulo de cuidado.';

create table public.care_events (
  id bigint generated always as identity primary key,
  circle_id uuid not null references public.care_circles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null,
  created_at timestamptz not null default now(),
  constraint care_events_kind_check check (
    kind in ('treino', 'agua', 'pausa', 'refeicao')
  ),
  unique (circle_id, user_id, day, kind)
);

comment on table public.care_events is
  'Evento de hábito visivel no circulo: so kind + dia. Sem ml, sem nome de exercicio, sem tag clinica.';

-- ---------------------------------------------------------------------------
-- indices
-- ---------------------------------------------------------------------------

create index lgpd_consent_logs_user_purpose_recorded_idx
  on public.lgpd_consent_logs (user_id, purpose, recorded_at desc);

create index habit_logs_user_day_idx
  on public.habit_logs (user_id, day);

create index care_circle_members_user_idx
  on public.care_circle_members (user_id, circle_id);

create index exercises_library_published_idx
  on public.exercises_library (is_published);

create index meals_library_published_idx
  on public.meals_library (is_published);

create index exercises_library_contraindication_gin
  on public.exercises_library using gin (contraindication_tags);

create index exercises_library_capability_gin
  on public.exercises_library using gin (required_capability_tags);

create index exercises_library_intensity_gin
  on public.exercises_library using gin (intensity_tags);

create index meals_library_contains_gin
  on public.meals_library using gin (contains_tags);

create index meals_library_diet_gin
  on public.meals_library using gin (diet_compatible_tags);

create index user_clinical_condition_tags_gin
  on public.user_clinical_conditions using gin (condition_tags);

create index user_clinical_capability_tags_gin
  on public.user_clinical_conditions using gin (capability_tags);

create index user_nutrition_avoids_gin
  on public.user_nutrition_profiles using gin (avoids_tags);

-- ---------------------------------------------------------------------------
-- funcoes de autorizacao e motor
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
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
  'Security definer para uso em rls. Nao revela papel de outra pessoa.';

create or replace function public.is_circle_member(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.care_circle_members
    where circle_id = p_circle_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_circle_mate(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.care_circle_members as me
    join public.care_circle_members as other
      on me.circle_id = other.circle_id
    where me.user_id = (select auth.uid())
      and other.user_id = p_user_id
  );
$$;

create or replace function public.has_accepted_consent(p_purpose text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (
      select logs.accepted
      from public.lgpd_consent_logs as logs
      where logs.user_id = (select auth.uid())
        and logs.purpose = p_purpose
      order by logs.recorded_at desc
      limit 1
    ),
    false
  );
$$;

comment on function public.has_accepted_consent(text) is
  'Ultimo evento da finalidade para a pessoa autenticada. Sem evento = nao aceito.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id)
  values (new.id);

  insert into public.user_roles (user_id, role)
  values (new.id, 'member');

  insert into public.user_habit_prefs (user_id)
  values (new.id);

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Cria perfil publico, papel member e habitos padrao. Nao cria clinica, nutricao, ciclo nem biometria: isso exige consentimento.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.add_circle_creator_as_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.care_circle_members (circle_id, user_id)
  values (new.id, new.created_by);
  return new;
end;
$$;

create trigger care_circles_add_creator
  after insert on public.care_circles
  for each row
  execute function public.add_circle_creator_as_member();

create or replace function public.exercises_library_validate_tags()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.tags_all_exist(new.equipment_tags, array['equipment']::text[]) then
    raise exception 'equipment_tags invalido';
  end if;
  if not public.tags_all_exist(new.contraindication_tags, array['condition', 'phase']::text[]) then
    raise exception 'contraindication_tags invalido';
  end if;
  if not public.tags_all_exist(new.required_capability_tags, array['capability']::text[]) then
    raise exception 'required_capability_tags invalido';
  end if;
  if not public.tags_all_exist(new.intensity_tags, array['intensity']::text[]) then
    raise exception 'intensity_tags invalido';
  end if;
  return new;
end;
$$;

create trigger exercises_library_validate_tags_trigger
  before insert or update on public.exercises_library
  for each row
  execute function public.exercises_library_validate_tags();

create or replace function public.meals_library_validate_tags()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.tags_all_exist(new.contains_tags, array['contains']::text[]) then
    raise exception 'contains_tags invalido';
  end if;
  if not public.tags_all_exist(new.diet_compatible_tags, array['diet']::text[]) then
    raise exception 'diet_compatible_tags invalido';
  end if;
  if not public.tags_all_exist(new.phase_tags, array['phase']::text[]) then
    raise exception 'phase_tags invalido';
  end if;
  return new;
end;
$$;

create trigger meals_library_validate_tags_trigger
  before insert or update on public.meals_library
  for each row
  execute function public.meals_library_validate_tags();

create or replace function public.user_clinical_validate_tags()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.tags_all_exist(new.condition_tags, array['condition']::text[]) then
    raise exception 'condition_tags invalido';
  end if;
  if not public.tags_all_exist(new.capability_tags, array['capability']::text[]) then
    raise exception 'capability_tags invalido';
  end if;
  return new;
end;
$$;

create trigger user_clinical_validate_tags_trigger
  before insert or update on public.user_clinical_conditions
  for each row
  execute function public.user_clinical_validate_tags();

create or replace function public.user_nutrition_validate_tags()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.tags_all_exist(new.avoids_tags, array['contains']::text[]) then
    raise exception 'avoids_tags invalido';
  end if;
  return new;
end;
$$;

create trigger user_nutrition_validate_tags_trigger
  before insert or update on public.user_nutrition_profiles
  for each row
  execute function public.user_nutrition_validate_tags();

create or replace function public.user_cycle_validate_tags()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.tags_all_exist(new.phase_tags, array['phase', 'condition']::text[]) then
    raise exception 'phase_tags invalido';
  end if;
  return new;
end;
$$;

create trigger user_cycle_validate_tags_trigger
  before insert or update on public.user_cycle_profiles
  for each row
  execute function public.user_cycle_validate_tags();

create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.set_updated_at();

create trigger user_biometrics_set_updated_at
  before update on public.user_biometrics
  for each row
  execute function public.set_updated_at();

create trigger user_clinical_set_updated_at
  before update on public.user_clinical_conditions
  for each row
  execute function public.set_updated_at();

create trigger user_nutrition_set_updated_at
  before update on public.user_nutrition_profiles
  for each row
  execute function public.set_updated_at();

create trigger user_cycle_set_updated_at
  before update on public.user_cycle_profiles
  for each row
  execute function public.set_updated_at();

create trigger user_habit_prefs_set_updated_at
  before update on public.user_habit_prefs
  for each row
  execute function public.set_updated_at();

create trigger exercises_library_set_updated_at
  before update on public.exercises_library
  for each row
  execute function public.set_updated_at();

create trigger meals_library_set_updated_at
  before update on public.meals_library
  for each row
  execute function public.set_updated_at();

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
  v_phases text[] := '{}';
  v_union text[] := '{}';
begin
  if not public.has_accepted_consent('health_personalization') then
    return;
  end if;

  select
    coalesce(clinical.condition_tags, '{}'),
    coalesce(clinical.capability_tags, '{}')
  into v_conditions, v_capabilities
  from public.user_clinical_conditions as clinical
  where clinical.user_id = (select auth.uid());

  if not found then
    return;
  end if;

  select coalesce(cycle.phase_tags, '{}')
  into v_phases
  from public.user_cycle_profiles as cycle
  where cycle.user_id = (select auth.uid());

  if not found then
    v_phases := '{}';
  end if;

  v_union := v_conditions || v_phases;

  return query
  select exercise.*
  from public.exercises_library as exercise
  where exercise.is_published = true
    and not (exercise.contraindication_tags && v_union)
    and exercise.required_capability_tags <@ v_capabilities
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
  'Motor de treino no banco. Sem consentimento de personalizacao, sem linha clinica ou capacidades vazias, nao devolve exercicio.';

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
      v_pattern = 'sem-padrao'
      or (
        v_pattern = 'vegano'
        and meal.diet_compatible_tags @> array['vegano']::text[]
      )
      or (
        v_pattern = 'vegetariano'
        and (
          meal.diet_compatible_tags @> array['vegetariano']::text[]
          or meal.diet_compatible_tags @> array['vegano']::text[]
        )
      )
    )
  order by
    (meal.diet_compatible_tags @> array['baixo-custo']::text[]) desc,
    meal.title;
end;
$$;

comment on function public.list_safe_meals() is
  'Motor de refeicao no banco. Exclui contains_tags cruzado com avoids e exige padrao vegano/vegetariano.';

-- ---------------------------------------------------------------------------
-- rls
-- ---------------------------------------------------------------------------

alter table public.tags enable row level security;
alter table public.tag_block_rules enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.lgpd_consent_logs enable row level security;
alter table public.user_biometrics enable row level security;
alter table public.user_clinical_conditions enable row level security;
alter table public.user_nutrition_profiles enable row level security;
alter table public.user_cycle_profiles enable row level security;
alter table public.user_habit_prefs enable row level security;
alter table public.habit_logs enable row level security;
alter table public.exercises_library enable row level security;
alter table public.meals_library enable row level security;
alter table public.care_circles enable row level security;
alter table public.care_circle_members enable row level security;
alter table public.care_events enable row level security;

create policy "authenticated can select tags"
  on public.tags
  for select
  to authenticated
  using (true);

create policy "admin can insert tags"
  on public.tags
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admin can update tags"
  on public.tags
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin can delete tags"
  on public.tags
  for delete
  to authenticated
  using ((select public.is_admin()));

create policy "authenticated can select tag block rules"
  on public.tag_block_rules
  for select
  to authenticated
  using (true);

create policy "admin can insert tag block rules"
  on public.tag_block_rules
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admin can update tag block rules"
  on public.tag_block_rules
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin can delete tag block rules"
  on public.tag_block_rules
  for delete
  to authenticated
  using ((select public.is_admin()));

create policy "users can select own profile"
  on public.user_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "circle mates can select public profile"
  on public.user_profiles
  for select
  to authenticated
  using ((select public.is_circle_mate(id)));

create policy "users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "users can select own role"
  on public.user_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can select own consent logs"
  on public.lgpd_consent_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own consent logs"
  on public.lgpd_consent_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can select own biometrics"
  on public.user_biometrics
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own biometrics with consent"
  on public.user_biometrics
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('biometrics')
  );

create policy "users can update own biometrics with consent"
  on public.user_biometrics
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('biometrics')
  );

create policy "users can delete own biometrics"
  on public.user_biometrics
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can select own clinical conditions"
  on public.user_clinical_conditions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own clinical conditions with consent"
  on public.user_clinical_conditions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('health_personalization')
  );

create policy "users can update own clinical conditions with consent"
  on public.user_clinical_conditions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('health_personalization')
  );

create policy "users can delete own clinical conditions"
  on public.user_clinical_conditions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can select own nutrition"
  on public.user_nutrition_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own nutrition with consent"
  on public.user_nutrition_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('health_personalization')
  );

create policy "users can update own nutrition with consent"
  on public.user_nutrition_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('health_personalization')
  );

create policy "users can delete own nutrition"
  on public.user_nutrition_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can select own cycle"
  on public.user_cycle_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own cycle with consent"
  on public.user_cycle_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('cycle_module')
  );

create policy "users can update own cycle with consent"
  on public.user_cycle_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and public.has_accepted_consent('cycle_module')
  );

create policy "users can delete own cycle"
  on public.user_cycle_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can select own habit prefs"
  on public.user_habit_prefs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can update own habit prefs"
  on public.user_habit_prefs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can select own habit logs"
  on public.habit_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own habit logs"
  on public.habit_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own habit logs"
  on public.habit_logs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own habit logs"
  on public.habit_logs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "authenticated can select published exercises"
  on public.exercises_library
  for select
  to authenticated
  using (is_published = true or (select public.is_admin()));

create policy "admin can insert exercises"
  on public.exercises_library
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admin can update exercises"
  on public.exercises_library
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin can delete exercises"
  on public.exercises_library
  for delete
  to authenticated
  using ((select public.is_admin()));

create policy "authenticated can select published meals"
  on public.meals_library
  for select
  to authenticated
  using (is_published = true or (select public.is_admin()));

create policy "admin can insert meals"
  on public.meals_library
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admin can update meals"
  on public.meals_library
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin can delete meals"
  on public.meals_library
  for delete
  to authenticated
  using ((select public.is_admin()));

create policy "members can select own circles"
  on public.care_circles
  for select
  to authenticated
  using ((select public.is_circle_member(id)));

create policy "users can insert circles they create"
  on public.care_circles
  for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "creators can update circles"
  on public.care_circles
  for update
  to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

create policy "creators can delete circles"
  on public.care_circles
  for delete
  to authenticated
  using ((select auth.uid()) = created_by);

create policy "members can select circle membership"
  on public.care_circle_members
  for select
  to authenticated
  using ((select public.is_circle_member(circle_id)));

create policy "users can leave circles"
  on public.care_circle_members
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.join_care_circle(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_circle uuid;
  v_user uuid;
begin
  v_user := (select auth.uid());
  if v_user is null then
    raise exception 'nao autenticado';
  end if;

  select circles.id
  into v_circle
  from public.care_circles as circles
  where circles.invite_code = p_invite_code;

  if v_circle is null then
    raise exception 'convite invalido';
  end if;

  insert into public.care_circle_members (circle_id, user_id)
  values (v_circle, v_user)
  on conflict do nothing;

  return v_circle;
end;
$$;

comment on function public.join_care_circle(text) is
  'Entrada no circulo so por codigo de convite. Evita insert direto por uuid.';

create policy "members can select care events"
  on public.care_events
  for select
  to authenticated
  using ((select public.is_circle_member(circle_id)));

create policy "users can insert own care events in their circles"
  on public.care_events
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select public.is_circle_member(circle_id))
  );

create policy "users can delete own care events"
  on public.care_events
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------

revoke all on function public.is_admin() from public;
revoke all on function public.is_circle_member(uuid) from public;
revoke all on function public.is_circle_mate(uuid) from public;
revoke all on function public.has_accepted_consent(text) from public;
revoke all on function public.list_safe_exercises() from public;
revoke all on function public.list_safe_meals() from public;
revoke all on function public.join_care_circle(text) from public;
revoke all on function public.tags_all_exist(text[], text[]) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_circle_member(uuid) to authenticated;
grant execute on function public.is_circle_mate(uuid) to authenticated;
grant execute on function public.has_accepted_consent(text) to authenticated;
grant execute on function public.list_safe_exercises() to authenticated;
grant execute on function public.list_safe_meals() to authenticated;
grant execute on function public.join_care_circle(text) to authenticated;
grant execute on function public.tags_all_exist(text[], text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- storage de conteudo (nao e foto de corpo)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media',
  'content-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do nothing;

create policy "authenticated can read content media"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'content-media');

create policy "admin can insert content media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'content-media'
    and (select public.is_admin())
  );

create policy "admin can update content media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'content-media'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'content-media'
    and (select public.is_admin())
  );

create policy "admin can delete content media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'content-media'
    and (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- seed de tags e regras minimas de bloqueio (nao e dado pessoal)
-- ---------------------------------------------------------------------------

insert into public.tags (slug, domain, kind, label) values
  ('lca-rompido', 'movement', 'condition', 'LCA rompido'),
  ('hernia', 'movement', 'condition', 'Hernia'),
  ('condromalacia', 'movement', 'condition', 'Condromalacia'),
  ('hipertensao', 'movement', 'condition', 'Hipertensao'),
  ('labirintite', 'movement', 'condition', 'Labirintite'),
  ('cadeirante', 'movement', 'condition', 'Uso de cadeira de rodas'),
  ('mobilidade-reduzida', 'movement', 'condition', 'Mobilidade reduzida permanente'),
  ('gestacao-trimestre-1', 'cycle', 'condition', 'Gestacao trimestre 1'),
  ('gestacao-trimestre-2', 'cycle', 'condition', 'Gestacao trimestre 2'),
  ('gestacao-trimestre-3', 'cycle', 'condition', 'Gestacao trimestre 3'),
  ('pos-parto', 'cycle', 'condition', 'Pos-gestacao'),
  ('em-pe', 'movement', 'capability', 'Em pe'),
  ('sentado', 'movement', 'capability', 'Sentado'),
  ('deitado', 'movement', 'capability', 'Deitado'),
  ('unilateral', 'movement', 'capability', 'Unilateral'),
  ('sem-impacto', 'movement', 'capability', 'Sem impacto'),
  ('peso-corporal', 'movement', 'equipment', 'Peso corporal'),
  ('parede', 'movement', 'equipment', 'Parede'),
  ('cadeira', 'movement', 'equipment', 'Cadeira'),
  ('garrafa', 'movement', 'equipment', 'Garrafa'),
  ('toalha', 'movement', 'equipment', 'Toalha'),
  ('saco-alimento', 'movement', 'equipment', 'Saco de alimento'),
  ('pausa-ativa', 'habit', 'intensity', 'Pausa ativa'),
  ('intensidade-baixa', 'movement', 'intensity', 'Intensidade baixa'),
  ('intensidade-media', 'movement', 'intensity', 'Intensidade media'),
  ('intensidade-alta', 'movement', 'intensity', 'Intensidade alta'),
  ('alto-impacto', 'movement', 'intensity', 'Alto impacto'),
  ('pliometria-inferior', 'movement', 'intensity', 'Pliometria inferior'),
  ('carga-axial', 'movement', 'intensity', 'Carga axial'),
  ('decubito-ventral', 'movement', 'intensity', 'Decubito ventral'),
  ('giro', 'movement', 'intensity', 'Giro'),
  ('inversao', 'movement', 'intensity', 'Inversao'),
  ('gluten', 'food', 'contains', 'Gluten'),
  ('lactose', 'food', 'contains', 'Lactose'),
  ('ovo', 'food', 'contains', 'Ovo'),
  ('amendoim', 'food', 'contains', 'Amendoim'),
  ('soja', 'food', 'contains', 'Soja'),
  ('carne', 'food', 'contains', 'Carne'),
  ('peixe', 'food', 'contains', 'Peixe'),
  ('vegano', 'food', 'diet', 'Vegano'),
  ('vegetariano', 'food', 'diet', 'Vegetariano'),
  ('baixo-custo', 'food', 'diet', 'Baixo custo'),
  ('ciclo-ativo', 'cycle', 'phase', 'Ciclo ativo'),
  ('ciclo-menstrual', 'cycle', 'phase', 'Fase menstrual'),
  ('ciclo-folicular', 'cycle', 'phase', 'Fase folicular'),
  ('ovulacao', 'cycle', 'phase', 'Ovulacao'),
  ('lutea', 'cycle', 'phase', 'Fase lutea');

insert into public.tag_block_rules (condition_slug, blocked_content_tag) values
  ('lca-rompido', 'alto-impacto'),
  ('lca-rompido', 'pliometria-inferior'),
  ('condromalacia', 'alto-impacto'),
  ('condromalacia', 'pliometria-inferior'),
  ('hernia', 'carga-axial'),
  ('hipertensao', 'intensidade-alta'),
  ('labirintite', 'giro'),
  ('labirintite', 'inversao'),
  ('gestacao-trimestre-3', 'alto-impacto'),
  ('gestacao-trimestre-3', 'pliometria-inferior'),
  ('gestacao-trimestre-3', 'decubito-ventral');
