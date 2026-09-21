# Sprint 7 — Cuidado coletivo (dupla primeiro)

Comando de origem: `/nova-feature`  
Status: **fechado (QA aprovado)** — ver `docs/features/sprint-07-qa-checklist.md`.  
Pré-existência: tabelas `care_circles` (`pair` | `group`), `care_circle_members`, `care_events` + RLS; RPC `join_care_circle(invite_code)`; trigger que adiciona criador como membro; `habit_logs` do dono (água, sono, pausa, workout/meal por item); placeholder `/circle`; perfil público (`display_name`); Sprint 6 Conta/LGPD fechada.

---

## 1. Product Manager

### Problema e para quem
A constância é mais leve em companhia, mas o app ainda é só individual. Quem concluiu o ritual do dia precisa de uma **dupla de cuidado**: convidar alguém por código, ver se a outra pessoa também registrou hábitos no dia — **sem** comparar corpo, sem clínico, sem ranking humilhante.

### Pilares
Cuidado coletivo (dias de cuidado); santuário (baixa carga); LGPD (zero vazamento clínico no feed); consistência (água, sono, pausa, mover, comer).

### Escopo do Sprint 7
**Entra**
- Aba **Círculo** (`/circle`) funcional para **dupla** (`care_circles.kind = pair`):
  - criar dupla (nome opcional/simples) → gera `invite_code`;
  - entrar com código (`join_care_circle`);
  - ver membros (só `display_name` público);
  - ver **feed do dia / últimos dias**: por pessoa, quais kinds de cuidado foram cumpridos (agregado), sem ml, sem qualidade de sono, sem nome de exercício/refeição;
  - sair da dupla (leave) se for membro; dissolver se for criador (ou regra documentada).
- Ao marcar hábitos próprios (água na meta, sono, pausa, ≥1 workout, ≥1 meal), **publicar** `care_events` nos círculos em que a pessoa é membro (upsert por `circle_id, user_id, day, kind`).
- Limite de **2 membros** em `pair` (bloqueio no join).
- Copy sem culpa se a outra pessoa “não registrou hoje”.
- Estados: sem círculo; aguardando par; dupla ativa; código inválido; dupla cheia; erro genérico.

**Fora**
- Grupo (`kind = group`) com N membros — **Sprint 8**.
- Chat, mural de fotos, comentários.
- Streak punitivo, ranking de quem “fez mais”, comparação de peso/shape.
- Mostrar ml de água, minutos/qualidade de sono, título de exercício/refeição, tags clínicas.
- Convite por e-mail/SMS/push remoto (só código copiável).
- Múltiplas duplas simultâneas (MVP: **no máximo uma** membership ativa por pessoa — simplifica UX).

### Aceite
1. Pessoa A cria dupla e vê código; B entra com o código e ambos veem um ao outro pelo nome público.
2. Terceira pessoa não entra em `pair` já com 2 membros.
3. Quando A atinge meta de água / registra sono / pausa / ≥1 mover / ≥1 comer no dia SP, aparece evento correspondente no feed da dupla (só kind + day + quem).
4. B **não** vê clínica, nutrição, biometria, prefs nem detalhes de `habit_logs` de A.
5. Sem círculo: empty state acolhedor + CTAs criar/entrar.
6. Sair/dissolver remove membership (e eventos órfãos conforme cascade/regras).
7. Zero emoji; sem culpa; sem ranking corporal.
8. RLS: não-membro não lê `care_events` nem membros do círculo.
9. Uma pessoa não participa de duas duplas ao mesmo tempo (MVP).
10. Nav Círculo deixa de ser placeholder.

---

## 2. Educador Físico

### Regras
1. Feed coletivo **não** lista exercícios; só o fato “movimento registrado” (`workout`).
2. Pausa ativa no feed = `active-pause` cumprida no dia; sem card de movimento no Círculo.
3. Sem pressão para treinar junto ou “não falhar”.

### QA clínico
- Nenhuma tag clínica ou contraindicação no payload do círculo.

---

## 3. Nutricionista

