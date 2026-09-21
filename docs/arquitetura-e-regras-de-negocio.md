---
title: Arquitetura e regras de negócio — Cuidado em Par (MVP)
status: aprovado para implementação (Gerente de Tecnologia, PM, Arquiteto, DevOps)
---

# Arquitetura e regras de negócio — MVP

Este documento é a fonte da verdade para o primeiro corte do produto. Não usa inteligência artificial generativa. O motor é cruzamento relacional de tags no PostgreSQL (Supabase).

## 1. O que entra no MVP

Problema: a pessoa cria a conta, declara contexto físico e alimentar, e recebe só conteúdo seguro (calistenia acessível + refeições baratas), com hábitos diários e motivação em par ou grupo.

Sucesso: consistência de hábito (treino feito, água, pausa ativa, refeição do dia), nunca estética, peso ou ranking de corpo.

### Entra
- Conta (Supabase Auth) e consentimento LGPD antes de dado de saúde
- Onboarding em etapas (uma pergunta por tela)
- Bibliotecas de exercícios e de refeições, cadastradas no backoffice
- Motor de tags: bloqueio clínico + exigência de capacidade + bloqueio alimentar
- Módulo opt-in de ciclo menstrual e gestação (não inferido da identidade de gênero)
- Lembretes comuns: hidratação, **sono** e pausa ativa (5 minutos a cada 90 minutos)
- Cuidado coletivo: dupla ou grupo, gamificação de constância
- Backoffice de conteúdo para perfil `admin`
- Componentização forte no frontend visando reuso futuro em React Native

### Fica de fora deste corte
- Diagnóstico clínico de distúrbios do sono / wearables obrigatórios
- Foto do corpo da pessoa usuária
- Cálculo de IMC como meta ou gamificação
- Ranking de peso, calorias queimadas ou “shape”
- Papel `moderator` (não há fila de moderação ainda)
- Admin lendo clínica, biometria ou ciclo de quem usa o app
- IA gerando treino, dieta ou diagnóstico

Roadmap completo de sprints e ideias pós-MVP: `docs/roadmap-pos-mvp-e-sprints.md`.

## 2. O que aproveitar e o que descartar do rascunho anterior

### Aproveitar
- Biblioteca em tabelas `exercises_library` e `meals_library`, mídia no Storage
- Backoffice no mesmo Next.js, rota isolada `(admin)` com checagem de papel
- Grupos de rota `(public)`, `(app)`, `(admin)`
- Onboarding em passos, uma pergunta por tela
- Consentimento antes do dado clínico
- Operador de exclusão: exercício/refeição some se a tag de risco cruza com o perfil
- `user_roles` só para backoffice (`admin` vs `member`)
- Ingredientes em `jsonb` com alternativa de baixo custo
- Trimestre de gestação como bloqueio severo (impacto, decúbito ventral)

### Descartar ou corrigir
- Inferir ciclo/gestação a partir da identidade de gênero ou de “gênero biológico”
- Travar o módulo de ciclo só para “pessoas do gênero biológico feminino”: o módulo é opt-in explícito de quem menstrua ou gesta
- Copy “como gostaria de ser chamada/o/e”: usar “Como podemos te chamar?”
- Achar que `restriction_tags` sozinhas bastam: exercício em pé sem tag `cadeirante` ainda apareceria para quem usa cadeira. É obrigatório o filtro de **capacidade**
- Chamar de `allergy_tags` o que o prato contém: o nome certo é `contains_tags`
- Pausa ativa só se a pessoa marcar escritório: no MVP a pausa ativa é **comum a todo perfil** (prevenção do sedentarismo). Modelo de trabalho pode existir depois, não destrava o hábito
- Exigir peso e altura para o motor funcionar: o cruzamento é por tags. Biometria é opcional, só para sugerir meta de água
- Admin genérico com acesso a log de consentimento identificável: papel de conteúdo ≠ papel de privacidade. No MVP, admin só edita biblioteca. Auditoria LGPD fica na própria conta da pessoa (exportar/apagar) e, se existir visão interna, será papel separado fora deste corte
- “Infraestrutura zero” como premissa de arquitetura: usamos plano gratuito com disciplina (RLS, pouco storage, sem log clínico)

