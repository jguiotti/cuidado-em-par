# Sprint 3 — Backoffice de exercícios (biblioteca segura)

Comando de origem: `/nova-feature`  
Status: **fechado (QA aprovado)** — código, seed completo, ilustrações e checklist QA.  
Nutricionista: fora de escopo deste sprint (refeições = Sprint 4).

Pré-existência útil:
- Tabela `exercises_library` + validação de tags + constraint de publicação com capacidades.
- Função `list_safe_exercises()` (duas travas + `tag_block_rules`).
- RLS admin / publicado; bucket `content-media`; `is_admin()`; `proxy.ts` bloqueia `/admin`.
- Rotas placeholder: `/admin`, `/admin/exercises`, `/admin/meals`.

---

## 1. Product Manager

### Problema e para quem
Sem biblioteca tagueada, o motor não tem o que filtrar. Quem opera o conteúdo (papel `admin`) precisa cadastrar, editar, publicar e despublicar exercícios de calistenia / itens domésticos — inclusive opções **sentadas**, **unilaterais** e **pausa ativa** — sem ver dado de saúde de quem usa o app.

### Pilares
Inclusão radical e segurança clínica; baixo custo (sem academia); hábitos (pausa ativa como conteúdo da mesma biblioteca); santuário (backoffice sóbrio, sem estética de ranking); LGPD (admin ≠ acesso clínico).

### Escopo do Sprint 3
**Entra**
- Gate admin reforçado (layout + Server Actions; proxy já existe).
- CRUD de exercícios em `/admin/exercises` (lista, criar, editar, publicar/despublicar).
- Formulário com: título, descrição, equipamentos, contraindicações, capacidades obrigatórias, intensidades, músculos-alvo (texto livre controlado ou tags), vídeo URL opcional, imagens via Storage.
- Checklist de publicação clínica (bloquear publicar sem capacidades; avisar se sem contraindicação quando intensidade de risco).
- Seed mínimo (SQL) com exercícios reais e seguros: pelo menos sentado, unilateral, em pé, pausa ativa, low-impact.
- Preview admin do que o motor veria para perfis sintéticos (opcional fino: matriz de 3 perfis de teste na própria tela de detalhes — se estourar tempo, fica checklist QA manual).

**Fora**
- UI “Mover” para pessoa usuária (`list_safe_exercises` na home) — Sprint 4.
- CRUD de refeições — Sprint 4 (rota `/admin/meals` permanece placeholder).
- IA gerando descrição, série ou tags.
- Admin lendo clínica/ciclo/biometria de quem usa o app.
- Notificações, círculo, registro de treino feito.

### Aceite
1. Só `role = admin` acessa `/admin/*` e mutações; member recebe redirect/erro genérico.
2. Não admin não lista nem altera `exercises_library` via client (RLS).
3. Publicar exige `required_capability_tags` com ≥ 1 tag (já no banco; UI reforça).
4. Equipamentos só do conjunto doméstico: `bodyweight`, `wall`, `chair`, `bottle`, `towel`, `food-bag`.
5. Tags de conteúdo em inglês; labels pt-BR na UI admin.
6. Upload de imagem só em `content-media/exercises/{id}/…`; path salvo em `image_paths` (não URL permanente assinada).
7. Seed inclui ≥ 1 exercício com `intensity_tags` contendo `active-pause` e ≥ 1 com `required_capability_tags = {seated}` (sem `standing`).
8. Despublicar remove o exercício de qualquer leitura “publicado” imediatamente.
9. Zero emoji; copy sem “emagreça”, “shape”, “treino masculino/feminino”.
10. Admin nunca exibe nem consulta `user_clinical_conditions`, ciclo ou biometria.

---

## 2. Educador Físico — tags e segurança clínica

### Papel do backoffice
O admin **não inventa** fisiologia: escolhe tags de um catálogo fechado. Em dúvida clínica ao cadastrar, **não publicar**.

