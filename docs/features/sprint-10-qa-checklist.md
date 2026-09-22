# Sprint 10 — QA checklist (círculo com motivo)

Fonte: `docs/features/sprint-10-circle-care-together.md`  
Status MVP: **fechada** (2026-09-22) — checklist abaixo permanece como regressão / smoke de staging.

## Pré-requisito
- [ ] Migration `20260922160000_sprint10_circle_care_together.sql` aplicada (e demais até `20260922180000_*` se ainda não rodaram)

## Combinado e progresso
- [ ] Default `weekly_care_goal = 3` em círculo existente
- [ ] Membro altera para 5/7; outro membro vê o valor
- [ ] Pair: só fecha dia juntos com **2** pessoas com cuidado no mesmo day
- [ ] Pair: A `rest-day` + B `sleep` → dia fecha
- [ ] Group 4: 2 com cuidado → fecha; 1 → não
- [ ] Contagem da semana (seg–dom SP) correta na UI

## rest-day
- [ ] Marcar em Hoje → aparece kind no feed do círculo
- [ ] Desmarcar → some do feed
- [ ] Não altera `list_safe_exercises` (motor inalterado)
- [ ] Copy sem culpa / sem emoji

## Nudge
- [ ] Enviar 1×/dia/destino ok
- [ ] Segundo envio → `already_sent`
- [ ] Destinatário vê mensagem; não-membro não lê (RLS)

## LGPD / regressão
- [ ] Export inclui `habit_logs` rest-day e `care_nudges`
- [ ] Feed sem ml, sem título de exercício/refeição, sem clínico
- [ ] SW não cacheia `/circle`

## Critério de pronto
Aceite PM 1–10; blockers acima verdes.
