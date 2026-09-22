# MVP finalizado — Cuidado em Par

**Status:** concluído  
**Data de fechamento:** 2026-09-22  
**Decisão:** Gerente de Tecnologia + Product Manager (com base nas sprints 0–10, auditorias e endurecimento).

Este documento marca o fim do recorte MVP. Novas entregas entram como **pós-MVP** em `docs/roadmap-pos-mvp-e-sprints.md`.

---

## O que o MVP entrega

| Área | Entrega |
| --- | --- |
| Conta | E-mail + senha, reset, confirmação; Conta com troca de senha |
| Consentimento | Termos, saúde, biometria opcional, ciclo opt-in; revogação e exclusão |
| Onboarding | Identidade, foco, clínico, nutrição, ciclo, hábitos |
| Motor | `list_safe_exercises` / `list_safe_meals` no Postgres; T1–T3 e postpartum; postura OR |
| Bibliotecas | ~143 exercícios e ~99 refeições publicados (seed + backoffice) |
| Hoje | Água, sono, pausa, plano de movimento/refeições, descanso (`rest-day`) |
| Rotina / Comer | Listas só via motor; marcar feito com gate clínico |
| Progresso | Acompanhamento de consistência (sem ranking corporal) |
| Círculo | Dupla ou grupo (até 8); combinado semanal; progresso em companhia; nudge |
| Conta / LGPD | Export, consentimentos, PWA, isolamento público × sensível |
| Admin | CRUD exercícios e refeições com enriquecimento e publish rules |
| UX / a11y | Santuário digital; foco visível; reduced-motion; copy humana de erros |

Fonte de arquitetura: `docs/arquitetura-e-regras-de-negocio.md`.  
Roadmap e ideias futuras: `docs/roadmap-pos-mvp-e-sprints.md`.

---

## Sprints do MVP (índice)

| Sprint | Tema | Doc |
| --- | --- | --- |
| 0 | Fundação (Auth, schema, tags, proxy) | este repo + migrations |
| 1 | Consentimento + onboarding base | `docs/features/sprint-01-onboarding-consent.md` |
| 2 | Clínico, nutrição, ciclo, hábitos | `docs/features/sprint-02-clinical-nutrition-cycle-habits.md` |
| 3 | Backoffice exercícios | `docs/features/sprint-03-admin-exercises.md` |
| 4 | Refeições + Mover/Comer seguros | `docs/features/sprint-04-meals-and-safe-ui.md` |
| 5 | Hoje (água, sono, pausa) | `docs/features/sprint-05-today-habits.md` |
| 6 | Conta, LGPD, PWA | `docs/features/sprint-06-account-lgpd-pwa.md` |
| 7 | Círculo (dupla) | `docs/features/sprint-07-care-circle-pair.md` |
| 8 | Grupo + endurecimento + lançamento | `docs/features/sprint-08-group-launch-hardening.md` |
| 9 | Plano do dia + progresso | código em `app/(app)/home`, `progress`, `app/actions/daily-plan.ts` |
| 10 | Combinado, companhia, rest-day, nudge | `docs/features/sprint-10-circle-care-together.md` |
| Auth | Senha como fluxo principal | `docs/features/auth-password-mvp.md` |

---

## Critérios de pronto (fechados)

1. Motor determinístico no banco; auditorias offline Educador/Nutri passam.
2. Conteúdo inseguro não aparece nas superfícies do app (`list_safe_*` + gate de mark-done).
3. Círculo não expõe dado clínico, ciclo, restrição ou biometria.
4. Consentimento auditável; export e exclusão disponíveis na Conta.
5. Sem IA generativa no caminho de treino, dieta ou diagnóstico.
6. Copy pt-BR inclusiva; identificadores de código/SQL em inglês.

---

## Operação pós-fechamento (não bloqueia o status MVP)

Aplicar no Supabase remoto, se ainda pendente:

- Migrations até `20260922180000_cycle_t1_postpartum_and_posture_capability_or.sql` (e demais da pasta `supabase/migrations/`).
- Templates de e-mail e redirect URLs de Auth em produção.
- Smoke manual de círculo (joins) e perfis clínicos L1–L6 em staging, quando houver anúncio público.

Isso é **go-live / ops**, não reabre o escopo do MVP.

---

## O que fica explicitamente fora do MVP

Ver seção “Fica de fora” em `docs/arquitetura-e-regras-de-negocio.md` e “Ideias aprovadas — pós-MVP” no roadmap. Exemplos: filtro de refeição por fase, wearables, tema contraste alto avançado, lista de mercado da semana, React Native nativo.
