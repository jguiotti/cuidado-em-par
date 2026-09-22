# Roadmap — pós-MVP e preparação React Native

**MVP:** finalizado em 2026-09-22 — ver `docs/mvp-finalizado.md`.  
**Status deste arquivo:** vivo para ideias e ciclos **após** o MVP.  
Última atualização: 2026-09-22.

---

## Princípios de experiência (mantidos)

1. Uma decisão por tela; mobile-first; navegação com o polegar.
2. Santuário Digital: Verde Menta, Warm Blush, tonal layering, zero borda dura, zero ranking corporal.
3. Segurança invisível: conteúdo inseguro não aparece (motor de tags no servidor).
4. Gamificação só de **dias de cuidado** (água, sono, pausa, treino, refeição, descanso).
5. Sono: hábito de prevenção, sem diagnóstico; linguagem sem culpa.

### Navegação do app (entregue no MVP)

| Aba / área | Função |
| --- | --- |
| Início | Ritual do dia: água, sono, pausa, plano, descanso |
| Rotina | Exercícios filtrados pelo motor |
| Comer | Refeições filtradas pelo motor |
| Círculo | Dupla/grupo, combinado, progresso em companhia |
| Progresso | Consistência sem ranking corporal |
| Conta (via top bar) | Perfil, saúde editável, LGPD, senha, PWA |

Backoffice: mundo separado (`/admin`), sem dado de saúde de quem usa o app.

---

## Sprints do MVP (histórico — todas fechadas)

| Sprint | Tema | Status |
| --- | --- | --- |
| 0 | Fundação | fechada |
| 1 | Consentimento + onboarding base | fechada — `docs/features/sprint-01-onboarding-consent.md` |
| 2 | Clínico, nutrição, ciclo, hábitos | fechada — `docs/features/sprint-02-clinical-nutrition-cycle-habits.md` |
| 3 | Backoffice exercícios | fechada — `docs/features/sprint-03-admin-exercises.md` |
| 4 | Refeições + UI segura | fechada — `docs/features/sprint-04-meals-and-safe-ui.md` |
| 5 | Hoje + hábitos | fechada — `docs/features/sprint-05-today-habits.md` |
| 6 | Conta, LGPD, PWA | fechada — `docs/features/sprint-06-account-lgpd-pwa.md` |
| 7 | Círculo (dupla) | fechada — `docs/features/sprint-07-care-circle-pair.md` |
| 8 | Grupo + endurecimento | fechada — `docs/features/sprint-08-group-launch-hardening.md` |
| 9 | Plano do dia + progresso | fechada (código em home/progress/daily-plan) |
| 10 | Combinado, rest-day, nudge | fechada — `docs/features/sprint-10-circle-care-together.md` |

Auth por senha: `docs/features/auth-password-mvp.md` (parte do MVP).

---

## Sono (já no MVP)

Registro subjetivo (`poor` \| `ok` \| `good`), lembrete opcional, kind `sleep` no hábito/círculo só como “descansou”.  
Fora: diagnóstico, wearables obrigatórios, score médico.

---

## Ideias aprovadas — pós-MVP

Priorizar com PM a cada ciclo. Nada abaixo reabre o MVP automaticamente.

### Experiência e hábito
- Modo “5 minutos” (só água + pausa + sono leve).
- Reabertura gentil após dias sem abrir o app.
- Preferência de horário para lembretes (manhã/tarde/noite).
- Trilha pós-gestação com conteúdo dedicado.
- Check-in de energia opcional (privado; não no feed clínico).

### Inclusão e segurança
- Revisão periódica do perfil (“algo mudou no seu corpo?”).
- Botão “isso pareceu inseguro” → fila interna.
- Filtro brando de refeição por `phase_tags` (Nutricionista).

### Alimentação
- Lista de mercado da semana com substituições baratas.
- Filtro “só o que tenho em casa”.
- Porção para 1 pessoa como padrão.

### Cuidado coletivo
- Dupla como aquisição padrão antes de grupo grande (já possível; refinar onboarding).
- Celebrations leves de combinado (sem ranking).

### Santuário / PWA
- Onboarding de instalação com benefício claro.
- Tema de contraste alto opcional.
- Offline limitado de hábitos (sem cache de saúde).

### Operação
- Checklist de publicação clínica no backoffice.
- Fluxo rascunho → revisão Educador/Nutri → publicado.
- Hardening RLS da biblioteca (leitura só via RPC), se produto exigir.

### Confiança
- Central de privacidade expandida.
- Explicação do motor ainda mais curta na Conta (já há bloco base).

### Fora de escopo permanente (salvo mudança explícita de produto)
IA generativa para treino/dieta/diagnóstico; IMC como meta; foto de corpo; ranking de shape; admin lendo clínica de quem usa o app; suplemento caro como default.

---

## Componentização e futuro React Native

Objetivo: após validação do MVP em produção, reaproveitar domínio e UI.

### O que já está alinhado
1. **Primitives** em `components/ui/`.
2. **Blocos** por domínio em `components/`.
3. **Domínio puro** em `lib/` (tags, hábitos, ciclo, segurança) — preferir sem `next/`.
4. **Server Actions** em `app/actions/` (web); no RN → hooks + Supabase client.
5. **Copy** em `lib/i18n/*-pt-br.ts`.

### O que NÃO se compartilha 1:1
Layouts App Router, `proxy.ts`, Server Components, service worker da PWA.

Ver `.cursor/rules/08-desenvolvedor-frontend.mdc` e `13-coding-standards.mdc`.