### Tags do exercício (conteúdo)
| Campo | Kind / domínio | Exemplos obrigatórios no seletor |
|---|---|---|
| `equipment_tags` | equipment | `bodyweight`, `wall`, `chair`, `bottle`, `towel`, `food-bag` |
| `required_capability_tags` | capability | `standing`, `seated`, `lying`, `unilateral`, `low-impact` (≥ 1 para publicar) |
| `contraindication_tags` | condition / phase | do catálogo clínico + fases: `torn-acl`, `disc-herniation`, `chondromalacia`, `hypertension`, `labyrinthitis`, `pregnancy-trimester-3`, `spinal-cord-injury-paraplegia`, … |
| `intensity_tags` | intensity | `active-pause`, `low-intensity`, `medium-intensity`, `high-intensity`, `high-impact`, `lower-body-plyometrics`, `axial-load`, `prone-position`, `spin`, `inversion` + tags do catálogo expandido usadas em `tag_block_rules` (ex.: `deep-knee-flexion`, `overhead-press`, …) |
| `target_muscles` | texto livre curto em pt-BR **ou** lista fechada mínima | Preferir lista fechada no MVP admin: `legs`, `glutes`, `core`, `chest`, `back`, `shoulders`, `arms`, `full-body` (slugs EN; label pt-BR) |

### Regras de cadastro (checklist na UI antes de publicar)
1. Se houver `high-impact` ou `lower-body-plyometrics` → exige ao menos uma contraindicação relevante (ex. `torn-acl`, `chondromalacia`, `pregnancy-trimester-3`) **ou** confirmação explícita “revisão clínica ok” (toggle auditável só no admin, sem dado de usuária). Preferência do Educador: **obrigar** contraindicação quando intensidade de risco estiver marcada.
2. Exercício só sentado: `required_capability_tags` contém `seated` e **não** exige `standing`.
3. Pausa ativa: `intensity_tags` inclui `active-pause`; equipamentos simples; intensidade preferencialmente `low-intensity`.
4. Nunca cadastrar máquina de academia como equipamento.
5. `contraindication_tags` usam o mesmo slug que o perfil (`condition_tags` / fases) — o motor faz `&&` direto.

### Seed mínimo sugerido (títulos pt-BR; tags EN)
| Título | Capacidades | Intensidade | Contraindicações tip. | Equip. |
|---|---|---|---|---|
| Elevação de braços sentada (pausa ativa) | `seated` | `active-pause`, `low-intensity` | — | `chair`, `bodyweight` |
| Ponte de glúteos no solo | `lying` | `low-intensity` | — | `bodyweight` |
| Agachamento apoiado na cadeira | `standing` | `low-intensity` | `deep-knee-flexion` (opcional se amplitude profunda) | `chair`, `bodyweight` |
| Remada com toalha (sentada) | `seated`, `unilateral` opcional | `low-intensity` | — | `towel`, `chair` |
| Prancha de joelhos | `lying` ou apoio | `low-intensity` | `high-intra-abdominal-pressure` se diástase for preocupação — marcar contraindicação `diastasis-recti` se o exercício for plança longa | `bodyweight` |

(Educador fecha a lista exata no `/implementar` com 6–10 itens; não inventar séries por IA.)

### O que o Backend filtra
Já coberto por `list_safe_exercises()`: compartilhamento de contraindicação, subset de capacidades, `tag_block_rules` × `intensity_tags`. Sprint 3 **não** muda a função, só alimenta dados corretos.

---

## 3. Especialista LGPD — **aprovado com restrição**

### Inventário
| Dado | Classificação | Finalidade | Público? |
|---|---|---|---|
| Conteúdo de `exercises_library` | Conteúdo institucional | Oferecer movimento seguro | Publicado: leitura autenticada; rascunho: só admin |
| `created_by` | Operacional | Auditoria de quem cadastrou | Não expor na UI pessoa usuária |
| Paths de mídia | Conteúdo | Exibir exercício | Sim (bucket content-media) |
| Perfis clínicos de quem usa o app | Sensível | — | **Admin não acessa** |

### Consentimento
Nenhum consentimento novo para quem usa o app. Admin é papel interno (`user_roles`).