## 3. Regras de negócio

### 3.1 Conta e consentimento
1. Criar conta (e-mail mágico ou e-mail+senha). Isso gera linha em `auth.users` e um `user_profiles` vazio via trigger.
2. Antes de qualquer dado de saúde, registrar consentimentos em `lgpd_consent_logs`:
   - termos de uso e política de privacidade (obrigatório)
   - tratamento de dados de saúde para filtrar treino e refeição (obrigatório para o motor; sem isso o app só oferece hábitos genéricos de água/pausa, sem biblioteca personalizada)
   - módulo de ciclo/gestação (opcional, passo próprio)
   - dado biométrico peso/altura (opcional, só meta de água)
3. Cada consentimento é revogável. Revogar saúde personalizada zera tags clínicas e passa a conteúdo mínimo seguro (só `sem-impacto` + refeições `baixo-custo` sem alergias conhecidas) ou esconde bibliotecas até novo aceite.
4. Excluir conta apaga perfil público, tabelas sensíveis, vínculos de grupo e mídia pessoal (não há mídia pessoal no MVP). Conteúdo de biblioteca criado por admin permanece.

### 3.2 Perfil público versus dado sensível
Público (visível em dupla/grupo, com RLS de membro do círculo): `display_name`, avatar opcional (ilustração, não foto clínica), `onboarding_completed_at`, contagem de dias de cuidado.
Sensível (só `auth.uid()` dono): biometria, condições clínicas, nutrição, ciclo/gestação, consentimentos, metas de água.
Proibido no perfil público e no feed do grupo: lesão, peso, menstruação, gestação, alergia, restrição.

### 3.3 Identidade de gênero e módulo de ciclo
- Identidade de gênero é campo opcional de respeito e comunidade. **Não dispara** treino, dieta nem ciclo.
- Módulo “ciclo menstrual ou gestação” aparece para qualquer perfil, com pergunta explícita: deseja adaptar treino e alimentação a isso?
- Respostas: não agora | ciclo menstrual | gestação | pós-gestação.
- Gestação pede trimestre (1, 2, 3) e grava tags `gestacao-trimestre-n`.
- Ciclo grava fase atual só quando a pessoa informar (cadastro inicial pode ser “não sei a fase”; o filtro usa tag branda `ciclo-ativo` até haver fase).
- Nunca rotular treino como masculino/feminino.

### 3.4 Motor de exercícios (duas travas)
Seja `U` o conjunto de tags clínicas da pessoa e `C` o conjunto de capacidades da pessoa.

Um exercício `E` só é oferecido se:
1. **Exclusão:** `E.contraindication_tags ∩ U = vazio`
2. **Capacidade:** `E.required_capability_tags ⊆ C` (todo requisito do exercício a pessoa atende)
3. Equipamento do exercício está na lista permitida do produto (peso corporal ou item doméstico). Academia e máquina não entram no cadastro padrão.

Em dúvida de tag, o conteúdo não é publicado. Conteúdo sem `required_capability_tags` não vai ao ar (falso seguro).

Capacidades iniciais derivadas do onboarding:
- mobilidade plena em pé: `em-pe`, `sentado`, `deitado` (deitado ainda pode ser bloqueado por gestação via contraindicação)
- cadeira de rodas ou mobilidade reduzida permanente: `sentado` (não assume `em-pe` nem `deitado` sem pergunta extra)
- “nenhuma lesão”: não adiciona contraindicação; capacidades seguem a mobilidade

### 3.5 Motor de refeições (exclusão + padrão alimentar)
Um prato `P` só é oferecido se:
1. **Exclusão:** `P.contains_tags ∩ pessoa.avoids_tags = vazio`
2. **Padrão:** se a pessoa é `vegano`, `P.diet_compatible_tags` contém `vegano`. Se `vegetariano`, contém `vegetariano` ou `vegano`.
3. Preferência (não bloqueia): `baixo-custo` primeiro na ordenação.

`contains_tags` descreve o que há no prato (gluten, lactose, ovo, amendoim, soja, carne, peixe). Não é “tag de alergia da pessoa”.

