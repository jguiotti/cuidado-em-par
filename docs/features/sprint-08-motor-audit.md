# Sprint 8 — Auditoria do motor relacional (`/auditoria-motor`)

**Data:** 2026-09-21  
**Parecer:** **motor seguro** para lançamento do MVP, com ressalvas operacionais (não bloqueantes).  
**Escopo:** `list_safe_exercises`, `list_safe_meals`, `tag_block_rules`, seeds publicados (~143 exercícios, ~99 refeições).

---

## Como o motor funciona (determinístico)

1. **Exercícios** (`list_safe_exercises`): exige consentimento `health_personalization` + linha em `user_clinical_conditions`. União `condition_tags ∪ phase_tags` (ciclo). Bloqueia se:
   - `contraindication_tags && união` (overlap);
   - `required_capability_tags` não é subconjunto de `capability_tags`;
   - existe `tag_block_rules` ligando condição/fase → `intensity_tags` do exercício.
2. **Refeições** (`list_safe_meals`): exige consentimento + `user_nutrition_profiles`. Bloqueia `contains_tags && avoids_tags`; exige compatibilidade com `diet_pattern` (`no-restriction` | `vegan` | `vegetarian`). Ordena priorizando `low-cost`.
3. Bloqueio no **banco** (RPC), não só na UI. Cards seguros **não** expõem tags clínicas.

---

## Mapa restrição → bloqueio → caminho seguro

| Perfil sintético | Bloqueios esperados | Caminho seguro (exemplos de slug) |
|---|---|---|
| `seated` capability only (sem `standing`) | exercícios que exigem `standing`/`lying` fora do subconjunto | `seated-arm-raise-pause`, `seated-towel-row` |
| `torn-acl` | `tag_block_rules` → `rotational-instability`, `spatial-travel`; contraindicações/intensity de risco | itens low-impact sem essas intensity tags |
| `pregnancy-trimester-3` | contraindicação explícita no conteúdo + regras de intensidade via bloco | conteúdos **sem** `pregnancy-trimester-3` em contraindicação |
| `active-pause` (uso) | mesmo filtro de exercício; intensity `active-pause` | `seated-arm-raise-pause`, `seated-towel-row` |
| `diet_pattern = vegan` | só `diet_compatible_tags @> vegan` | `seasonal-fruit`, outros vegan+low-cost |
| `avoids_tags` inclui `gluten` | `contains_tags` com `gluten` some | `seasonal-fruit`, `apple-slices-peanut-butter` (atenção: peanut) |

---

## Achados

### Não bloqueantes
1. **Cobertura seated-only “puro”:** poucos itens com `requiredCapabilityTags = ["seated"]` apenas; a maioria inclui `seated` **e** outras capacidades. Para perfil com só `seated` no array de capabilities, a regra `<@` ainda funciona; inclusão depende do onboarding gravar capabilities corretas.
2. **Smoke offline ≠ RPC ao vivo:** `scripts/sprint08-launch-library-smoke.ts` valida seeds + limites; falso seguro em produção exige preview com migrations + contas sintéticas.
3. **Conteúdo `isPublished: false`:** itens avançados (ex. `l-sit-floor`) ficam fora do motor — correto.

### Sem falso seguro detectado nesta auditoria
- Sem consentimento / sem clínica → lista vazia.
- Overlap de contraindicação e `tag_block_rules` no SQL.
- Refeições com gluten tagueado não passam para quem evita gluten (regra `&&`).

---

## Matriz mínima QA (perfis × conteúdo)

Ver também `sprint-08-launch-library.md` e casos L1–L6 do plano.

| # | Perfil | Esperado |
|---|---|---|
| M1 | seated-only | ≥1 exercício; nenhum que exija capability ausente |
| M2 | torn-acl | sem high-impact / rotational-instability bloqueados pela regra |
| M3 | pregnancy-t3 | sem contraindicação de gestação t3 |
| M4 | vegan | só diet-compatible vegan |
| M5 | avoids gluten | zero contains gluten |
| M6 | active-pause list | ≥1 com intensity active-pause e demais filtros ok |

---

## Correções obrigatórias

Nenhuma **bloqueante** para launch nesta rodada.  
**Operacional:** Educador/Nutri revisam seeds novos só via tags; Backend não afrouxa RPC.

---

## Parecer final

**Motor seguro** para o MVP: determinístico, no banco, com biblioteca mínima verificável no smoke offline. Ressalva: validar M1–M6 em staging com `auth.uid()` real antes do anúncio público.
