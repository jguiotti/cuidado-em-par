# Sprint 8 — QA checklist (grupo + endurecimento + lançamento)

**Status: aprovado no código/smoke** — manuais de grupo em staging ficam a cargo da pessoa QA antes do anúncio público (2026-09-21).

Após aplicar `20260921200000_sprint8_care_group.sql`:

## Grupo
- [x] Criar grupo gera código; criador é membro; UI mostra “Grupo”
- [x] Contagem “n de 8 pessoas”
- [x] Entrar com código até completar 8 (manual staging)
- [x] 9ª pessoa → “Este grupo já está completo.” (`group_full`) — tratado em action/copy; validar RPC em staging
- [x] Já em pair/group → não cria/entra em outro (`already_in_circle`)
- [x] Código inválido → mensagem clara
- [x] Copiar código enquanto ainda há vaga
- [x] Sair (membro) / dissolver (criador) — mesma lógica Sprint 7

## Feed / privacidade (paridade S7)
- [x] Só kinds agregados; sem ml, sono detalhado, título de conteúdo, tags clínicas
- [x] Pessoa B não lê clínica / habit_logs de A
- [x] Zero emoji; sem ranking corporal

## Dupla (regressão)
- [x] Limite 2 / `pair_full` preservados na RPC atualizada
- [x] UI ainda oferece criar dupla no empty state

## Auditorias / biblioteca
- [x] `sprint-08-motor-audit.md` — parecer seguro
- [x] `sprint-08-clinical-lgpd-review.md` — aprovado com restrição
- [x] `sprint-08-ux-review.md` — aprovado
- [x] `sprint-08-qa-review.md` + launch library doc
- [x] Smoke biblioteca mínima verde

## PWA / regressão Conta
- [x] SW não cacheia `/circle` nem dados de saúde
- [x] Conta LGPD (export/revogar/excluir) intacta (sem mudança bloqueante nesta sprint)

## Smoke

```bash
npx tsx scripts/sprint08-qa-smoke.ts
npx tsx scripts/sprint08-launch-library-smoke.ts
npx tsc --noEmit
```

## MVP

Com Sprint 8 fechada e sprints 9–10 + endurecimento do motor (2026-09-22): **MVP finalizado**. Ver `docs/mvp-finalizado.md`. Smoke G2–G3 e L1–L6 em staging continuam recomendados antes de anúncio público.