### 3.6 Hábitos comuns (todo perfil)
- Lembrete de água: meta diária. Se houver peso consentido, sugerir 35 ml/kg e arredondar; senão sugerir 2 L. A pessoa pode ajustar.
- Sono: registro simples de qualidade e/ou duração; lembrete opcional de horário de descanso. Sem diagnóstico. Conta para dias de cuidado.
- Pausa ativa: a cada 90 minutos, sugerir 5 minutos de movimento filtrado pelo mesmo motor de exercício (nunca um movimento contraindicado).
- Os três nascem disponíveis no onboarding de hábitos. Podem ser silenciados nas preferências, sem apagar o restante do perfil.

### 3.7 Cuidado coletivo (gamificação)
- Dupla (`pair`) ou grupo (`circle`), convite por código.
- Evento que pontua: treino concluído, água do dia atingida, pausa ativa cumprida, refeição do dia marcada. Nome do score: **dias de cuidado**, não calorias.
- Proibido: comparar peso, foto de corpo, streak que humilhe quem falhou. Ausência de um dia não gera copy punitiva.
- Membros do círculo veem só dado público + eventos de hábito, nunca tags clínicas.

### 3.8 Backoffice
- Só `role = admin` acessa `/admin`.
- Admin cria/edita/despublica exercício e refeição, faz upload no bucket `content-media`.
- Admin não lê tabelas `user_*` sensíveis.
- Publicar conteúdo exige tags de contraindicação **ou** declaração explícita `contraindication_tags = {}` mais `required_capability_tags` não vazio, validado na Server Action.

## 4. Fronteiras de dado

| Camada | Tabelas | Quem lê |
|---|---|---|
| Auth | `auth.users` | Supabase Auth |
| Público | `user_profiles`, `user_roles`, `care_circles`, `care_circle_members`, `care_events` (sem payload clínico) | dono; membros do círculo só em colunas públicas |
| Sensível | `user_biometrics`, `user_clinical_conditions`, `user_nutrition_profiles`, `user_cycle_profiles`, `lgpd_consent_logs`, `user_habit_prefs` | somente dono (`auth.uid()`) |
| Conteúdo | `tags`, `exercises_library`, `meals_library` | `authenticated` lê publicados; `admin` escreve |
| Storage | bucket `content-media` | leitura autenticada (ou pública de objeto de conteúdo); escrita admin |

## 5. Modelo de tabelas

Convenções: schema `public`, `id bigint generated always as identity` só onde não houver uuid natural; pessoas usam `uuid` igual a `auth.users.id`. SQL em lowercase na migração. RLS em toda tabela. Nomes de tag em slug kebab-case estável.

### 5.1 Catálogo `public.tags`
- `id` uuid pk
- `slug` text unique not null (ex.: `lca-rompido`)
- `domain` text not null (`movement` | `food` | `habit` | `cycle`)
- `kind` text not null (`condition` | `capability` | `equipment` | `contains` | `diet` | `intensity` | `phase`)
- `label` text not null (texto de interface; UX Writer pode trocar label, não o slug)

Toda tag gravada em array de outra tabela **deve existir** neste catálogo. Educador Físico e Nutricionista são donos dos slugs; Backend não inventa sinônimo (`alto-impacto` ≠ `impacto-alto`).

### 5.2 `public.user_profiles` (público)
- `id` uuid pk references `auth.users(id)` on delete cascade
- `display_name` text
- `gender_identity` text null (opcional; não alimenta motor)
- `health_focus` text null (`quality-of-life` | `physical-preparation` | `maintenance` | `body-composition`) — o último não vira ranking; labels na UI em pt-BR
- `onboarding_completed_at` timestamptz null
- `created_at` / `updated_at` timestamptz

### 5.3 `public.user_roles`
- `user_id` uuid pk references `auth.users(id)` on delete cascade
- `role` text not null default `member` check (`member`, `admin`)
- trigger na criação da conta: insert `member`

### 5.4 `public.user_biometrics` (sensível, 1:1)
- `user_id` uuid pk
- `birth_date` date null
- `weight_kg` numeric null
- `height_cm` numeric null
- `updated_at`

