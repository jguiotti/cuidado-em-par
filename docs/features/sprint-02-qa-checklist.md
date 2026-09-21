# Sprint 2 — QA smoke checklist

After applying migrations (Sprint 2 sexo/sono/stage, catálogo clínico, habit prefs INSERT) and restarting `npm run dev`.

Verificação em **2026-09-21**: smoke de código (`scripts/sprint02-qa-smoke.ts`) + cadastro real concluído até `/home`.

- [x] Sprint 1 completo redireciona para `/onboarding/sex-assigned`  
  _Código: `resolveOnboardingStep` + stage após focus; smoke PASS._
- [x] Sexo atribuído pode ser pulado sem escolha  
  _Código: `updateSexAssignedAction({ skip: true })` grava `null` e avança._
- [x] Escolher sexo grava valor em inglês e segue para clinical  
  _Código: valores `female|male|intersex|prefer_not_to_say`; redirect `/onboarding/clinical`._
- [x] Condições + nenhuma funcionam; nada vai para perfil público  
  _UI busca 0–N; RLS `user_clinical_conditions` só dono; círculo só vê perfil público._
- [x] Mobilidade cadeira → capabilities sem `standing`  
  _Smoke PASS (`seated`, `unilateral`)._
- [x] Nutrição vegano + avoids gluten grava corretamente  
  _Código: `diet_pattern` + `filterFoodAvoidSlugs`; fluxo real usou restrição (lactose) com sucesso._
- [x] Ciclo “Não agora” não cria `user_cycle_profiles`  
  _Código: `choice === "skip"` faz `delete` e não faz upsert._
- [x] Ciclo gestação sem trimestre bloqueia  
  _Código: retorna `trimester_required`; UI mostra erro._
- [x] Ciclo ativo com consent cria profile + log `cycle_module`  
  _Código: `recordConsentAction` + upsert; fluxo real: menstrual-cycle com consent._
- [x] `male` + ciclo menstrual permitido  
  _Código: ciclo não lê `sex_assigned_at_birth`; qualquer pessoa pode optar._
- [x] Hábitos concluem com `onboarding_completed_at` e stage `completed`  
  _Confirmado no cadastro real + fix RLS INSERT habit prefs._
- [x] `/home` com onboarding completo não redireciona ao wizard  
  _Confirmado pela pessoa usuária (“Cadastro concluído”)._
- [x] Copy: sem “gênero biológico”, sem “perda de peso”, zero emoji  
  _Smoke PASS em `onboardingCopy`._

## Script de regressão rápida

```bash
npx tsx scripts/sprint02-qa-smoke.ts
```
