# Sprint 2 — Onboarding clínico, alimentar, ciclo e hábitos (água, sono, pausa)

Comando de origem: `/nova-feature`  
Status: **implementado** (código + `docs/features/sprint-02-qa-checklist.md`).  
Sexo atribuído ao nascer é **opcional**; copy explica que a escolha ajuda a montar treinos e refeições mais adequados.

---

## Adendo de produto — sexo atribuído ao nascer (lista fechada)

### O pedido
Perguntar “gênero biológico” em lista pré-definida (não texto livre), para cruzar com ciclo menstrual e gestação, com texto explicativo inclusivo.

### Decisão da squad (PM + Educador + LGPD + UX Writer)

**Não usar o termo “gênero biológico” na interface.**  
Gênero é identidade; o que o motor precisa é **contexto reprodutivo / sexo atribuído ao nascer**, com finalidade clínica explícita — e ainda assim **não substitui** o opt-in de ciclo.

| Conceito | Onde vive | Alimenta o motor? |
|---|---|---|
| Identidade de gênero (Sprint 1, opcional, texto) | `user_profiles.gender_identity` | Não |
| Sexo atribuído ao nascer (Sprint 2, lista fechada) | `user_clinical_conditions` ou coluna sensível dedicada | Só como **contexto**; não bloqueia nem força ciclo |
| Módulo ciclo/gestação (opt-in) | `user_cycle_profiles` + consent `cycle_module` | Sim (tags de fase / trimestre) |

**Por quê não inferir ciclo só pelo sexo atribuído ao nascer**
- Pessoas trans e intersexo menstruam ou gestam fora do binário “mulher cis”.
- Pessoas com sexo atribuído feminino podem não querer o módulo.
- Inferir = falso seguro clínico e exclusão LGBT+ (pilar do produto).

**Como atender a necessidade de cruzamento**
1. Coletar `sex_assigned_at_birth` em **ChoiceCards** (valores em inglês no banco).
2. Mostrar o passo de ciclo/gestação para **todas as pessoas**, com copy clara.
3. Usar o sexo atribuído apenas para: ordenar/enfatizar o convite ao módulo e mensagens de apoio — **nunca** como trava única.
4. Quem marca `male` ainda pode ativar ciclo/gestação (pergunta explícita).
5. Quem marca `female` / `intersex` ainda precisa **opt-in** + consentimento `cycle_module`.

**Copy de finalidade (inclusiva — sem “perda de peso”)**  
Evitar: promessa de emagrecimento, “mulher de verdade”, modo homem/mulher.  
Usar: impacto em energia, recuperação, articulação, intensidade do treino e escolhas alimentares.

Texto-base aprovável:

> **Por que perguntamos**  
> Algumas rotinas de movimento e alimentação mudam quando existe ciclo menstrual ou gestação. Pedimos o sexo atribuído ao nascer em opções fechadas só para oferecer esse cuidado com mais clareza — sem assumir a sua identidade de gênero.  
> Independentemente da opção, você poderá dizer se deseja (ou não) adaptar treinos e refeições ao ciclo ou à gestação.

Opções da lista (label pt-BR → valor inglês no banco):

| Label (UI) | Valor (`sex_assigned_at_birth`) |
|---|---|
| Feminino | `female` |
| Masculino | `male` |
| Intersexo | `intersex` |
| Prefiro não informar | `prefer_not_to_say` |

Dado **sensível**, fora do perfil público e do círculo. Finalidade única: oferecer módulo de ciclo/gestação com segurança e respeito.

---

## 1. Product Manager

### Problema e para quem
Quem já consentiu e definiu apelido/foco precisa declarar corpo (lesões, mobilidade), comida, interesse em ciclo/gestação e preferências de hábitos (água, sono, pausa), para o motor filtrar conteúdo seguro e a home “Hoje” ter base.

### Pilares
Inclusão radical, segurança clínica, baixo custo alimentar, hábitos (água/sono/pausa), LGPD, santuário.