### 5.5 `public.user_clinical_conditions` (sensível, 1:1)
- `user_id` uuid pk
- `condition_tags` text[] not null default `{}` (slugs `kind=condition`)
- `capability_tags` text[] not null default `{}` (slugs `kind=capability`)
- `updated_at`

### 5.6 `public.user_nutrition_profiles` (sensível, 1:1)
- `user_id` uuid pk
- `diet_pattern` text not null default `no-restriction` (`no-restriction` | `vegetarian` | `vegan`)
- `avoids_tags` text[] not null default `{}` (gluten, lactose, egg, peanut, soy, …)
- `updated_at`

### 5.7 `public.user_cycle_profiles` (sensível, 1:1, só se consentir)
- `user_id` uuid pk
- `mode` text not null (`menstrual-cycle` | `pregnancy` | `postpartum`)
- `phase_tags` text[] not null default `{}` (`menstrual-phase`, `follicular-phase`, `ovulation`, `luteal-phase`, `pregnancy-trimester-1` …)
- `updated_at`

Ausência de linha = módulo desligado. Tags de fase entram no conjunto `U` do motor de exercício e podem entrar em filtro brando de refeição (sem inventar milagre metabólico; Nutricionista define quais pratos têm `phase` tags).

### 5.8 `public.lgpd_consent_logs`
- `id` bigint generated always as identity pk
- `user_id` uuid not null
- `purpose` text not null (`terms` | `health_personalization` | `cycle_module` | `biometrics`)
- `accepted` boolean not null
- `recorded_at` timestamptz not null default now()
- Sem update. Novo evento registra revogação (`accepted = false`).

### 5.9 `public.user_habit_prefs`
- `user_id` uuid pk
- `water_goal_ml` integer not null default 2000
- `water_reminder_enabled` boolean not null default true
- `active_pause_enabled` boolean not null default true
- `active_pause_interval_minutes` integer not null default 90

Hábitos cumpridos do dia (água ml, pausas, treino, refeição) podem viver em `public.habit_logs` (`user_id`, `day`, `kind`, `value`) — dado de hábito, não clínico, mas ainda assim só o dono lê. Agregado `care_events` para o grupo: `kind` + `day`, sem ml nem exercício específico se isso revelar restrição. No MVP, o círculo vê só “cumpriu o hábito X no dia”.

### 5.10 `public.exercises_library` (conteúdo)
- `id` uuid pk default gen_random_uuid()
- `title` text not null
- `description` text not null
- `image_paths` text[] not null default `{}` (paths no bucket, não URL assinada permanente)
- `video_url` text null
- `target_muscles` text[] not null default `{}`
- `equipment_tags` text[] not null default `{}`
- `contraindication_tags` text[] not null default `{}`
- `required_capability_tags` text[] not null
- `intensity_tags` text[] not null default `{}`
- `is_published` boolean not null default false
- `created_by` uuid references `auth.users(id)`
- `created_at` / `updated_at`

Pausa ativa reutiliza esta tabela: exercícios com equipment simples e `intensity_tags` contendo `pausa-ativa`.

### 5.11 `public.meals_library` (conteúdo)
- `id` uuid pk
- `title` text not null
- `description` text not null
- `ingredients` jsonb not null default `[]`
  - formato: `[{ "item": "aveia", "qty": "4 colheres", "alt": "banana amassada" }]`
- `image_paths` text[] not null default `{}`
- `meal_slot` text not null (`breakfast` | `lunch` | `snack` | `dinner`)
- `contains_tags` text[] not null default `{}`
- `diet_compatible_tags` text[] not null default `{}` (sempre incluir `low-cost` quando couber)
- `phase_tags` text[] not null default `{}`
- `is_published` boolean not null default false
- `created_by` uuid
- timestamps

### 5.12 Cuidado coletivo
`care_circles`: `id`, `kind` (`pair` | `group`), `name`, `invite_code` unique, `created_by`.
`care_circle_members`: `circle_id`, `user_id`, `joined_at`, unique (circle, user).
`care_events`: `id`, `circle_id`, `user_id`, `day` date, `kind` (`workout` | `water` | `active-pause` | `meal`), unique (circle, user, day, kind).