### Regras
1. Feed mostra só `meal` (refeição do dia marcada), sem prato, ingredientes ou restrições.
2. Sem gamificar “comeu melhor”.

### QA nutricional
- Zero `contains_tags` / `diet_pattern` no círculo.

---

## 4. Especialista LGPD — **aprovado com restrição**

### Inventário
| Dado | Classificação | Finalidade | Onde |
|---|---|---|---|
| `display_name` | Público | Identificar no círculo | `user_profiles` |
| `invite_code` | Operacional | Entrar na dupla | `care_circles` |
| `care_events` (kind + day + user) | Hábito agregado (não clínico) | Constância compartilhada | só membros |
| `habit_logs` detalhe | Hábito dono | Ritual individual | **nunca** no círculo |

### Consentimento
- Entrar na dupla é ato consciente (código); não exige novo purpose se o aceite de termos cobrir uso do app — **texto claro** na UI: “a outra pessoa verá se você registrou água, descanso, pausa, movimento ou refeição no dia — sem detalhes de saúde”.
- Opcional stretch: purpose `care_circle_sharing` — **só se** LGPD na implementação julgar necessário; senão copy + termos bastam no MVP.

### Restrições
1. Proibido expor ml, sono quality/minutos, `content_id`, tags clínicas.
2. `invite_code` não em analytics com user_id clínico.
3. Leave/dissolver deve impedir leitura posterior (RLS por membership).
4. Export Conta (Sprint 6) pode incluir memberships/eventos próprios; não exporta clínico do par.

### Parecer
**Aprovado com restrição:** dupla + eventos agregados. Bloqueado: feed clínico, chat de saúde, admin lendo círculos de quem usa.

---

## 5. Gerente de Tecnologia — plano numerado

| # | Tarefa | Dono | Artefato | Depende de |
|---|---|---|---|---|
| 1 | Regras pair (máx 2), uma membership, sleep em `care_events` se faltar | Arquiteto | nota + migration mínima | — |
| 2 | Endurecer `join_care_circle` (pair cheio, já membro de outro) | Backend | SQL RPC | 1 |
| 3 | Helper: publicar `care_events` a partir de hábitos do dia | Backend | `lib/care/*` + hooks nas actions | 1 |
| 4 | Server Actions: createPair, join, leave, getCircleSnapshot, listRecentCareDays | Backend | `app/actions/care-circle.ts` | 2–3 |
| 5 | UI `/circle` | Frontend + UX | `components/circle/*` | 4 |
| 6 | Copy pt-BR | UX Writer | `lib/i18n/circle-pt-br.ts` | 5 |
| 7 | Disparo de eventos ao logar água/sono/pausa/content done | Backend | ajustar `habits.ts` / `safe-content.ts` | 3 |
| 8 | QA checklist + smoke (join limits, leak test) | QA | `docs/features/sprint-07-qa-checklist.md` | 4–7 |
| 9 | Roadmap | GT | este arquivo + roadmap | 8 |

**Ordem:** schema/RPC → publisher de eventos → actions → UI → wire hábitos → QA.

**Riscos:** pair com 3 membros por race no join; evento publicado com detalhe demais; timezone do `day` desalinhado (usar America/Sao_Paulo); pessoa em dois círculos.

**Agentes:** PM, LGPD (central), Arquiteto, Backend, Frontend, UX Writer, Educador/Nutri (revisão de vazamento), QA. Sem tags clínicas novas.

---

## 6. Arquiteto

### Fronteira
- **Público no círculo:** `display_name`; eventos `kind` + `day` + `user_id`.
- **Sensível:** permanece só no dono (`habit_logs`, clínica, etc.).
- **Conteúdo biblioteca:** fora do círculo.

### Schema (mínimo)
1. Garantir `care_events.kind` inclui `sleep` (já previsto no Sprint 2; verificar migration).
2. RPC `join_care_circle`: se `kind = pair` e `count(members) >= 2` → erro; se user já em outro círculo ativo → erro (MVP uma membership).
3. Opcional: `create_care_pair(name text)` security definer ou insert RLS + trigger existente.
4. Leave: `delete` membership própria; se último membro ou criador, `delete` circle (cascade events).
5. Índices já existem em members; índice `care_events (circle_id, day desc)` se faltar.

