# Roadmap de sprints, ideias pós-MVP e preparação React Native

Status: vivo — consultar depois do lançamento do MVP e a cada planejamento de ciclo.
Última atualização: 2026-09-21.

## Mudanças em relação ao recorte inicial
- **Sono entra no MVP** (pilar de consistência/prevenção), junto com água e pausa ativa.
- **Componentização máxima no frontend** desde já, para reaproveitar domínio e UI primitives em um app React Native após validação do MVP.
- Ideias de produto/UX aprovadas pela squad ficam neste arquivo para não se perderem.

---

## Princípios de experiência (MVP e além)

1. Uma decisão por tela; mobile-first; navegação com o polegar.
2. Santuário Digital: Verde Menta, Warm Blush, tonal layering, zero borda dura, zero ranking corporal.
3. Segurança invisível: conteúdo inseguro não aparece (motor de tags no servidor).
4. Gamificação só de **dias de cuidado** (água, sono, pausa, treino, refeição).
5. Sono: hábito de prevenção, sem diagnóstico de distúrbio; linguagem sem culpa (“como foi o descanso?”).

### Navegação do app (MVP)
| Aba | Função |
|---|---|
| Hoje | Ritual do dia: água, sono, pausa, treino, refeição |
| Mover | Exercícios filtrados |
| Comer | Refeições filtradas |
| Juntas | Dupla/grupo |
| Conta | Perfil, consentimentos, exclusão |

Backoffice: mundo separado (`/admin`), sem dado de saúde de quem usa o app.

---

## Sprints do MVP

### Sprint 0 — Fundação (quase concluída)
Auth, rotas, tokens, proxy, schema, tags em inglês.

### Sprint 1 — Consentimento + onboarding (passos 0–2)
Ver `docs/features/sprint-01-onboarding-consent.md`.
Termos, personalização de saúde, apelido, gênero opcional, foco, peso opcional.

### Sprint 2 — Onboarding clínico, alimentar, ciclo opt-in + hábitos base
Ver `docs/features/sprint-02-clinical-nutrition-cycle-habits.md`.
Sexo atribuído ao nascer (lista fechada, sensível), condições, mobilidade, nutrição, ciclo/gestação opt-in para todas as pessoas, preferências de água, sono e pausa ativa.

### Sprint 3 — Backoffice de exercícios
CRUD, tags, upload, seed mínimo (inclui pausa ativa e variações sentado).

### Sprint 4 — Backoffice de refeições + motor na UI
CRUD refeições; telas Mover/Comer via `list_safe_*`; marcar como feito.

### Sprint 5 — Hoje + hábitos (água, sono, pausa)
Home do dia; registrar água e qualidade/horas de sono (mínimo); lembrete de pausa; PWA notifications com opt-in.

### Sprint 6 — Conta, LGPD prática, PWA instalável
Revogar, exportar, excluir; manifest; cache só da casca.

### Sprint 7 — Cuidado coletivo (dupla primeiro)
Convite por código; dias de cuidado compartilhados; sem vazamento clínico.

### Sprint 8 — Grupo + endurecimento + conteúdo rico
Grupo; auditorias clínica/LGPD/UX/QA; biblioteca mínima de lançamento.

---

## Sono no MVP (definição curta)

**Entra**
- Preferência: lembrete de sono ligado/desligado; meta simples de horário de deitar (opcional).
- Registro do dia: qualidade subjetiva (`poor` | `ok` | `good`) e/ou duração em minutos — enums em inglês, labels em pt-BR.
- Conta como `habit_kind` / `care_events.kind`: `sleep`.
- Aparece em **Hoje** e no círculo só como “descansou” (sem nota clínica).

**Não entra no MVP**
- Polissonografia, diagnóstico de apneia, wearables obrigatórios, score médico de sono.
- Correlação automática agressiva treino×sono sem regra explícita de Educador (pode ser pós-MVP suave).

Migração futura: estender `habit_logs.kind` e `care_events.kind` com `sleep`; campos em `user_habit_prefs` (`sleep_reminder_enabled`, `sleep_target_bedtime` opcional).

---

## Ideias aprovadas — consultar pós-MVP

### Experiência e hábito
- Modo “5 minutos” (só água + pausa + sono leve conta).
- Reabertura gentil após dias sem abrir o app.
- Preferência de horário para lembretes (manhã/tarde/noite).
- Trilha pós-gestação com conteúdo dedicado.

### Inclusão e segurança
- Revisão periódica do perfil (“algo mudou no seu corpo?”).
- Estado “hoje não consigo” (reduz intensidade sem apagar histórico).
- Conteúdo sentado/unilateral como primeira classe no backoffice.
- Botão “isso pareceu inseguro” → fila interna.

### Alimentação
- Lista de mercado da semana com substituições baratas.
- Filtro “só o que tenho em casa”.
- Porção para 1 pessoa como padrão.

### Cuidado coletivo
- Dupla como aquisição padrão antes de grupo grande.
- Combinados do círculo (ex.: 3 dias de cuidado/semana) sem ranking.
- Check-in de energia opcional (privado; não no feed clínico).

### Santuário / PWA
- Onboarding de instalação com benefício claro.
- Tema de contraste alto opcional.
- Offline limitado de hábitos.

### Operação
- Checklist de publicação clínica no backoffice.
- Fluxo rascunho → revisão Educador/Nutri → publicado.
- Biblioteca mínima de lançamento documentada (ex.: 30 exercícios + 20 refeições cobrindo PCD, gestação, celíaco, vegano).

### Confiança
- Explicar o motor em linguagem humana na Conta.
- Central de privacidade completa.

### Fora de escopo permanente (salvo mudança explícita de produto)
IA generativa para treino/dieta/diagnóstico; IMC como meta; foto de corpo; ranking de shape; admin lendo clínica de quem usa o app; suplemento caro como default.

---

## Componentização e futuro React Native

Objetivo: depois do MVP validado, um app React Native reaproveita o máximo possível.

### O que componentizar desde já (Web)
1. **Design system / primitives** em `components/ui/`: `Button`, `TextField`, `ChoiceCard`, `ProgressSteps`, `Surface`, `InlineAlert`, `BottomNav` — sem lógica de negócio, só props.
2. **Blocos de produto** em `components/` por domínio: `auth/`, `onboarding/`, `habits/`, `workouts/`, `meals/`, `circle/`, `account/`, `admin/`.
3. **Domínio puro** em `lib/`: tags, validação de consentimento, mapeamento de labels, regras de hábito — **sem** imports de `next/` ou `react-dom`.
4. **Server Actions / data** ficam em `app/actions/` (web); no RN serão hooks + API/Supabase client.
5. **Copy** centralizada (constantes ou dicionário pt-BR) para a mesma voz nas duas plataformas.

### Regras para quem implementa
- Preferir composição a telas monólito.
- Nada de estilo acoplado a uma única página se o padrão se repete.
- Evitar APIs só-web dentro de componentes reutilizáveis (ex.: `window` só em adapters).
- Tokens CSS espelháveis depois em theme RN (cores e raios com os mesmos nomes semânticos).

### O que NÃO se compartilha 1:1
Layouts App Router, `proxy.ts`, Server Components, PWA service worker. A lógica e os primitives sim.

Ver também `.cursor/rules/08-desenvolvedor-frontend.mdc` e `13-coding-standards.mdc`.