## 6. Taxonomia inicial (slugs em inglês; `label` em pt-BR)

Movimento / condição (catálogo completo em `lib/clinical/conditions-catalog.ts`): PCD/neuromotor (ex. `spinal-cord-injury-paraplegia`, amputações, hemiplegia), joelho (`torn-acl`, `torn-pcl`, `chondromalacia`…), quadril/pelve, tornozelo/pé, ombro, cotovelo/punho/mão, coluna (`disc-herniation` — legado `hernia` normalizado), sistêmicas (`hypertension`, `labyrinthitis`, osteoporose…). Mobilidade deriva `wheelchair-user` / `reduced-mobility` e reforça capabilities.
Movimento / capacidade: `standing`, `seated`, `lying`, `unilateral`, `low-impact`.
Movimento / intensidade: `active-pause`, `low-intensity`, `medium-intensity`, `high-intensity`, `high-impact`, `lower-body-plyometrics`, `axial-load`, `prone-position`, `spin`, `inversion`.
Equipamento: `bodyweight`, `wall`, `chair`, `bottle`, `towel`, `food-bag`.
Alimento / contém: `gluten`, `lactose`, `egg`, `peanut`, `soy`, `meat`, `fish`.
Alimento / dieta: `vegan`, `vegetarian`, `low-cost`.
Ciclo / fase: `cycle-active`, `menstrual-phase`, `follicular-phase`, `ovulation`, `luteal-phase`.

Educador Físico e Nutricionista fecham o mapa condição → contraindicações na `/auditoria-motor` antes de popular a biblioteca.

Mapa mínimo de segurança (obrigatório no seed):
- `torn-acl` bloqueia `high-impact`, `lower-body-plyometrics`
- `chondromalacia` bloqueia `lower-body-plyometrics`, `high-impact`
- `hernia` bloqueia `axial-load`
- `hypertension` bloqueia `high-intensity`
- `labyrinthitis` bloqueia `spin`, `inversion`
- `pregnancy-trimester-3` bloqueia `high-impact`, `prone-position`, `lower-body-plyometrics`
- `wheelchair-user` / `reduced-mobility`: capacidades só `seated` (+ `unilateral` se couber); exercícios com `standing` não passam na trava 2

## 7. Contratos de consulta (Server Actions / Server Components)

Leitura autenticada, nunca service role no cliente. Erro para a pessoa: genérico. Sem log de tags.

### 7.1 Exercícios seguros
Entrada: `auth.uid()`.
Ler `condition_tags + phase_tags` (união `U`) e `capability_tags` (`C`).
Query (ideia):

```sql
select e.*
from public.exercises_library as e
where e.is_published = true
  and not (e.contraindication_tags && $u)
  and e.required_capability_tags <@ $c
order by e.title;
```

`$u` e `$c` vêm das tabelas sensíveis da própria pessoa, em Server Component/Action. Não enviar o vetor clínico para o cliente para “filtrar no React”.

### 7.2 Refeições seguras
```sql
select m.*
from public.meals_library as m
where m.is_published = true
  and not (m.contains_tags && $avoids)
  and (
    $pattern = 'no-restriction'
    or ($pattern = 'vegan' and m.diet_compatible_tags @> array['vegan']::text[])
    or ($pattern = 'vegetarian' and (m.diet_compatible_tags @> array['vegetarian']::text[] or m.diet_compatible_tags @> array['vegan']::text[]))
  )
order by (m.diet_compatible_tags @> array['low-cost']::text[]) desc, m.title;
```

### 7.3 Onboarding
Uma Server Action por passo, com `auth.uid()`, upsert só da tabela daquele passo, recusa se o consentimento correspondente não estiver `accepted = true` no último evento daquela `purpose`.

### 7.4 Admin
Server Actions de biblioteca: `is_admin()` (security definer, `search_path = ''`, lê `user_roles`). Upload: signed upload para `content-media/{exercises|meals}/{id}/`.

## 8. RLS e índices

Toda tabela: `enable row level security`. Políticas separadas por select/insert/update/delete e por `authenticated` (sem `FOR ALL`). `anon` não lê saúde nem biblioteca no MVP (conteúdo depois do login).

