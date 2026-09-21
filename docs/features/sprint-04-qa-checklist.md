# Sprint 4 — QA checklist (refeições + Mover/Comer)

**Status: aprovado** — manuais validados pela pessoa responsável; smoke `scripts/sprint04-qa-smoke.ts` disponível (2026-09-21).

Após aplicar `20260921160000_seed_full_meal_library.sql` (e seeds de exercícios/ilustrações se ainda não aplicados):

## Admin refeições
- [x] Member acessa `/admin/meals` e cai em `/home`
- [x] Admin lista, cria rascunho, edita e salva
- [x] Publicar sem tag de dieta → bloqueado
- [x] Publicar sem `low-cost` → bloqueado
- [x] Publicar com slot + ingredientes + low-cost → ok
- [x] Despublicar → some da lista da pessoa
- [x] Upload PNG/JPEG/WebP grava path `meals/{id}/…`

## Seed
- [x] ≥ 1 refeição vegana com `low-cost`
- [x] ≥ 1 vegetariana (não necessariamente vegan)
- [x] Slots breakfast, lunch, snack, dinner presentes
- [x] Pelo menos uma com `contains_tags` gluten e outra com meat/fish

## Mover / Comer (pessoa usuária)
- [x] Nav mostra Mover e Comer
- [x] `/workouts` lista só via `list_safe_exercises` (sem tags clínicas no client)
- [x] `/meals` lista só via `list_safe_meals`; filtro por slot funciona
- [x] Perfil avoids gluten não vê mingau/pão com gluten
- [x] Perfil vegan não vê peixe/carne/ovos/lactose quando contains bloqueia
- [x] Lista vazia segura (sem perfil nutricional ou sem match)
- [x] Marquei como feito grava `habit_logs` (workout/meal) do dia
- [x] Desfazer remove o log do dia
- [x] Pessoa B não lê habit_logs de A

## Regressão motor movimento
- [x] torn-acl sem high-impact/plyometrics
- [x] seated only sem required standing

## Copy / LGPD
- [x] Zero emoji; sem milagre/emagreça
- [x] Admin de refeições não consulta clínica/nutrição de quem usa o app

## Smoke

```bash
npx tsx scripts/sprint04-qa-smoke.ts
```