### Publicação de eventos (contrato)
Mapa hábito → evento (mesmo `day` SP):
| Condição no dono | `care_events.kind` |
|---|---|
| água `value >= water_goal_ml` | `water` |
| existe `sleep` | `sleep` |
| existe `active-pause` | `active-pause` |
| ≥1 `workout` (com ou sem content_id) | `workout` |
| ≥1 `meal` | `meal` |

Remover evento do dia se a condição deixar de ser verdadeira (ex.: desmarcou último treino; água abaixo da meta).

### Contratos (Server Actions)
```
getMyCareCircleAction() -> null | {
  circleId, kind: 'pair', name, inviteCode, members: [{ userId, displayName }],
  isCreator
}

createPairAction({ name? }) -> { inviteCode }
joinPairAction({ inviteCode }) -> ok
leavePairAction() -> ok

listCareFeedAction({ days?: number }) -> {
  days: [{ day, entries: [{ userId, displayName, kinds: HabitKind[] }] }]
}
```

Erros: `unauthenticated`, `invalid_invite`, `pair_full`, `already_in_circle`, `save_failed`.

### RLS
Manter políticas existentes; não abrir select de `user_*` sensível a mates. Feed faz join só em `user_profiles.display_name` via query do dono autenticado membro.

---

## 7. Designer UX + UX Writer

### Fluxo
1. Sem dupla → “Cuidar em par” + Criar / Entrar com código.
2. Criou → mostrar código + copiar + “aguardando alguém”.
3. Dupla completa → lista dos dois nomes + “cuidar de hoje” (kinds do dia) + histórico curto (7 dias).
4. Menu: sair da dupla (confirmação).

### Visual
Santuário; uma decisão por bloco; feed como lista calma, não leaderboard; ausência sem vermelho punitivo.

### Copy (pt-BR)
| Chave | Texto |
|---|---|
| Título | Círculo |
| Apoio | Constância em companhia, sem comparar corpo. |
| Criar | Criar dupla |
| Entrar | Entrar com código |
| Código | Código do convite |
| Copiar | Copiar código |
| Aguardando | Compartilhe o código. Quando a outra pessoa entrar, o cuidado do dia aparece aqui. |
| Aviso privacidade | Quem está na dupla vê se você registrou água, descanso, pausa, movimento ou refeição — sem detalhes de saúde. |
| Hoje | Cuidado de hoje |
| kinds | Água / Descanso / Pausa / Movimento / Refeição |
| Vazio dia | Ainda sem registros neste dia. |
| Sair | Sair da dupla |
| Cheia | Esta dupla já está completa. |
| Inválido | Código não encontrado. |

Banidos: “seu par falhou”, “streak quebrado”, “quem treinou mais”, emoji, peso.

---

## 8. DevOps
1. Sem secret novo.
2. Sem cache SW de feed do círculo (já network-only para rotas de app).
3. Logs de RPC sem código de convite + user clínico juntos.

---

## 9. QA

### Riscos
1. Vazamento clínico no feed ou no export cruzado.
2. 3ª pessoa entra no pair.
3. Evento com ml ou `content_id`.
4. Day timezone divergente.
5. Membership dupla (dois círculos).

### Casos
| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | A sem círculo | criar pair | código; A membro |
| 2 | código A | B join | 2 membros; feed |
| 3 | pair cheio | C join | `pair_full` |
| 4 | A marca 2 treinos | feed | um `workout` no dia |
| 5 | A água 500/2000 | feed | sem `water` |
| 6 | A água ≥ meta | feed | `water` |
| 7 | B | select clínico A | vazio |
| 8 | B sai | A | membership B sumiu |
| 9 | copy | varrer | zero culpa/emoji |

### Critério de pronto
Aceite 1–10 verde; checklist QA aprovado; roadmap Sprint 7 → fechada.

---

## Próximo comando

**Sugerido:** `/nova-feature` Sprint 8 (grupo + auditorias + conteúdo mínimo de lançamento).
