# Sprint 5 — QA checklist (Hoje + hábitos)

**Status: aprovado** — manuais validados pela pessoa responsável; smoke `scripts/sprint05-qa-smoke.ts` disponível (2026-09-21).

Após aplicar `20260921170000_sprint5_sleep_quality_habit_reminders.sql`:

## Schema / consentimento
- [x] Coluna `habit_logs.sleep_quality` aceita `poor` | `ok` | `good` | null
- [x] Purpose `habit_reminders` grava em `lgpd_consent_logs`
- [x] Sem opt-in → abrir Hoje **não** dispara `Notification.requestPermission`
- [x] Opt-in + permitir → lembretes locais possíveis conforme prefs
- [x] Opt-in + negar navegador → sem popup agressivo; mensagem clara

## Hoje (`/home`)
- [x] Nav label **Hoje**
- [x] Cinco eixos: água, sono, pausa, mover, comer
- [x] Água: +200 / +300 / +500 soma `habit_logs.kind=water` (value = ml)
- [x] Ultrapassar meta não culpa; pode passar da meta (até 8000)
- [x] Sono: qualidade e/ou minutos; copy “como foi o descanso?”; sem tom clínico
- [x] Pausa: lista só exercícios seguros com `active-pause` (máx. 3)
- [x] Perfil seated / torn-acl na pausa: nada inseguro
- [x] Mover/Comer refletem logs `workout` / `meal` do dia SP + link
- [x] Dia = America/Sao_Paulo (alinhado com Mover/Comer)

## Preferências (`/habits`)
- [x] Editar meta de água, lembretes, intervalo de pausa, horário de sono
- [x] Só o dono lê/altera (RLS)
- [x] Pessoa B não lê `habit_logs` / prefs de A

## Service worker
- [x] `public/sw.js` não cacheia payload de saúde/hábito
- [x] Notificação local sem texto clínico

## Copy / LGPD
- [x] Zero emoji; sem culpa; sem detox/emagreça
- [x] Sono não é prontuário

## Smoke

```bash
npx tsx scripts/sprint05-qa-smoke.ts
```