### Restrições
1. Proibido painel admin com busca de pessoa, clínica, ciclo, peso ou consentimento.
2. Logs de erro não incluem vetores clínicos de usuárias.
3. Service role não no browser; upload via sessão admin + RLS Storage.
4. Seed e fixtures só com conteúdo sintético, nunca dados reais de saúde.

### Parecer
**Aprovado com restrição:** CRUD de biblioteca ok; isolamento estrito do sensível; reforçar gate em layout + actions além do proxy.

---

## 4. Gerente de Tecnologia — plano numerado

| # | Tarefa | Dono | Artefato | Depende de |
|---|---|---|---|---|
| 1 | Confirmar schema tags/equipamentos e gaps vs catálogo clínico expandido (tags intensity novas no seletor) | Arquiteto + Educador | Lista de slugs no formulário | — |
| 2 | (Se precisar) migration: tags intensity/equipment faltantes; opcional `target_muscles` check | Backend | SQL | 1 |
| 3 | Server Actions admin: list/create/update/publish/unpublish + signed upload path | Backend | `app/actions/admin-exercises.ts` | 1–2 |
| 4 | Helpers: catálogo de tags admin (labels pt-BR), validação publish | Backend | `lib/admin/exercise-tags.ts` | 1 |
| 5 | UI lista + formulário + estados | Frontend | `components/admin/*`, rotas `/admin/exercises` | 3–4 |
| 6 | Seed SQL mínimo (6–10 exercícios) | Backend + Educador | migration seed | 1,5 |
| 7 | Copy admin | UX Writer | `lib/i18n/admin-pt-br.ts` | 5 |
| 8 | QA checklist + smoke (admin vs member; publish sem capability) | QA | `docs/features/sprint-03-qa-checklist.md` | 3–6 |
| 9 | Doc status + roadmap | GT | este arquivo + roadmap | 8 |

**Ordem:** tags/contrato → actions → UI → seed → QA.

**Riscos de infra:** Storage no plano free (imagens leves/WebP); muitos roundtrips no form (mitigar: uma action por save); proxy só Next (RLS é a trava real).

---

## 5. Arquiteto

### Fronteira
- **Conteúdo:** `exercises_library`, Storage `content-media`.
- **Operacional:** `user_roles.role = admin`.
- **Sensível:** fora do Sprint 3 (admin não lê).

### Schema
Reusar `exercises_library` como está. Possíveis ajustes:
1. Garantir que todas as intensity tags do catálogo clínico existam em `public.tags` (já parcialmente na migration expand).
2. Opcional: constraint/check em `equipment_tags` ⊆ equipamentos permitidos (hoje validação por `tags_all_exist` kind equipment).
3. Sem tabela nova de “revisão clínica”; se necessário, coluna `admin_clinical_review_note text null` **só admin** — **evitar no MVP**; preferir checklist de UI + não publicar.

### RLS (já existe — verificar no implementar)
- SELECT: `is_published` ou `is_admin()`.
- INSERT/UPDATE/DELETE: `is_admin()`.
- Storage: write admin; read autenticado no bucket content-media.

### Contratos Server Action (nomes EN)
```
requireAdmin(): Promise<{ userId } | error>

listAdminExercisesAction(): ExerciseAdminRow[]
getAdminExerciseAction(id): ExerciseAdminRow | null
createExerciseAction(input): { id }
updateExerciseAction(id, input): ok
setExercisePublishedAction(id, isPublished): ok
createExerciseImageUploadAction(exerciseId, fileName): { path, token } // signed upload
```

**Input create/update (campos):**
- `title`, `description` (pt-BR)
- `equipmentTags: string[]`
- `contraindicationTags: string[]`
- `requiredCapabilityTags: string[]`
- `intensityTags: string[]`
- `targetMuscles: string[]`
- `videoUrl: string | null`
- `imagePaths: string[]` (após upload)
- `isPublished: boolean` (create default false; publish via action dedicada)

**Erros:** `unauthenticated` | `forbidden` | `validation_failed` | `publish_needs_capabilities` | `invalid_tags` | `save_failed`

