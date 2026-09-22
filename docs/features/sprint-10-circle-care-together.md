# Sprint 10 — Círculo com motivo: combinado, progresso em companhia e “hoje não consigo”

Comando de origem: `/nova-feature`  
Status: **fechada (MVP finalizado 2026-09-22)** — ver `docs/mvp-finalizado.md` e `docs/features/sprint-10-qa-checklist.md`.  
Pré-existência: Sprint 7–8 círculo (pair/group), `care_events` agregados, sync a partir de `habit_logs`; Sprint 9 plano do dia/progresso.

---

## 1. Product Manager

### Problema e para quem
O círculo já existe, mas **não há vantagem** em treinar em dupla ou grupo: o feed só espelha kinds do dia. Quem cuidaria em companhia não encontra motivo de abrir o app pelo coletivo. Pessoas com fadiga, dor, neurodivergência ou dia difícil precisam de um caminho **sem culpa** que ainda conte como presença no círculo.

### Pilares
Cuidado coletivo (gamificação de constância); inclusão radical; santuário digital; LGPD (mesmo contrato de privacidade do feed).

### Escopo do MVP (Sprint 10)

**Entra**

1. **Combinado semanal do círculo**  
   - Meta coletiva editável: **3 / 5 / 7** “dias de cuidado em companhia” por semana (semana calendário America/Sao_Paulo, segunda–domingo).  
   - Default ao criar círculo (e para círculos já existentes): **3**.  
   - Qualquer membro pode ajustar (uma decisão compartilhada; último save vale).

2. **Progresso coletivo** (não ranking)  
   - Contagem da semana: quantos dias o círculo já “fechou” o combinado.  
   - Visível em `/circle` (destaque principal) e no cartão de Hoje (resumo curto + CTA abrir círculo).  
   - Lista de membros **sem ordenar por desempenho** (alfabética ou ordem de entrada).

3. **Definição de “dia de cuidado” (indivíduo)**  
   Conta o dia individual se, no dia SP, a pessoa tiver **pelo menos um** de:  
   - `water` (meta atingida), `sleep`, `active-pause`, `workout` (inclui cardio agregado), `meal`, **ou**  
   - **`rest-day`** (“hoje não consigo”).

4. **Definição de “dia em companhia” (círculo)**  
   - **Dupla:** as **duas** pessoas têm dia de cuidado no mesmo `day`.  
   - **Grupo:** **≥ metade** dos membros atuais (arredondar para baixo, mínimo 2 se o grupo tiver ≥2; se só 1 membro, não fecha “em companhia” até haver par).

5. **“Hoje não consigo” (`rest-day`)** — kind neutro  
   - Ação explícita em Hoje (e espelho no Círculo opcional).  
   - Publica `habit_logs.kind = rest-day` + `care_events.kind = rest-day` (agregado, sem motivo clínico).  
   - Conta para o combinado (presença inclusiva).  
   - **Não** reduz intensidade do motor nesta sprint (sem mudar tags clínicas).  
   - Copy sem culpa; pode coexistir com outros hábitos do dia (não apaga água/sono já registrados).  
   - Pode desmarcar no mesmo dia (remove log + evento).

6. **Toque de carinho (nudge)**  
   - 1 envio por remetente → destinatário → dia.  
   - Payload: só `from_user_id`, `to_user_id`, `circle_id`, `day` (sem texto livre).  
   - Destinatário vê “Nome enviou um carinho” no Círculo / badge discreto em Hoje.

**Fora**

- Chat, stories, fotos, comentários longos, reações múltiplas.  
- Ranking, streak punitivo, “quem fez mais kinds”, comparativo de volume.  
- Múltiplos círculos por pessoa.  
- Push remoto / WhatsApp deep link (pode ser stretch DevOps depois).  
- Ritual sincronizado de pausa em par (Sprint seguinte).  
- `rest-day` alterando automaticamente o packer clínico ou bloqueando treinos.  
- Motivo textual do descanso (pode reidentificar saúde).

### Aceite

1. Combinado 3/5/7 editável; default 3; visível a todos os membros.  
2. Progresso semanal correto em pair e group conforme regras acima (timezone SP).  
3. Home mostra resumo do progresso coletivo sem dado clínico.  
4. Marcar/desmarcar `rest-day` no dia atual; aparece no feed do círculo como kind neutro; conta no combinado.  
5. Toque: limite 1/dia/par; sem texto; sem vazamento fora do círculo.  
6. Ausência sem `rest-day`: copy neutra, sem vermelho de falha.  
7. RLS: não-membro não lê combinado/nudge/eventos; feed continua sem ml, sem título de exercício/refeição, sem clínico.  
8. Zero emoji; linguagem inclusiva; sem ranking corporal.  
9. Exportação LGPD inclui novos campos do dono (nudge enviado/recebido, rest-day nos logs).  
10. Plano do dia com exercício incompatível já tratado em S9 não regressa.

