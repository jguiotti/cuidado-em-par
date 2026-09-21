# Sprint 4 — Backoffice de refeições + motor na UI (Mover / Comer)

Comando de origem: `/nova-feature`  
Status: **fechado (QA aprovado)**. Biblioteca expandida (~99 refeições) com fotos em `public/meal-photos`.  
Nutricionista: dona do cardápio seed; Educador: UI Mover reusa biblioteca Sprint 3.

---

## 1. Product Manager

### Problema e para quem
A pessoa já cadastrou restrições e capacidades, mas ainda vê placeholders em Treinos/Refeições. Sem lista filtrada no servidor e sem “marquei como feito”, o motor de tags não vira rotina do dia. Quem opera conteúdo precisa cadastrar refeições baratas e seguras no admin, espelhando o padrão do Sprint 3.

### Pilares
Inclusão e segurança clínica (conteúdo incompatível não aparece); baixo custo (ingredientes comuns); hábitos (marcar treino/refeição feitos); santuário (listas calmas, sem ranking corporal); LGPD (filtro no servidor; admin sem clínica de quem usa o app).

### Escopo do Sprint 4
**Entra**
- Gate admin: CRUD de refeições em `/admin/meals` (lista, criar, editar, publicar/despublicar, upload de imagem).
- Formulário: título, descrição, ingredientes (JSON controlado), `meal_slot`, `contains_tags`, `diet_compatible_tags`, `phase_tags` (catálogo fechado; seed pode deixar vazio).
- Seed mínimo Nutricionista (8–12 refeições): café, almoço, lanche, jantar; pelo menos uma vegana, uma vegetariana, todas com `low-cost` quando couber; contains honestos.
- UI pessoa usuária:
  - **Mover** (`/workouts`): lista via `list_safe_exercises()` no servidor; detalhe leve; marcar como feito (`habit_logs.kind = workout`).
  - **Comer** (`/meals`): lista via `list_safe_meals()` no servidor; detalhe com ingredientes; marcar como feito (`habit_logs.kind = meal`).
- Estados: vazio (sem perfil nutricional / sem consentimento / lista vazia segura), carregando, erro genérico.
- Nav/copy: alinhar labels da aba para **Mover** e **Comer** (roadmap), mantendo rotas `/workouts` e `/meals` se já estáveis.

**Fora**
- Home ritual completa água/sono/pausa — Sprint 5.
- Conta LGPD (exportar/excluir) — Sprint 6.
- Círculo / `care_events` no feed coletivo — Sprint 7 (neste sprint só `habit_logs` do dono).
- IA gerando receita, macros, “plano da semana”.
- Filtro agressivo por fase do ciclo no motor de refeições (coluna `phase_tags` existe; uso clínico fica opt-in e prudente — seed sem phase ou só marcação documental; **não** inventar cardápio por fase sem regra Nutricionista fechada).
- Lista de mercado, lista de compras, timer de cozinha.
- Detalhe com vídeo de exercício obrigatório; séries/reps geradas.

### Aceite
1. Só admin muta `meals_library`; member só lê publicados (RLS).
2. Publicar refeição exige `meal_slot` válido + `contains_tags`/`diet_compatible_tags` do catálogo; preferência: exige `low-cost` em `diet_compatible_tags` ou aviso explícito no admin.
3. `list_safe_meals` / `list_safe_exercises` só no servidor; vetor clínico/avoids **não** vai ao client para filtrar.
4. Perfil com `avoids_tags` contendo `gluten` não vê refeição com `contains_tags` ⊇ gluten.
5. Perfil `vegan` só vê refeições com `diet_compatible_tags` ⊇ `vegan`.
6. Perfil `torn-acl` não vê exercícios com intensity de risco mapeada (regressão Sprint 3).
7. “Marquei como feito” grava `habit_logs` do dia (`workout` ou `meal`) só para `auth.uid()`; UI confirma sem culpa.
8. Lista vazia segura: mensagem acolhedora, sem sugerir desligar restrição.
9. Zero emoji; sem milagre / emagreça / ranking.
10. Admin de refeições não consulta clínica, ciclo nem biometria.

---

## 2. Nutricionista — tags e segurança alimentar

### Papel do backoffice
Admin **não inventa** receita por IA: escolhe tags fechadas e descreve prato com ingredientes baratos. Em dúvida de alergia → **não publicar**.

