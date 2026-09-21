# Sprint 5 — Hoje + hábitos (água, sono, pausa)

Comando de origem: `/nova-feature`  
Status: **fechado (QA aprovado)** — ver `docs/features/sprint-05-qa-checklist.md`.  
Pré-existência: `user_habit_prefs` (água, pausa, `sleep_reminder_enabled`, `sleep_target_bedtime`), `habit_logs.kind` já inclui `water` | `active-pause` | `workout` | `meal` | `sleep`, onboarding de hábitos, placeholders `/home` e `/habits`, Mover/Comer com marcar feito (Sprint 4), exercícios com `active-pause`.

---

## 1. Product Manager

### Problema e para quem
A pessoa concluiu o cadastro e já vê movimento/refeição seguros, mas a **home ainda não é o ritual do dia**. Sem registrar água, sono e pausa ativa com leveza, o pilar de consistência não vira prática. Quem usa o app precisa de uma tela **Hoje** que mostre o cuidado do dia e permita marcar hábitos sem culpa nem ranking.

### Pilares
Consistência e prevenção (água, sono, pausa); santuário (baixa carga cognitiva); inclusão (pausa sentada / list_safe); LGPD (opt-in de lembretes; hábito ≠ diagnóstico).

### Escopo do Sprint 5
**Entra**
- Tela **Hoje** (`/home`): resumo do dia com estados de água, sono, pausa ativa, mover, comer.
- Registrar **água**: somar ml até a meta (`water_goal_ml`); botões rápidos (ex.: +200 / +300 / +500) + total do dia.
- Registrar **sono**: qualidade `poor` | `ok` | `good` e/ou duração em minutos; linguagem “como foi o descanso?”.
- Registrar **pausa ativa**: marcar feito no dia; atalho para 1–N exercícios `active-pause` via `list_safe_exercises` (já filtrados).
- Preferências de hábito editáveis (meta de água, lembretes água/sono/pausa ligados, intervalo de pausa, horário alvo de sono opcional) — em `/habits` ou seção em Hoje/Conta.
- **Lembretes com opt-in**: consentimento explícito + permissão do navegador; lembretes locais (PWA/service worker) para água e pausa conforme prefs. Push remoto completo (VAPID + servidor) só se couber no tempo — senão local + doc para Sprint 6.
- Nav: label **Hoje** (rota `/home` permanece).
- Estados: vazio (sem prefs), parcial, concluído suave, erro genérico.

**Fora**
- Conta LGPD (exportar/excluir/revogar) — Sprint 6.
- Manifest/instalação PWA completa — Sprint 6 (neste sprint: só notificação/opt-in necessário).
- Círculo / `care_events` no feed — Sprint 7 (logs ficam só no dono).
- Wearables, score médico de sono, apneia, polissonografia.
- Streak punitivo, ranking, “você falhou ontem”.
- IA gerando plano de hidratação ou horário “ideal” clínico.
- Correlacionar sono × treino automaticamente.

### Aceite
1. `/home` mostra o ritual do dia com os 5 eixos (água, sono, pausa, mover, comer) com status do `day` UTC (ou timezone documentado — preferir **America/Sao_Paulo** no app se já houver padrão; senão UTC consistente com Sprint 4 e documentar).
2. Água: `habit_logs.kind = water`, `value` = ml acumulados do dia (upsert); UI respeita `water_goal_ml`.
3. Sono: `habit_logs.kind = sleep`; qualidade e/ou minutos sem tom diagnóstico.
4. Pausa: `habit_logs.kind = active-pause`; não sugere movimento inseguro (só lista segura).
5. Mover/Comer no resumo refletem logs já existentes (`workout` / `meal`) com link para as abas.
6. Preferências só o dono lê/altera (RLS).
7. Lembretes: sem opt-in + permissão → nenhum popup; com opt-in → lembretes conforme prefs; texto informativo (não persuasivo).
8. Zero emoji; sem culpa; sem “meta de emagrecer”.
9. Pessoa B não lê habit_logs nem prefs de A.
10. Offline: não exigir; se SW existir, **não** cachear payloads de hábito/saúde.

---

## 2. Educador Físico — pausa ativa

### Regras
1. Pausa ativa = **5 minutos a cada ~90 minutos** (prefs: `active_pause_interval_minutes`, default 90).
2. Conteúdo: exercícios publicados com `intensity_tags` contendo `active-pause`, já filtrados por `list_safe_exercises`.
3. UI não inventa série; mostra 1–3 cards seguros + “Marquei a pausa”.
4. Sentado/PCD: se o perfil só tem `seated`, a lista segura já exclui o que exige `standing`.
5. Sem gamificar intensidade da pausa.

