# Sprint 8 — Revisão QA (`/revisao-qa`)

**Data:** 2026-09-21  
**Parecer:** pronto para checklist fechado após manuais em staging + smokes verdes.  
**Definition of Done:** aceite do plano Sprint 8 (itens 1–10) + artefatos de auditoria anexos.

---

## Casos — grupo

| # | Pré | Ação | Esperado | Gravidade | Auto? |
|---|---|---|---|---|---|
| G1 | — | criar grupo | código; 1 membro; kind group | crítica | manual + RPC |
| G2 | código | 7 joins além do criador | 8 membros | crítica | manual |
| G3 | 8 membros | 9º join | `group_full` | crítica | manual |
| G4 | em pair | criar/entrar group | `already_in_circle` | crítica | manual |
| G5 | group ativo | hábitos do dia | feed só kinds agregados | crítica | manual |
| G6 | membro B | tentar ler clínica A | vazio / RLS | crítica | manual |
| G7 | criador | sair | dissolve círculo | alta | manual |
| G8 | não-criador | sair | remove membership | alta | manual |

## Casos — regressão pair / MVP

| # | Caso | Esperado | Gravidade |
|---|---|---|---|
| R1 | criar/entrar pair | máx. 2; `pair_full` no 3º | crítica |
| R2 | list_safe_* | sem falso seguro nos perfis S4–S5 | crítica |
| R3 | Conta revogar health | Mover/Comer vazios | alta |
| R4 | SW | sem cache de `/circle` / hábitos | alta |
| R5 | zero emoji / copy | Círculo + Hoje | média |

## Casos — biblioteca lançamento

| # | Perfil sintético | Esperado | Auto? |
|---|---|---|---|
| L1 | seated-only | ≥1 exercício seguro | smoke seed + staging |
| L2 | torn-acl | sem itens bloqueados pela regra | staging |
| L3 | pregnancy-t3 | sem contraindicados t3 | staging |
| L4 | vegan | lista não vazia, só compatible | smoke + staging |
| L5 | avoids gluten | sem contains gluten | smoke + staging |
| L6 | active-pause | ≥1 pausa na lista segura | smoke + staging |

---

## Automatizável agora

```bash
npx tsx scripts/sprint08-qa-smoke.ts
npx tsx scripts/sprint08-launch-library-smoke.ts
npx tsc --noEmit
```

---

## O que bloqueia release

1. `group_full` ou limite 8 falhando no RPC.
2. Feed com detalhe clínico / título de conteúdo.
3. Falso seguro em L1–L5 em staging.
4. SW cacheando rotas autenticadas.

Nenhum desses está aberto no código auditado desta sprint; falta **confirmação manual** em ambiente com migration `20260921200000_sprint8_care_group.sql` aplicada.

---

## Critério de pronto

- [x] Código group + UI + copy
- [x] Docs motor / clínica-LGPD / UX / launch library
- [x] Smokes offline verdes
- [ ] Checklist manual G1–G8 + L em staging (pessoa QA)
- [ ] Roadmap Sprint 8 → fechada / MVP