---

## 2. Educador Físico

### Movimento e descanso

1. `rest-day` **não é dado clínico** e **não** implica lesão, gestação ou contraindicação.  
2. Nesta sprint: marcar `rest-day` **não** altera `list_safe_exercises` nem o packer. Quem quiser mover no mesmo dia ainda vê conteúdo seguro.  
3. Proibido: copy que trate descanso como “falha de treino” ou que incentive treinar com dor.  
4. Feed do círculo continua sem listar exercício — só kinds agregados (incl. `rest-day`).

### QA clínico (regressão)

- Perfis com lesão/gestação: motor inalterado ao marcar `rest-day`.  
- Nenhum falso seguro introduzido por esta sprint.

---

## 3. Nutricionista

Sem mudança de motor alimentar. `rest-day` não toca `list_safe_meals` nem dislikes. Regressão: feed sem título de refeição.

---

## 4. Especialista LGPD

### Inventário

| Dado | Classificação | Finalidade | Base | Tabela | Retenção |
|---|---|---|---|---|---|
| `care_circles.weekly_care_goal` (3/5/7) | Operacional do círculo (não clínico) | Combinado coletivo | Execução do serviço / termos | `care_circles` | Enquanto o círculo existir |
| Progresso derivado (contagem) | Calculado, não armazenar sensível | UX coletiva | Idem | Derivado de `care_events` | Ephemeral / cache proibido em SW |
| `habit_logs` / `care_events` `rest-day` | Hábito agregado (não clínico) | Presença inclusiva no círculo | Contrato + transparência já no Círculo | `habit_logs`, `care_events` | Dono / cascade círculo |
| `care_nudges` (from, to, day) | Público-de-círculo mínimo | Apoio leve entre membros | Execução + expectativa razoável (copy clara) | `care_nudges` | Cascade com círculo; apagar com conta |

### Público vs sensível

- **Pode ir ao círculo:** `display_name`; kinds do dia incluindo `rest-day`; que houve nudge; progresso do combinado.  
- **Não pode:** motivo do descanso, tags clínicas, ml, qualidade de sono, título de treino/refeição, texto livre no nudge.

### Consentimento

- Sem novo `purpose` obrigatório se Termos + copy do Círculo já cobrirem compartilhamento de kinds do dia — **atualizar copy** para incluir “hoje não consigo” e “carinho”.  
- Stretch: purpose `care_circle_sharing` só se implementação LGPD julgar necessário após revisão; default do plano = **copy + termos**, sem gate novo.

### RLS / reidentificação

- `care_nudges`: select só `is_circle_member`; insert só `from_user_id = auth.uid()` e ambos membros; sem update alheio; delete próprio ou cascade.  
- Grupo ≤8: `rest-day` é sinal de baixa energia — aceitável no contrato atual; **proibido** analytics externo desse kind.

### Direitos

- Sair do círculo: deixa de ver feed/nudge/combinado.  
- Exclusão de conta: apaga `habit_logs`, membership, nudges do user.  
- Export: incluir `rest-day` e nudges do user.

### Parecer

**Aprovado com restrição:** combinado + progress + `rest-day` + nudge sem texto.  
**Bloqueado:** motivo textual do descanso; ranking; expor `rest-day` fora do círculo; admin lendo círculos de quem usa.

---

## 5. Gerente de Tecnologia

### Resumo
Dar **motivo de uso** ao círculo: combinado semanal, progresso em companhia, presença inclusiva (`rest-day`) e toque de carinho — sem IA e sem dado clínico no feed.

### Agentes
PM (aceite); Educador (rest-day neutro); LGPD (nudge/rest-day); Arquiteto (schema/RLS); Backend; Frontend; UX Writer; Designer UX; QA; DevOps (migration).

### Tarefas