### Tags da refeição (conteúdo)
| Campo | Kind | Catálogo MVP |
|---|---|---|
| `contains_tags` | `contains` | `gluten`, `lactose`, `egg`, `peanut`, `soy`, `meat`, `fish` (mesmo catálogo do onboarding) |
| `diet_compatible_tags` | `diet` | `vegan`, `vegetarian`, `low-cost` (sempre preferir `low-cost`) |
| `meal_slot` | enum | `breakfast` \| `lunch` \| `snack` \| `dinner` |
| `phase_tags` | phase | **opcional neste sprint**; se preenchido, só slugs já existentes; motor **não** filtra por fase no MVP desta sprint |

### Regras de cadastro
1. `contains_tags` descreve o que **há no prato**, não a alergia da pessoa.
2. Prato vegano: `diet_compatible_tags` inclui `vegan` (e pode incluir `vegetarian`).
3. Vegetariano aceita `vegetarian` **ou** `vegan` (já no motor).
4. Base da despensa: ovos, aveia, raízes, leguminosas, vegetais da estação, banana, arroz, feijão, farinha de milho — sem whey caro / superfood importado como padrão.
5. Substituição barata no JSON `ingredients[].alt` quando couber.
6. Celíaco: se houver trigo/aveia com glúten → marcar `gluten`. Aveia só se for “aveia sem glúten” explícita **e** Nutricionista confirmar; caso contrário marcar `gluten` ou não usar.
7. Em dúvida → rascunho.

### Seed mínimo sugerido (títulos pt-BR; tags EN)
| Título | Slot | contains | diet | Notas |
|---|---|---|---|---|
| Mingau de aveia e banana | breakfast | `gluten` (se aveia comum) | `vegetarian`, `low-cost` | alt: banana amassada pura se sem aveia segura |
| Omelete de legumes | breakfast | `egg` | `vegetarian`, `low-cost` | |
| Vitamina de banana e leite | breakfast | `lactose` | `vegetarian`, `low-cost` | alt plant milk → remover lactose e marcar vegan se couber |
| Arroz, feijão e salada | lunch | — | `vegan`, `low-cost` | base do MVP |
| Ovos mexidos com batata-doce | lunch | `egg` | `vegetarian`, `low-cost` | |
| Wrap de grão-de-bico | lunch | `gluten` (se tortilha trigo) | `vegan`, `low-cost` | ou usar milho e tirar gluten |
| Pasta de grão-de-bico no pão | snack | `gluten` | `vegan`, `low-cost` | |
| Iogurte natural com fruta | snack | `lactose` | `vegetarian`, `low-cost` | |
| Sopa de legumes | dinner | — | `vegan`, `low-cost` | |
| Peixe assado com legumes | dinner | `fish` | `low-cost` | só quem não evita peixe |
| Frango desfiado com arroz | dinner | `meat` | `low-cost` | |
| Salada de grãos frios | dinner | — | `vegan`, `low-cost` | |

Nutricionista fecha a lista exacta no `/implementar` (8–12 itens). Sem macros obrigatórios.

### O que o Backend filtra
Já coberto por `list_safe_meals()`: `contains_tags && avoids_tags` + padrão vegan/vegetarian + prioridade `low-cost`. Sprint 4 **não** reescreve o motor salvo bug encontrado no QA.

---

## 3. Educador Físico — superfície Mover

### Escopo
Sem novos exercícios obrigatórios. UI consome `list_safe_exercises()` + ilustrações já seedadas.

### Regras de UI
1. Não mostrar contraindicação clínica na lista da pessoa (só o conteúdo seguro).
2. Detalhe: título, descrição, equipamentos (labels pt-BR), músculos, ilustração se houver.
3. “Feito” = consistência do dia, não performance.
4. Regressão QA: `torn-acl`, só `seated`, gestação T3 — mesma matriz Sprint 3.

---

## 4. Especialista LGPD — **aprovado com restrição**

### Inventário
| Dado | Classificação | Finalidade | Público? |
|---|---|---|---|
| Conteúdo `meals_library` | Institucional | Oferecer comida segura | Publicado: leitura autenticada |
| `habit_logs` workout/meal | Hábito (não clínico) | Consistência do dia | Só dono |
| Tags clínicas / avoids | Sensível | Motor no servidor | Nunca no client para filtrar; admin não lê |
| Paths de mídia refeição | Conteúdo | Exibir prato | Sim (bucket) |