### Escopo do Sprint 2
**Entra**
- Passo sexo atribuído ao nascer (lista fechada + copy de finalidade).
- Condições clínicas / lesões (múltipla escolha) → `condition_tags`.
- Mobilidade / PCD → `capability_tags` (`standing`, `seated`, `lying`, …).
- Nutrição: `diet_pattern` + `avoids_tags`.
- Ciclo/gestação **opt-in** (todas as pessoas) + consent `cycle_module` + modo/fase/trimestre.
- Preferências: água, sono, pausa ativa (`user_habit_prefs` + migração sono).
- Marcar `onboarding_completed_at` ao concluir.
- Gate: `/home` e `/onboarding/clinical` passam a ser o fluxo real (não placeholder).

**Fora**
- Biblioteca de exercícios/refeições na UI (Sprints 3–4).
- Registro diário de sono/água na home (Sprint 5) — só **preferências** agora.
- Notificações push (Sprint 5).
- Dupla/grupo (Sprint 7).

### Aceite
1. Sem `health_personalization` aceito, actions clínicas/nutri recusam.
2. Sexo atribuído: só valores da lista; “prefiro não informar” permitido; não vai ao círculo.
3. Ciclo disponível para qualquer valor de sexo atribuído; nunca inferido só por `female`.
4. Cadeira / mobilidade reduzida → capacidades sem `standing` (salvo pergunta explícita futura).
5. Vegano/vegetariano e `avoids_tags` gravados corretamente.
6. Gestação exige trimestre; tags `pregnancy-trimester-n`.
7. Água, sono e pausa nas prefs; defaults ligados de forma gentil.
8. Ao final, `onboarding_completed_at` preenchido.
9. Zero emoji; sem “perda de peso” / culpa na copy de ciclo.

---

## 2. Educador Físico + Nutricionista

### Movimento — tags de onboarding → perfil
**Condições (condition_tags), múltipla escolha + “nenhuma”:**  
`torn-acl`, `hernia`/`disc-herniation`, `chondromalacia`, `hypertension`, `labyrinthitis`, PCD (ex. `spinal-cord-injury-paraplegia`), demais condições do catálogo em `lib/clinical/conditions-catalog.ts`, `wheelchair-user`, `reduced-mobility`  
(lista completa + grupos na UI de busca do onboarding clínico) 
(gestação entra pelo módulo ciclo, não por este checklist genérico.)

**Capacidades (capability_tags) derivadas:**
- Padrão (mobilidade plena): `standing`, `seated`, `lying`, `low-impact` (low-impact como aptidão a conteúdos sem impacto — Educador pode ajustar no implementar se preferir só standing/seated/lying).
- Se `wheelchair-user` ou `reduced-mobility`: `seated` (+ `unilateral` opcional); **não** incluir `standing` nem `lying` sem pergunta extra.
- “Nenhuma condição”: `condition_tags = {}`; capacidades = padrão pleno.

**Bloqueios já no seed (`tag_block_rules`):** LCA/condromalácia → high-impact / plyometrics; hérnia → axial-load; hipertensão → high-intensity; labirintite → spin/inversion; trimestre 3 → high-impact, plyometrics, prone.

### Ciclo / gestação
- Opt-in: `menstrual-cycle` | `pregnancy` | `postpartum` | pular.
- Gestação: trimestre 1|2|3 → condition/phase tags.
- Ciclo sem fase: `cycle-active` até informar fase.
- Sexo atribuído **não** cria sozinho `user_cycle_profiles`.

### Nutrição
- `diet_pattern`: `no-restriction` | `vegetarian` | `vegan`
- `avoids_tags`: `gluten`, `lactose`, `egg`, `peanut`, `soy`, `meat`, `fish` (só o que a pessoa declara evitar)
- Sem montar cardápio ainda — só perfil.

### Hábitos
- Água: `water_goal_ml` (default 2000 ou 35ml×peso se biometrics).
- Sono: prefs (`sleep_reminder_enabled`, opcional `sleep_target_bedtime`); sem diagnóstico.
- Pausa: `active_pause_enabled` default true, interval 90.

---

## 3. Especialista LGPD — **aprovado com restrição**

### Inventário novo
| Dado | Finalidade | Base | Onde | Público? |
|---|---|---|---|---|
| `sex_assigned_at_birth` | Oferecer cuidado de ciclo/gestação com clareza | Consentimento (personalização já aceita + copy de finalidade na tela) | Tabela sensível (ver Arquiteto) | Não |
| `condition_tags` / `capability_tags` | Filtrar exercício seguro | `health_personalization` | `user_clinical_conditions` | Não |
| Nutrição | Filtrar refeições | `health_personalization` | `user_nutrition_profiles` | Não |
| Ciclo/gestação | Adaptar intensidade/comida | `cycle_module` (novo evento) | `user_cycle_profiles` | Não |
| Prefs água/sono/pausa | Lembretes de hábito | Contrato / legítimo interesse leve | `user_habit_prefs` | Não (círculo só vê “cumpriu” depois) |