| # | Tarefa | Dono | Artefato | Depende |
|---|---|---|---|---|
| 1 | Migration: `weekly_care_goal`, kind `rest-day`, tabela `care_nudges`, constraints | Arquiteto + Backend | `supabase/migrations/YYYYMMDDHHMMSS_sprint10_circle_care_together.sql` | — |
| 2 | Libs: semana SP, dia de cuidado, dia em companhia, progresso | Backend | `lib/care/week.ts`, estender `lib/care/kinds.ts` | 1 |
| 3 | Sync care_events: incluir `rest-day`; não publicar detalhe | Backend | `lib/care/publish.ts` | 1–2 |
| 4 | Actions: get progresso, set combinado, mark/unmark rest-day, send nudge | Backend | `app/actions/care-circle.ts`, `habits`/`home` | 2–3 |
| 5 | UI Círculo: progresso + combinado + rest-day label + nudge | Frontend | `components/circle/*` | 4 |
| 6 | UI Hoje: cartão coletivo + CTA “hoje não consigo” | Frontend | home / habits cards | 4 |
| 7 | Copy pt-BR | UX Writer | `circle-pt-br.ts`, `habits-pt-br.ts` | 5–6 |
| 8 | Export/revogação/i18n admin se aplicável | Backend + LGPD | `lib/account/export.ts` | 1 |
| 9 | QA checklist + smoke | QA | `docs/features/sprint-10-qa-checklist.md` | 5–8 |

### Ordem
Schema/RLS → kinds/sync → actions → UI Círculo → UI Hoje → copy → export → QA.

### Riscos
Timezone de semana; race no nudge unique; `rest-day` confundido com dado clínico na copy; regressão sync de care_events; carga cognitiva no Círculo.

### Próximo passo
`/implementar` com este doc como fonte da verdade.

---

## 6. Arquiteto

### Fronteira
- **Público de círculo:** members, `care_events.kind` (agora + `rest-day`), `weekly_care_goal`, nudges sem texto.  
- **Sensível:** inalterado (`user_*` clínicos).  
- **Hábito do dono:** `habit_logs` com `rest-day` (só dono lê detalhe; círculo só via `care_events`).

### Schema (proposta)

```text
care_circles
  + weekly_care_goal smallint not null default 3
    check (weekly_care_goal in (3, 5, 7))

habit_logs.kind  += 'rest-day'
care_events.kind += 'rest-day'

care_nudges (
  id uuid pk,
  circle_id uuid fk care_circles on delete cascade,
  from_user_id uuid not null,
  to_user_id uuid not null,
  day date not null,  -- America/Sao_Paulo logical day
  created_at timestamptz default now(),
  unique (circle_id, from_user_id, to_user_id, day),
  check (from_user_id <> to_user_id)
)
```

Índices: `care_nudges (circle_id, day desc)`; `(to_user_id, day)`.

### RLS (`care_nudges`)
- SELECT: `authenticated` + membro do `circle_id`.  
- INSERT: `from_user_id = auth.uid()` + ambos membros do círculo.  
- DELETE: remetente (`from_user_id = auth.uid()`) ou políticas de cascade já cobrem exclusão de conta.  
- Sem UPDATE (imutável).  
- Sem `FOR ALL`.

`weekly_care_goal`: UPDATE só se `is_circle_member`; SELECT membro.

### Contratos (Server Actions)

```text
getCircleCareProgressAction() -> {
  weeklyCareGoal: 3|5|7,
  weekStart, weekEnd,
  daysTogetherCount,
  dayStatuses: [{ day, closedTogether, membersWithCare: [{ userId, displayName, kinds, hasRestDay }] }]
}

updateCircleWeeklyGoalAction({ goal: 3|5|7 }) -> ok | errors

markRestDayAction() / unmarkRestDayAction() -> ok
  // upsert/delete habit_logs rest-day today SP; sync care_events

sendCareNudgeAction({ toUserId }) -> ok | already_sent | not_mate | errors
listCareNudgesTodayAction() -> [{ fromUserId, fromDisplayName, toUserId }]
```

Erros: `unauthenticated`, `not_in_circle`, `invalid_goal`, `already_sent`, `not_mate`, `save_failed`.

### Impacto
Backend sync + Frontend; DevOps migration; Gerar tipos se o projeto usar generated types (hoje tipagem local).

### Riscos
Constraint antiga de `care_events_kind_check` / `habit_logs_kind_check` esquecida; unique nudge com timezone errado; calcular “metade” com membros que saíram no meio da semana (usar membership **atual** só para o dia corrente; histórico: quem tinha evento naquele day).

---

## 7. Designer UX

### Intenção
Uma pergunta por visita ao Círculo: **“como está nosso cuidado juntos?”** Sem leaderboard.

### Fluxo

1. **Círculo (ativa)**  
   - Topo: progresso da semana (texto + barra/anel tonal).  
   - Ação secundária: “Ajustar combinado” (sheet 3/5/7).  
   - Hoje: membros com kinds (incl. “Descanso”) + botão carinho por pessoa (não eu).  
   - Histórico enxuto (já existe).  
   - Sair (já existe).