### Consentimento
Nenhum consentimento novo. `list_safe_*` já exige `health_personalization` aceito. Sem perfil nutricional → lista vazia (não inventar).

### Restrições
1. Admin não busca pessoa, clínica, evita, ciclo ou peso.
2. Marcar feito não grava qual restrição a pessoa tem; só `kind` + `day` (+ value opcional neutro).
3. Sem analytics de “qual alergia bateu com qual prato”.
4. Erros genéricos; sem log de tags.

### Parecer
**Aprovado com restrição:** CRUD refeições + UI filtrada no servidor + habit_logs do dono. Bloqueado: qualquer painel admin cruzando perfil nutricional real.

---

## 5. Gerente de Tecnologia — plano numerado

| # | Tarefa | Dono | Artefato | Depende de |
|---|---|---|---|---|
| 1 | Confirmar tags food (`contains`/`diet`) e gaps vs seed Nutricionista | Arquiteto + Nutri | Lista slugs admin | — |
| 2 | Helpers admin refeições (sanitize, publish rules, labels pt-BR) | Backend | `lib/admin/meal-tags.ts`, i18n | 1 |
| 3 | Server Actions admin meals (CRUD + publish + signed upload) | Backend | `app/actions/admin-meals.ts` | 1–2 |
| 4 | UI admin `/admin/meals` (lista/form) reusando `TagMultiSelect` | Frontend | `components/admin/meal-form.tsx`, rotas | 3 |
| 5 | Seed SQL 8–12 refeições | Backend + Nutri | migration `seed_meal_library_sprint4` | 1 |
| 6 | Actions pessoa: listar seguros + marcar feito (`habit_logs`) | Backend | `app/actions/safe-content.ts` (ou split) | — |
| 7 | UI Mover (`/workouts`) + Comer (`/meals`) Server Components | Frontend | pages + cards | 6 |
| 8 | Nav labels Mover/Comer + copy i18n | UX Writer + Frontend | `layout.tsx`, `lib/i18n/*` | 7 |
| 9 | QA checklist + smoke (meal tags + habit_logs + regressão exercise) | QA | `docs/features/sprint-04-qa-checklist.md` | 3–8 |
| 10 | Doc status + roadmap | GT | este arquivo + roadmap | 9 |

**Ordem:** tags/helpers → admin meals → seed → list/mark actions → UI pessoa → copy → QA.

**Riscos de infra:** imagens de prato no free tier; N+1 se assinar Storage por card (mitigar: ilustração opcional / path público como exercícios se houver seed de imagens depois). Roundtrips: uma RPC `list_safe_*` por tela.

**Agentes obrigatórios:** PM, Nutri, Educador (Mover), LGPD, Arquiteto, Backend, Frontend, UX, UX Writer, QA.

---

## 6. Arquiteto

### Fronteira
- **Conteúdo:** `meals_library`, `exercises_library`, Storage `content-media/meals|exercises`.
- **Hábito:** `habit_logs` (dono).
- **Sensível:** `user_nutrition_profiles`, clínica — só dentro de `list_safe_*` (security invoker + RLS).

### Schema
Reusar tabelas. Possíveis ajustes mínimos:
1. Garantir tags `vegan`/`vegetarian`/`low-cost` e contains EN no seed (migration EN já mapeou).
2. Opcional: validação publish “exige ≥ 1 diet tag” na action (não precisa constraint nova).
3. Sem tabela de “plano alimentar diário” neste sprint.
4. `habit_logs.value`: opcional `null` ou contagem `1`; não gravar `meal_id` se isso puder reidentificar restrição no futuro coletivo — **MVP: gravar só kind+day** (ou value=1). Se quiser `meal_id`/`exercise_id` só no log privado do dono, LGPD aceita **com restrição** (não espelhar em `care_events`). Decisão: **permitir `value` JSON mínimo `{ "content_id": uuid }` só em habit_logs do dono**, nunca em care_events. Se estourar tempo: só kind+day.

### RLS (já existe — verificar)
- `meals_library`: igual exercícios.
- `habit_logs`: CRUD dono.
- Storage write admin.