### QA clínico
- Perfil torn-acl / seated-only na pausa: nada de impacto/plyo.

---

## 3. Nutricionista — hidratação

### Regras
1. Água é hábito cotidiano, não “detox”.
2. Meta default 2000 ml (já no schema); faixa 250–8000 ml (constraint existente).
3. Não calcular necessidade por peso/IMC nesta tela (biometria fora).
4. Copy: “como está a água de hoje?”, nunca “você bebeu pouco”.

---

## 4. Especialista LGPD — **aprovado com restrição**

### Inventário
| Dado | Classificação | Finalidade | Onde |
|---|---|---|---|
| `habit_logs` água/sono/pausa | Hábito (não diagnóstico) | Consistência do dia | Só dono |
| Qualidade/duração de sono | Hábito subjetivo | Ritual; **não** prontuário | Só dono |
| `user_habit_prefs` | Preferência | Metas e lembretes | Só dono |
| Opt-in lembretes + Notification permission | Consentimento | Disparar lembretes | `lgpd_consent_logs` + prefs |

### Consentimento
- Novo purpose sugerido: `habit_reminders` (accepted true/false auditável).
- Sem purpose aceito → não pedir `Notification.requestPermission` de forma automática agressiva; só após CTA consciente.
- Sono: deixar claro que **não é avaliação clínica**.

### Restrições
1. Não colocar ml/qualidade de sono em URL, analytics ou feed.
2. Service worker: sem persistir payload de saúde em cache.
3. Push remoto (se feito): endpoint de subscription sem misturar clínica.

### Parecer
**Aprovado com restrição:** ritual + logs do dono + opt-in de lembretes. Bloqueado: score médico de sono, envio de hábitos a terceiros, notificação com texto clínico.

---

## 5. Gerente de Tecnologia — plano numerado

| # | Tarefa | Dono | Artefato | Depende de |
|---|---|---|---|---|
| 1 | Confirmar modelo sono no log (value vs JSON) e purpose `habit_reminders` | Arquiteto + LGPD | nota no doc / migration mínima | — |
| 2 | Migration: purpose consent + opcional tabela `push_subscriptions` **ou** só prefs locais | Backend | SQL | 1 |
| 3 | Domain helpers: dia local, soma água, parse sono, labels | Backend | `lib/habits/*` | 1 |
| 4 | Server Actions: getTodayRitual, logWater, logSleep, logActivePause, updateHabitPrefs | Backend | `app/actions/habits.ts` | 2–3 |
| 5 | UI Hoje: cards ritual + ações rápidas | Frontend + UX | `app/(app)/home`, `components/habits/*` | 4 |
| 6 | UI Hábitos: editar prefs | Frontend | `/habits` | 4 |
| 7 | Atalho pausa → lista segura active-pause | Frontend + Educador | bloco em Hoje | 4 |
| 8 | Opt-in lembretes + SW/Notification local | Frontend + DevOps | `public/sw.js` (mínimo), consent UI | 2,5 |
| 9 | Copy pt-BR | UX Writer | `lib/i18n/habits-pt-br.ts` | 5–8 |
| 10 | QA checklist + smoke | QA | `docs/features/sprint-05-qa-checklist.md` | 4–9 |
| 11 | Roadmap status | GT | este arquivo + roadmap | 10 |

**Ordem:** contrato/schema → actions → UI Hoje → prefs → lembretes → QA.

**Riscos:** timezone do “dia”; Notification API inconsistente no iOS Safari; push remoto estoura escopo — mitigar com lembretes locais primeiro.

**Agentes:** PM, Educador, Nutri (água), LGPD, Arquiteto, Backend, Frontend, UX, UX Writer, DevOps (SW), QA.

---

## 6. Arquiteto

### Fronteira
- **Hábito (dono):** `habit_logs`, `user_habit_prefs`.
- **Consentimento:** `lgpd_consent_logs` purpose `habit_reminders`.
- **Conteúdo (pausa):** `list_safe_exercises` (já existe).
- Sem novo dado clínico.

### Schema (mínimo)
1. Garantir `habit_logs.kind` inclui `sleep` (já na Sprint 2).
2. **Decisão de armazenamento de sono:**  
   - Opção A (preferida MVP): `value` = minutos (nullable); qualidade em coluna nova `sleep_quality text null check (poor|ok|good)` **ou**  
   - Opção B: `value` null e `metadata jsonb` — **evitar jsonb se não existir**.  
   - **Recomendação:** adicionar `sleep_quality text null` + usar `value` para minutos quando kind=`sleep`; para `water`, `value`=ml; para `active-pause`/`workout`/`meal`, `value`=1.