### Impacto
- Frontend: formulário multi-seleção (mesmo padrão de busca 0–N do onboarding, seletor de tags admin).
- DevOps: documentar promoção de um user a admin (`user_roles`) no README/install — sem service role no client.
- Sprint 4 consumirá a mesma biblioteca via `list_safe_exercises`.

---

## 6. Designer UX + UX Writer

### Intenção
Backoffice com baixa carga: lista clara + um formulário; sem dashboard de métricas corporais. Desktop confortável, mobile usável.

### Fluxo de telas
1. `/admin` — atalhos: Exercícios | Refeições (placeholder) | Voltar ao app.
2. `/admin/exercises` — lista: título, status (rascunho/publicado), capacidades resumidas, CTA “Novo”.
3. `/admin/exercises/new` — formulário completo; salvar como rascunho.
4. `/admin/exercises/[id]` — editar + publicar/despublicar + upload de imagem.
5. Estados: vazio (“Nenhum exercício ainda”), erro de permissão, erro de validação, sucesso discreto.

### Visual
- Tokens atuais (menta/blush/sand); `field-control` nos inputs; tonal layering.
- Status: pill tonal (rascunho = surface-raised; publicado = mint) — sem borda dura.
- Tags: chips removíveis (como onboarding clínico).

### Copy (pt-BR) — rascunho
| Chave | Texto |
|---|---|
| nav | Exercícios |
| listTitle | Biblioteca de exercícios |
| listSupport | Cadastre movimentos com tags. Só o conteúdo publicado entra no filtro seguro. |
| empty | Ainda não há exercícios. Comece pelo primeiro rascunho. |
| newCta | Novo exercício |
| formTitle | Dados do exercício |
| titleLabel | Título |
| descriptionLabel | Como fazer (passo a passo simples) |
| equipmentLegend | Equipamento |
| capabilityLegend | Capacidades necessárias |
| capabilityHint | Quem não tiver todas estas capacidades não verá o exercício. |
| contraindicationLegend | Contraindicações (condições que bloqueiam) |
| intensityLegend | Intensidade e tipo de esforço |
| publishCta | Publicar |
| unpublishCta | Despublicar |
| saveDraftCta | Salvar rascunho |
| publishBlocked | Para publicar, escolha ao menos uma capacidade. |
| forbidden | Esta área é só para quem administra conteúdo. |
| uploadLabel | Imagem de referência |
| videoLabel | Link de vídeo (opcional) |

**Termos banidos:** emagreça, shape, queime gordura, treino de mulher/homem, ignore a dor.

---

## 7. QA — plano de teste

### Riscos a matar
1. Falso seguro: exercício publicado sem `required_capability_tags`.
2. Member altera biblioteca.
3. Admin vê dado clínico de usuária (não deve haver UI/query).
4. Equipamento de academia no seed/form.
5. `active-pause` ausente no seed.
6. Sentado exige `standing` por erro de cadastro.

### Casos
| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | user member | GET `/admin/exercises` | redirect / bloqueio |
| 2 | admin | criar sem capacidades, tentar publicar | `publish_needs_capabilities` / UI bloqueia |
| 3 | admin | publicar com `seated` only | ok; aparece em `list_safe` só se perfil tem `seated` |
| 4 | perfil torn-acl | exercício com intensity `high-impact` | não retorna em `list_safe_exercises` |
| 5 | admin | despublicar | some da lista publicada |
| 6 | admin | upload imagem | path em `image_paths`; objeto no bucket |
| 7 | seed | contar active-pause e seated | ≥ 1 cada |
| 8 | copy | varrer emoji / termos banidos | zero |

### Automatizável
- Script smoke: `derive`/validadores de tags admin; tentativa publish sem capability.
- Manual: UI admin + RPC `list_safe_exercises` com perfis sintéticos.

### Critério de pronto
Aceite PM 1–10 verde; seed aplicado; checklist QA documentado; roadmap Sprint 3 → em implementação ou fechada após `/implementar`.

---

## Próximo comando

Sprint 3 fechada.

**Sugerido:** `/nova-feature` Sprint 4 (backoffice de refeições + motor na UI Mover/Comer).