### Contratos
```
# Admin
listAdminMealsAction()
getAdminMealAction(id)
createMealAction(input)
updateMealAction(id, input)
setMealPublishedAction(id, isPublished)
createMealImageUploadAction(mealId, fileName)

# Pessoa usuária (Server Component / Action)
listSafeExercisesForMe(): SafeExerciseCard[]  // via rpc list_safe_exercises
listSafeMealsForMe(slot?: MealSlot): SafeMealCard[]
markHabitDoneAction(kind: 'workout' | 'meal', day?: ISODate): ok
// opcional: unmarkHabitDoneAction
```

Erros: `forbidden`, `unauthorized`, `invalid_input`, `publish_needs_*`, genéricos na UI.

### Índices
Já há GIN em `contains_tags` / `diet_compatible_tags`. Confirmar `habit_logs_user_day_idx`.

---

## 7. Designer UX + UX Writer

### Fluxos
1. **Admin refeições:** lista → novo/editar → salvar rascunho → publicar (checklist) → upload imagem.
2. **Mover:** abrir aba → lista segura → toque no card → detalhe → “Marquei como feito” → confirmação suave.
3. **Comer:** idem; filtro opcional por `meal_slot` (chips: Café / Almoço / Lanche / Jantar / Todas) — uma decisão por vez.
4. Vazio seguro: ilustração tonal suave + texto; CTA “Revisar preferências alimentares” só se onboarding incompleto (link Conta/hábitos, sem culpar).

### Visual
Santuário: layers, sem borda dura, cards só se forem o container de ação. Mobile-first. Área de toque generosa. Sem ranking “mais calórico / shred”.

### Copy (pt-BR, inclusiva)
| Chave | Texto sugerido |
|---|---|
| Nav Mover | Mover |
| Nav Comer | Comer |
| Mover título | Mover com cuidado |
| Mover apoio | Movimentos compatíveis com o seu perfil. |
| Comer título | Comer com cuidado |
| Comer apoio | Ideias acessíveis, filtradas pelo que você evita. |
| Feito | Marquei como feito |
| Feito ok | Registrado para hoje. |
| Vazio mover | Por enquanto não há movimento seguro listado para o seu perfil. |
| Vazio comer | Por enquanto não há refeição listada para o seu perfil. |
| Admin meals título | Refeições |
| Publish bloqueado | Para publicar, revise as tags do prato. |

Termos banidos: emagreça, detox, shape, superfood, “pode comer de tudo se quiser”.

---

## 8. QA

### Riscos a matar
1. Falso seguro alimentar (glúten/lactose/carne passam o filtro).
2. Falso seguro movimento (regressão LCA / seated).
3. Filtro no client com tags clínicas.
4. Member publica/edita refeição.
5. habit_logs de outra pessoa.
6. Lista vazia empurrando a pessoa a remover restrição.
7. Copy capacitista / gordofóbica / emoji.

### Casos
| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | avoids gluten | list_safe_meals | sem contains gluten |
| 2 | vegan | list | só diet ⊇ vegan |
| 3 | vegetarian | list | vegetarian ou vegan |
| 4 | no-restriction | list | todos publicados compatíveis |
| 5 | sem nutrition profile | list | vazio |
| 6 | torn-acl | list_safe_exercises | sem high-impact/plyo |
| 7 | seated only | exercises | sem required standing |
| 8 | admin | publish meal sem slot | inválido |
| 9 | member | POST admin meal | forbidden |
| 10 | user | mark meal done | 1 linha habit_logs do dia |
| 11 | user B | ler habit_logs de A | vazio/RLS |
| 12 | despublicar meal | some da lista pessoa | imediato |

### Automatizável
- Smoke sanitizers meal tags + canPublish.
- Script RPC com perfis sintéticos (se ambiente local/test).

### Critério de pronto
Aceite PM 1–10 verde; seed aplicado; checklist QA; roadmap Sprint 4 → fechada após `/implementar` + QA.

---

## Próximo comando

Implementação entregue. Validar com checklist QA.

**Sugerido:** aplicar `20260921150000_seed_meal_library_sprint4.sql`, rodar `/revisao-qa` ou checklist em `docs/features/sprint-04-qa-checklist.md`.