3. Purpose `habit_reminders` no check de `lgpd_consent_logs.purpose` (migration).
4. Opcional stretch: `push_subscriptions (user_id, endpoint, keys, created_at)` RLS dono — só se push remoto entrar.

### Dia
Documentar: `day` = data em **America/Sao_Paulo** derivada no servidor da action (ou client envia ISO date validado). Alinhar Sprint 4 (hoje UTC) **numa única regra nesta sprint** para todos os kinds — **preferir America/Sao_Paulo** e migrar helpers de Mover/Comer para o mesmo util.

### Contratos
```
getTodayRitualAction() -> {
  day, prefs, waterMl, waterGoalMl,
  sleep: { quality, minutes } | null,
  activePauseDone, workoutDone, mealDone
}

logWaterAction(deltaMl: number) -> { waterMl }
setWaterTotalAction(totalMl: number) -> { waterMl }  // opcional

logSleepAction({ quality?: 'poor'|'ok'|'good', minutes?: number }) -> ok

markActivePauseDoneAction() / unmark...

updateHabitPrefsAction({ waterGoalMl, waterReminder, sleepReminder, sleepTargetBedtime?, activePauseEnabled, activePauseIntervalMinutes })

acceptHabitRemindersConsentAction(accepted: boolean)
```

Erros genéricos; sem log de valores em analytics.

### RLS
Já dono em prefs/logs — verificar INSERT water/sleep. Consent: insert only own user_id.

---

## 7. Designer UX + UX Writer

### Fluxo Hoje
1. Entrar em Hoje → ver 5 cartões de status (não dashboard denso).
2. Água: +ml → progresso suave até a meta.
3. Sono: escolher qualidade e/ou minutos → salvar.
4. Pausa: “Fazer pausa” → lista curta segura → “Marquei a pausa”.
5. Mover/Comer: status + link “abrir”.
6. Lembretes: CTA “Ativar lembretes” → texto de finalidade → permitir no navegador.

### Visual
Santuário, uma decisão por bloco, progress sem ranking vermelho. Sem streak flame. Touch targets grandes.

### Copy (pt-BR)
| Chave | Texto |
|---|---|
| Nav | Hoje |
| Título | Seu cuidado de hoje |
| Apoio | Constância leve: água, descanso, pausa, movimento e refeição. |
| Água | Água de hoje |
| +200 / +300 / +500 | Adicionar 200 ml (etc.) |
| Meta | Meta: {n} ml |
| Sono | Como foi o descanso? |
| poor / ok / good | Difícil / Ok / Bom |
| Minutos | Duração aproximada (opcional) |
| Pausa | Pausa ativa |
| Pausa CTA | Marquei a pausa |
| Pausa lista | Movimentos leves compatíveis com seu perfil |
| Lembretes título | Lembretes no aparelho |
| Lembretes apoio | Podemos lembrar água e pausa. Você pode desligar quando quiser. Não é monitoramento clínico. |
| Lembretes CTA | Quero lembretes |
| Lembretes off | Sem lembretes |
| Prefs | Ajustar hábitos |

Banidos: detox, falhou, punição, “durma X horas ou terá risco”.

---

## 8. DevOps (lembretes PWA)
1. Service worker mínimo para `showNotification` (sem cache de saúde).
2. Env: se push remoto, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + private só servidor.
3. iOS: documentar limitação (Add to Home Screen / versões).
4. Logs de SW sem payload de hábito.

---

## 9. QA

### Riscos
1. Dia “errado” por timezone.
2. Sono tratado como diagnóstico na copy.
3. Lembrete sem opt-in.
4. Vazamento RLS de logs.
5. Pausa sugerindo exercício inseguro.
6. Cache SW com dados de hábito.

### Casos
| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | prefs 2000 ml | +500 três vezes | value water=1500 |
| 2 | meta 2000 | ultrapassar | UI não culpa; pode > meta |
| 3 | — | log sleep good + 420 min | linha sleep do dia |
| 4 | seated only | lista pausa | sem standing-only |
| 5 | sem consent reminders | abrir Hoje | sem prompt Notification |
| 6 | consent + allow | prefs pause 90 | lembrete local possível |
| 7 | user B | select habit_logs A | vazio |
| 8 | workout feito Sprint 4 | Hoje | card Mover marcado |
| 9 | copy | varrer | zero emoji/culpa |

### Critério de pronto
Aceite 1–10 verde; checklist QA aprovado; roadmap Sprint 5 → fechada.

---

## Próximo comando

**Sugerido:** `/nova-feature` Sprint 6 (Conta, LGPD prática, PWA instalável).
