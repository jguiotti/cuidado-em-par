# Sprint 7 — QA checklist (dupla / Círculo)

**Status: aprovado** — manuais validados pela pessoa responsável; smoke `scripts/sprint07-qa-smoke.ts` disponível (2026-09-21).

Após aplicar `20260921190000_sprint7_care_pair_join.sql`:

## Dupla
- [x] Criar dupla gera código; criador é membro
- [x] Entrar com código válido completa a dupla (2 nomes públicos)
- [x] Terceira pessoa recebe “dupla completa”
- [x] Já em dupla → não cria/entra em outra (`already_in_circle`)
- [x] Código inválido → mensagem clara
- [x] Copiar código funciona
- [x] Sair (membro) remove membership; criador ao sair dissolve o círculo

## Feed / privacidade
- [x] Água só aparece no feed com meta atingida (não com ml parcial)
- [x] Sono / pausa / ≥1 movimento / ≥1 refeição publicam kind agregado
- [x] Vários exercícios no dia → um único “Movimento” no feed
- [x] Sem ml, qualidade de sono, título de exercício/refeição ou tags clínicas
- [x] Pessoa B não lê habit_logs / clínica de A
- [x] Histórico ~7 dias sem leaderboard/culpa

## Regressão
- [x] Sem dupla: empty state criar/entrar
- [x] Marcar hábitos sincroniza feed após refresh
- [x] Zero emoji; copy inclusiva

## Smoke

```bash
npx tsx scripts/sprint07-qa-smoke.ts
```