2. **Hoje**  
   - Cartão coletivo: “2 de 3 dias em companhia esta semana” / empty acolhedor.  
   - CTA primário do ritual individual inalterado.  
   - CTA terciário: “Hoje não consigo” (confirmação curta).  
   - Badge se recebeu carinho hoje.

3. **Empty / waiting**  
   - Acrescentar linha de valor do combinado (sem alongar demais).

### Tokens
Mint = juntos; Blush = carinho; sem borda `1px solid`; sem medalha/posição.

### Estados
Sem círculo; aguardando; dia aberto; dia em companhia; combinado batido na semana (celebração única, reduced-motion); rest-day marcado; nudge enviado/recebido; erro.

### Acessibilidade
Progresso com número em texto; toque nomeado; confirmação de rest-day sem double-tap acidental; área ≥44px.

### Notas Frontend
Reusar `Surface`, `InlineAlert`, `Button`; não criar chat UI.

---

## 8. UX Writer

### Termos aprovados
Combinado; dias de cuidado em companhia; hoje não consigo; descanso; carinho; círculo; dupla; grupo.

### Termos banidos
Desafio; venceu; ranking; streak quebrado; desculpa; falhou; preguiça; modo fácil; compare com.

### Strings (esboço — Writer fecha no implementar)

| Chave | Texto |
|---|---|
| progressTitle | Cuidado em companhia |
| progressSupport | (n) de (goal) dias juntos nesta semana |
| goalLegend | Combinado da semana |
| goalHint | Conta o dia quando cada pessoa (ou a metade do grupo) registra ao menos um cuidado — inclusive “hoje não consigo”. |
| restDayCta | Hoje não consigo |
| restDayConfirm | Registrar descanso hoje? Isso conta como presença no círculo, sem detalhes de saúde. |
| restDayDone | Descanso registrado hoje |
| restDayUndo | Remover registro de descanso |
| kind rest-day | Descanso |
| nudgeSend | Enviar carinho |
| nudgeSent | Carinho enviado |
| nudgeReceived | (Nome) enviou um carinho |
| privacyUpdate | …inclui se registrou descanso (“hoje não consigo”) e carinhos do dia — sem detalhes de saúde. |
| emptyValue | Juntas, o app acompanha a constância — sem comparar corpo. |

---

## 9. QA

### Riscos a matar
Vazamento clínico; ranking acidental; `rest-day` sem sync; semana errada (UTC vs SP); nudge cross-círculo; pair/group regra de “juntos” errada; culpa na copy.

### Casos (bloqueiam release)

| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | Pair A+B | Ambos water no mesmo day | Dia conta em companhia |
| 2 | Pair | Só A marca hábitos | Dia **não** fecha juntos |
| 3 | Pair | A marca `rest-day`, B marca sleep | Dia fecha juntos |
| 4 | Group 4 | 2 de 4 com cuidado | Fecha (metade) |
| 5 | Group 5 | 2 de 5 | **Não** fecha (metade de 5 = 2? → floor(5/2)=2 → fecha). Documentar: `ceil` vs `floor`. **Regra fixa: `Math.floor(n/2)`, mín. 2 se n≥2.** Para n=5, floor=2 → fecha com 2. |
| 6 | Membro | nudge 2× mesmo destino/dia | 2º → `already_sent` |
| 7 | Não membro | SELECT nudges | vazio / RLS deny |
| 8 | A | rest-day | Feed B vê kind descanso, sem motivo |
| 9 | Copy | UI | Zero emoji; sem “falhou” |
| 10 | Export | Conta | Contém rest-day e nudges do user |
| 11 | Motor | rest-day + torn-acl | list_safe inalterado |

### Automatizável
Libs de semana/progresso (unit); constraint SQL; deriveCareEventKinds + rest-day.

### Manual
UI Hoje/Círculo; acessibilidade toque; PWA sem cache de `/circle`.

### Pronto
Aceite PM 1–10 verdes; parecer LGPD sem bloqueio aberto; checklist sprint-10 fechado.

---

## 10. DevOps

- Migration em `supabase/migrations/` com RLS e comments.  
- Sem secrets novos.  
- SW: manter network-only para `/circle` e hábitos (sem cache de progresso).

---

## Próximo comando

Plano coerente com produto aprovado.

**Sugestão (histórico):** implementação concluída com o MVP. Novas ideias de círculo → pós-MVP no roadmap.

Ordem de execução no implementar: migration → `lib/care/*` → sync → actions → UI Círculo → UI Hoje → copy → export → QA smoke.