Padrão dono:
- using / with check: `(select auth.uid()) = user_id`

`user_profiles` select:
- dono lê a própria linha
- membro do mesmo círculo lê só a linha do colega (colunas públicas; não incluir joins para tabelas sensíveis)

`user_roles` select: a própria linha. insert/update: só via trigger/service no servidor, não pelo cliente.

Biblioteca select: `authenticated` e `is_published = true`, ou `is_admin()`. insert/update/delete: `is_admin()`.

`care_events` select: membro do círculo. insert: `user_id = auth.uid()` e membership. Sem update de evento alheio.

Índices:
- `user_id` em toda tabela sensível e de hábito
- gin em todos os `text[]` de tags usados no filtro
- `care_circle_members (user_id, circle_id)` e `(circle_id, user_id)`
- `lgpd_consent_logs (user_id, purpose, recorded_at desc)`

Função `public.is_admin()`: security definer, `search_path = ''`, `stable`, retorna exists em `user_roles` para `(select auth.uid())`.

## 9. Pastas Next.js e infra

```
app/(public)/          login, boas-vindas, termos
app/(app)/             home, treinos, refeicoes, habitos, circulo, conta
app/(app)/onboarding/  passos 0–6
app/(admin)/           exercicios, refeicoes
app/actions/           server actions
lib/supabase/          clientes server/browser
lib/tags/              tipos e constantes dos slugs (espelho do catálogo)
middleware.ts          sessão; bloco /admin se não admin
```

PWA: manifest + service worker. Cache de casca da UI. Proibido cache persistente de respostas de clínicas, ciclo, biometria.

Env:
- cliente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- servidor apenas: `SUPABASE_SERVICE_ROLE_KEY` (migração, trigger admin seed — nunca no browser)

Bucket `content-media`: arquivos de biblioteca. Preview Vercel usa projeto Supabase de desenvolvimento, nunca dump de produção.

Logs: rota, status, `user_id` opaco se necessário. Nunca body de onboarding.

## 10. Fluxo de onboarding (produto)

Passo 0 — Conta + termos + consentimento de personalização de saúde.
Passo 1 — “Como podemos te chamar?” Identidade de gênero opcional (pular).
Passo 2 — Foco de saúde (botões). Biometria opcional: peso para meta de água; altura e nascimento só se houver finalidade clara depois; não bloqueiam avançar.
Passo 3 — Condições e mobilidade (múltipla escolha em bloco, opção “nenhuma” / “prefiro não informar” = sem tags de condição, capacidades padrão em pé).
Passo 4 — Padrão alimentar e o que evitar.
Passo 5 — Opt-in ciclo/gestação. Se não, pula. Se gestação, trimestre.
Passo 6 — Confirma água (meta sugerida) e pausa ativa (ambos ligados). Convite de dupla/grupo pode ser este passo ou a home depois do primeiro dia — preferir a home para não alongar o cadastro.

Não misturar várias perguntas clínicas na mesma tela.

## 11. Ordem de implementação

1. Educador Físico + Nutricionista: fechar mapa de tags (este doc já traz o mínimo).
2. Especialista LGPD + UX Writer: textos de consentimento do passo 0.
3. Arquiteto/Backend: migração, RLS, `is_admin()`, trigger de perfil, catálogo `tags`.
4. DevOps: projeto Supabase, bucket, env, não commitar secrets.
5. Backend: actions de onboarding e queries 7.1 e 7.2.
6. Designer UX + Frontend: onboarding e home com listas já filtradas no servidor.
7. Backend + Frontend: backoffice mínimo de biblioteca.
8. Cuidado coletivo (depois que o motor individual estiver testado).
9. QA + `/auditoria-motor` + `/revisao-clinica-lgpd`.

## 12. Riscos
- Falso seguro por exercício sem `required_capability_tags`.
- Falso seguro por refeição sem `contains_tags` (prato com leite “limpo”).
- Vazamento de ciclo/gestação no círculo.
- Middleware de admin só no Next, sem RLS: alguém chama a action direto.
- Filtrar tags no cliente: o bundle ou o React nunca devem receber a biblioteca completa para esconder linha.
- Identidade de gênero usada como proxy clínico.
