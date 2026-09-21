# Sprint 6 — QA checklist (Conta, LGPD, PWA)

**Status: aprovado** — manuais validados pela pessoa responsável; smoke `scripts/sprint06-qa-smoke.ts` disponível (2026-09-21).

Após aplicar `20260921170000_sprint5_sleep_quality_habit_reminders.sql` (e PWA/Conta do Sprint 6):

## Conta / direitos
- [x] `/account` mostra perfil público, motor, consentimentos, exportar, excluir, instalar
- [x] Editar `display_name` / identidade de gênero salva sem clínica na seção
- [x] Export JSON só da pessoa autenticada; chaves `profile`, `consents`, hábitos, etc.
- [x] Revogar `health_personalization` → log false; clínica/nutrição limpas; Mover/Comer vazios com mensagem segura
- [x] Revogar `cycle_module` → sem `user_cycle_profiles`
- [x] Revogar `biometrics` → `weight_kg` null
- [x] Revogar `terms` → outras abas redirecionam para Conta; banner de gate
- [x] Aceitar de novo health → volta ao onboarding de personalização
- [x] Excluir com frase errada → não apaga
- [x] Excluir com `EXCLUIR` → conta some; sessão encerra
- [x] Pessoa B não exporta/apaga A (RLS + actions só `auth.uid()`)

## PWA
- [x] `manifest.webmanifest` + ícones acessíveis
- [x] Metadata aponta para o manifest
- [x] SW registra; cache só de casca (`/_next/static`, `/icons`, manifest)
- [x] Sem cache de `/home`, export ou payloads de saúde
- [x] iOS: hint “Adicionar à Tela de Início” visível quando couber

## Copy / LGPD
- [x] Zero emoji; consentimento informativo; exclusão sem culpa
- [x] Texto do motor sem prometer IA/diagnóstico
- [x] Dado sensível fora de URL/log

## Smoke

```bash
npx tsx scripts/sprint06-qa-smoke.ts
```

## Nota iOS / install
Chrome/Android: `beforeinstallprompt` quando critérios PWA ok.  
Safari iOS: instalação manual via Compartilhar → Adicionar à Tela de Início (sem prompt automático).