### Restrições
1. Sexo atribuído e ciclo **nunca** no `user_profiles` público nem no feed.
2. Não usar sexo atribuído como único critério de acesso ao módulo.
3. Revogar `cycle_module` → apagar ou desativar `user_cycle_profiles` (Sprint 6 detalha; no Sprint 2 gravar certo).
4. Minimização: não pedir fase menstrual detalhada se a pessoa só disse “não agora”.

### Parecer
Aprovado com restrição: lista fechada + finalidade explícita + opt-in de ciclo independente; proibido rotular como “gênero biológico” na UI.

---

## 4. Gerente de Tecnologia — ordem

1. Arquiteto/Backend — migração (`sex_assigned_at_birth`, sono em prefs/habits kinds).
2. Backend — Server Actions por passo + `completeOnboardingAction`.
3. Frontend — steps componentizados + rotas; reutilizar `ChoiceCard` / `ProgressSteps`.
4. UX Writer — strings (já rascunhadas abaixo).
5. QA — matriz sexo atribuído × ciclo opt-in × mobilidade × avoids.

Riscos: onboarding longo (mitigar uma pergunta por tela; salvar a cada passo); confusão gênero vs sexo (copy + duas telas distintas).

---

## 5. Arquiteto

### Migração
1. `user_clinical_conditions.sex_assigned_at_birth text null`  
   check: `female | male | intersex | prefer_not_to_say`  
   comment: sensitive; does not drive cycle alone.
2. `user_habit_prefs`:  
   - `sleep_reminder_enabled boolean not null default true`  
   - `sleep_target_bedtime time null`
3. Estender checks de `habit_logs.kind` e `care_events.kind` com `sleep` (mesmo sem UI de log neste sprint).
4. Opcional: purpose já tem `cycle_module` em `lgpd_consent_logs`.

### Estado do wizard (após Sprint 1 done)
Ordem sugerida de rotas:

| Passo UI | Rota | Progresso (de 6) |
|---|---|---|
| Sexo atribuído | `/onboarding/sex-assigned` | 4 |
| Clínico / mobilidade | `/onboarding/clinical` | 4–5 (mesma etapa visual ou split) |
| Nutrição | `/onboarding/nutrition` | 5 |
| Ciclo opt-in | `/onboarding/cycle` | 5–6 |
| Hábitos | `/onboarding/habits` | 6 |
| Fim | set `onboarding_completed_at` → `/home` | — |

Recomendação UX: **uma rota por decisão** = 4 telas novas + clinical split:
- `/onboarding/sex-assigned`
- `/onboarding/clinical` (condições)
- `/onboarding/mobility` (se loaded; ou combinar clinical+mobility em 2 telas)
- `/onboarding/nutrition`
- `/onboarding/cycle`
- `/onboarding/habits`

Para não estourar carga: clinical+mobility em **duas** telas; total progresso “Passo X de 8” **ou** manter “de 6” agrupando — **PM recomenda progresso `Passo X de 8`** com passos Sprint 1 = 1–3 e Sprint 2 = 4–8.

Atualizar `ONBOARDING_TOTAL_STEPS` e `resolveSprint1Step` → evoluir para `resolveOnboardingStep` global.

### Actions (nomes em inglês)
- `updateSexAssignedAction({ sexAssignedAtBirth })`
- `updateClinicalAction({ conditionTags, capabilityTags })` (ou separar mobility)
- `updateNutritionAction({ dietPattern, avoidsTags })`
- `updateCycleAction({ enabled, mode?, phaseTags?, trimester? })` + `recordConsent cycle_module`
- `updateHabitPrefsAction({ waterGoalMl, waterReminder, sleepReminder, sleepTargetBedtime?, activePause, activePauseInterval })`
- `completeOnboardingAction()` → `onboarding_completed_at = now()` após validar passos mínimos

