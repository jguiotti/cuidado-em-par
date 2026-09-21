# Sprint 8 — Biblioteca mínima de lançamento

**Status:** cobertura mínima **verde** no smoke offline (2026-09-21).  
**Script:** `scripts/sprint08-launch-library-smoke.ts`

---

## Critérios (aceite)

| Critério | Meta | Resultado smoke |
|---|---|---|
| Seated-capable | ≥1 exercício publicado com `seated` (sem exigir só standing) | PASS (13 candidatos seated-focused) |
| Active-pause | ≥1 com intensity `active-pause` | PASS (10) |
| Gestação T3 | ≥1 exercício **sem** contraindicação `pregnancy-trimester-3` | PASS |
| Torn-acl candidatos | ≥1 sem high-impact/plyo/`torn-acl` contraindicação | PASS |
| Vegan + low-cost | ≥1 refeição | PASS (29) |
| Sem gluten + low-cost | ≥1 refeição | PASS (73) |
| Tamanho biblioteca | exercícios ≥30; refeições ≥20 | PASS (143 / 99) |
| Limites círculo | pair=2; group=8 | PASS |

---

## Exemplos de slugs (âncoras de inclusão)

**Movimento**
- `seated-arm-raise-pause` — seated + active-pause
- `seated-towel-row` — seated + active-pause + utensílio doméstico

**Alimentação**
- `seasonal-fruit` — vegan + vegetarian + low-cost; sem gluten
- `mashed-banana-oats` — vegan + low-cost **mas** contains gluten (deve sumir se avoids gluten)
- `apple-slices-peanut-butter` — vegan + low-cost; contains peanut (não gluten)

---

## Como validar em staging (perfis sintéticos)

1. Contas de teste com consentimento `health_personalization`.
2. Perfis: capabilities `["seated"]`; condição `torn-acl`; fase `pregnancy-trimester-3`; nutrição vegan; avoids `["gluten"]`.
3. Abrir Mover / Comer e conferir L1–L6 (lista não vazia **e** sem item incompatível).
4. Não usar dado real de saúde.

---

## Gaps aceitos no MVP

- Poucos exercícios **somente** `requiredCapabilityTags: ["seated"]`; inclusão seated-only depende do array de capabilities do perfil.
- Smoke não substitui RPC com `auth.uid()` — gate final é QA em staging.

---

## Migrations de lançamento (checklist DevOps)

Aplicar em ordem até:

- `...sprint7_care_pair_join.sql`
- `20260921200000_sprint8_care_group.sql`
- seeds de biblioteca já publicados em migrations anteriores

SW: apenas casca (`/_next/static`, `/icons`, manifest) — ver `public/sw.js`.
