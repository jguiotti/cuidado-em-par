# Sprint 8 — Revisão clínica + LGPD (`/revisao-clinica-lgpd`)

**Data:** 2026-09-21  
**Parecer:** **aprovado com restrição** (lançamento permitido).  
**Escopo:** grupo (`care_circles.kind = group`), feed de cuidado, motor, Conta/PWA já fechados em S6–S7.

---

## Checklist clínico (movimento)

- [x] Lesão / PCD / gestação bloqueiam via contraindicação + `tag_block_rules` + capabilities
- [x] Feed do grupo **não** lista exercício — só kind `workout` / `active-pause`
- [x] Pausa ativa passa pelo mesmo `list_safe_exercises`
- [x] Sem recorte “treino masculino/feminino”
- [x] Biblioteca mínima cobre seated + active-pause (smoke S8)

## Checklist clínico (alimentação)

- [x] Gluten / vegan / lactose via `contains_tags` × `avoids_tags` e `diet_pattern`
- [x] Ordenação prioriza `low-cost`
- [x] Feed do grupo só `meal` agregado — sem prato/ingredientes
- [x] Smoke: vegan+low-cost e sem-gluten+low-cost ≥1

## Checklist LGPD

- [x] Perfil público (`display_name`) isolado de clínica/ciclo/biometria
- [x] RLS: não-membro não lê `care_events` / membros do círculo
- [x] Grupo **não** amplia payload — só aumenta N de olhares no agregado (máx. 8)
- [x] Uma membership ativa por pessoa (pair **ou** group)
- [x] SW shell-only: sem cache de `/circle`, hábitos ou Supabase
- [x] Consentimento auditável (S6); export/exclusão só do dono
- [x] Auditorias com perfis **sintéticos** — sem dump de produção

---

## Riscos e restrições (não bloqueantes)

| Risco | Gravidade | Mitigação |
|---|---|---|
| Reidentificação social com até 8 nomes + kinds do dia | média | Limite 8; copy sem culpa; sem ml/títulos/clínica |
| Race no 9º join | alta se falhar | RPC `FOR UPDATE` + `group_full`; QA manual |
| Falso seguro em seed novo | alta se ocorrer | Gate Educador/Nutri + auditoria motor |
| Pressão de grupo (“quem não registrou”) | média | Copy neutra; sem ranking |

---

## Falhas clínicas / privacidade abertas

Nenhuma **bloqueante** aberta nesta revisão.

---

## Correções obrigatórias (se reaparecerem)

| Item | Dono |
|---|---|
| Conteúdo sem tag de risco | Educador / Nutri |
| Feed expondo título de exercício/refeição | Backend + Frontend |
| Cache SW de rotas autenticadas | DevOps + Frontend |

---

## Casos QA antes do release

Ver `sprint-08-qa-checklist.md` (grupo G1–G6 + regressão pair + L1–L6 biblioteca + PWA).

---

## Parecer

**Aprovado com restrição:** grupo com o mesmo contrato de privacidade da dupla; motor auditado como seguro; lançamento ok após checklist QA manual em staging. Bloqueado permanece: feed clínico, analytics de kinds fora do círculo, admin lendo clínica de quem usa.