Mínimo para completar: sex_assigned (incl. prefer_not_to_say), clinical row, nutrition row, habit prefs (defaults ok), cycle explicit skip ou filled, consents ok.

### RLS
Reusar policies dono; insert clinical/nutrition exige `health_personalization`; cycle exige `cycle_module` quando `enabled`.

---

## 6. Designer UX + UX Writer

### Fluxo mobile (uma decisão / tela)
1. Sexo atribuído — 4 ChoiceCards + texto “Por que perguntamos”.
2. Condições — chips/blocos; “Nenhuma” / “Prefiro não informar” (= tags vazias).
3. Mobilidade — plena vs cadeira vs mobilidade reduzida (deriva capabilities).
4. Nutrição — padrão + o que evitar.
5. Ciclo — “Deseja adaptar treino e alimentação ao ciclo menstrual ou à gestação?”  
   Não agora | Ciclo | Gestação | Pós-gestação.  
   Se gestação → trimestre. Se ciclo → fase opcional ou “não sei” (`cycle-active`).
6. Hábitos — água (meta editável), sono (lembrete sim/não), pausa (ligada, texto 5 min / 90 min).
7. Conclusão curta → home.

### Componentes
Reusar UI; novos blocos:
- `components/onboarding/sex-assigned-step.tsx`
- `components/onboarding/clinical-step.tsx`
- `components/onboarding/mobility-step.tsx`
- `components/onboarding/nutrition-step.tsx`
- `components/onboarding/cycle-step.tsx`
- `components/onboarding/habits-step.tsx`
- `lib/onboarding/capabilities.ts` (derivação pura, sem Next)
- `lib/i18n/onboarding-pt-br.ts` (estender)

### Copy — sexo atribuído
- **Título:** Sexo atribuído ao nascer  
- **Apoio (inclusivo):** Algumas rotinas de movimento e alimentação mudam quando existe ciclo menstrual ou gestação. Usamos opções fechadas só para oferecer esse cuidado com mais clareza, **sem assumir a sua identidade de gênero**. Na próxima etapa você escolhe se quer (ou não) adaptar treinos e refeições a isso.  
- **CTA:** Continuar  
- **Erro:** Escolha uma das opções para continuar.

### Copy — ciclo
- **Título:** Ciclo menstrual ou gestação  
- **Apoio:** Isso pode influenciar energia, recuperação e a intensidade segura do movimento, além de algumas escolhas alimentares. Vale para quem menstrua ou gesta — inclusive pessoas trans e intersexo.  
- **Opções:** Não agora | Acompanhar ciclo menstrual | Estou gestante | Pós-gestação  
- **Gestação:** Em qual trimestre você está?  
- Banidos: perda de peso, emagrecer, modo mulher, gênero biológico (na UI).

### Copy — hábitos
- Água / sono (“como foi o descanso?” só no Sprint 5) / pausa ativa sem culpa.

---

## 7. QA — casos que bloqueiam release

1. `male` + opt-in ciclo → cria `user_cycle_profiles` e consent.  
2. `female` + “Não agora” → **não** cria cycle profile.  
3. `prefer_not_to_say` ainda vê a tela de ciclo.  
4. `wheelchair-user` → sem capability `standing`.  
5. Avoids gluten → gravado; vegano → `diet_pattern = vegan`.  
6. Gestação sem trimestre → rejeita.  
7. Sexo atribuído / condições / ciclo invisíveis em query de perfil público.  
8. Completar onboarding seta `onboarding_completed_at`; `/home` deixa de redirecionar ao wizard.  
9. Sem `health_personalization` → actions clínicas falham.  
10. Copy: zero “gênero biológico”, zero “perda de peso”, zero emoji.

---

## Plano técnico numerado

| # | Dono | Artefato |
|---|---|---|
| 1 | Arquiteto/Backend | Migration sex_assigned + sleep prefs + sleep kind |
| 2 | Backend | Actions + complete onboarding |
| 3 | Frontend | Steps + rotas + progresso global |
| 4 | Lib | Derivação de capabilities + i18n |
| 5 | QA | Checklist Sprint 2 |

---

## Próximo comando

`/implementar` com base neste documento.

Se a pessoa product owner **insistir** em travar o módulo de ciclo só para `female`, isso **bloqueia** o parecer de inclusão/LGPD — não implementar essa trava sem nova decisão explícita documentada.
