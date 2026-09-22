# Sprint 1 — Consentimento e onboarding (passos 0–2)

Comando de origem: `/nova-feature`  
Status: **fechada (MVP)** — ver código + `docs/features/sprint-01-qa-checklist.md`.
Comando de origem: `/nova-feature` → `/implementar`

---

## 1. Product Manager

### Problema e para quem
Quem cria a conta precisa entender o que será feito com os dados e registrar o mínimo de identidade/foco antes de falar de lesão ou dieta. Sem isso, o motor não tem base legal nem contexto humano.

### Pilares
LGPD, inclusão (gênero opcional sem travar ciclo), santuário (baixa carga cognitiva), preparação para hábitos (peso opcional só para água).

### Escopo do Sprint 1
**Entra**
- Passo 0: termos + consentimento de personalização de saúde (`terms`, `health_personalization`).
- Passo 1: “Como podemos te chamar?”; identidade de gênero opcional (pular).
- Passo 2: foco de saúde; peso opcional com consentimento `biometrics` (finalidade: sugerir meta de água depois).
- Persistência por passo; progresso; redirecionar para `/home` se já completou estes passos? Não — onboarding completo só no Sprint 2. Ao fim do Sprint 1, marcar progresso interno (ex.: `onboarding_step`) **ou** simplesmente avançar para rota `/onboarding/clinical` placeholder. Preferência: coluna/`user_profiles` não tem step ainda — usar rotas `/onboarding/consent`, `/onboarding/identity`, `/onboarding/focus` e cookie/session flag mínima **ou** tabela leve. Arquiteto recomenda: não inventar tabela grande; checar consentimentos + `display_name` preenchido para saber se Sprint 1 acabou.

**Fora**
- Lesões, mobilidade, nutrição, ciclo, hábitos água/sono/pausa (Sprint 2).
- Lista de treinos/refeições.
- Sono UI (Sprint 2 prefs + Sprint 5 registro) — só garantir que copy de hábitos futuros não prometa milagre.

### Aceite
1. Sem aceitar `terms` + `health_personalization`, não avança para identidade/foco que alimentam personalização (pode só usar hábitos genéricos depois — no Sprint 1, bloqueia avanço do wizard de saúde).
2. Gênero opcional; pular não grava valor fantasma obrigatório.
3. Peso só grava se `biometrics` aceito; recusar peso não bloqueia o resto do passo 2.
4. Cada aceite gera linha append-only em `lgpd_consent_logs`.
5. Mobile: uma pergunta principal por tela; CTAs com área de toque confortável.
6. Zero emoji; linguagem inclusiva.

---

## 2. Educador Físico / Nutricionista

Sem tags clínicas novas neste sprint.  
Peso: **não** altera intensidade de treino neste corte; só preparação para meta de água.  
Nutri: sem coleta alimentar ainda.

---

## 3. Especialista LGPD — **aprovado com restrição**

### Inventário
| Dado | Finalidade | Base | Tabela | Retenção |
|---|---|---|---|---|
| Aceite termos/política | contrato + informação | execução de contrato / obrigação | `lgpd_consent_logs` purpose `terms` | enquanto conta existir (+ auditoria) |
| Personalização de saúde | filtrar treino/refeição depois | consentimento | `lgpd_consent_logs` `health_personalization` | idem; revogável |
| `display_name` | tratamento respeitoso + círculo | legítimo interesse / contrato | `user_profiles` | até exclusão |
| `gender_identity` | respeito/comunidade; **não** motor | consentimento implícito no preenchimento opcional | `user_profiles` | até exclusão |
| `health_focus` | ordenar/priorizar UX de cuidado | consentimento de personalização | `user_profiles` | até exclusão |
| `weight_kg` | sugerir meta de água | consentimento `biometrics` | `user_biometrics` | até exclusão/revogação |

### Público vs sensível
- Público (futuro círculo): só `display_name` (e depois contagem de cuidados). **Não** gênero obrigatório no feed; preferível manter `gender_identity` fora do perfil visível ao círculo neste MVP.
- Sensível: peso, e qualquer dado clínico futuro.

### Restrições
1. Copy de consentimento informativa, não persuasiva (UX Writer).
2. Não colocar peso em URL, analytics ou log.
3. Revogação de `biometrics` deve permitir delete da linha de biometria (já há policy delete).
4. Revogação de `health_personalization` no Sprint 6; no Sprint 1 só registrar aceite.

### Parecer
**Aprovado com restrição:** `gender_identity` não alimenta motor e não vai para o círculo; peso só com `biometrics`.

---

## 4. Gerente de Tecnologia — ordem

1. UX Writer — strings de consentimento e passos (este doc).
2. Arquiteto/Backend — actions + eventual migração mínima se faltar `onboarding` progress (preferir derivar estado).
3. Frontend — components reutilizáveis do wizard + telas.
4. QA — casos de consentimento e RLS.
5. Em paralelo (não bloqueia): Designer especifica ChoiceCard/ProgressSteps para Sprint 2/3.

Agentes: Backend, Frontend, LGPD (já), UX Writer, QA. Educador só consulta.

Riscos: wizard longo (mitigar 3 telas só); magic link expirado (estado de erro claro).

---

## 5. Arquiteto

### Fronteira
Sem tabela nova obrigatória se:
- Consent = insert em `lgpd_consent_logs`
- Identity/focus = update `user_profiles`
- Weight = upsert `user_biometrics` com check de consent via RLS já existente

### Estado do wizard (derivado)
- Passo 0 ok: último `terms` e `health_personalization` com `accepted = true`
- Passo 1 ok: `display_name` not null/não vazio
- Passo 2 ok: `health_focus` not null (peso opcional)

Opcional (só se Frontend precisar de deep-link estável): migração add `onboarding_stage text` em `user_profiles` (`consent` | `identity` | `focus` | `clinical` | …). **Recomendação Sprint 1:** derivar; adicionar coluna no Sprint 2 se o fluxo crescer.

### Contratos Server Actions (nomes em inglês)
1. `recordConsentAction({ purpose, accepted })` → insert log; requires `auth.uid()`
2. `updateIdentityAction({ displayName, genderIdentity?: string | null })`
3. `updateFocusAction({ healthFocus, weightKg?: number | null, acceptBiometrics?: boolean })`  
   - se `weightKg` presente: primeiro insert consent `biometrics` se necessário, depois upsert biometrics  
   - se `acceptBiometrics === false` e havia peso: não gravar

Erros: genéricos para a pessoa; sem vazar schema.

### RLS
Já cobre. Garantir actions usam cliente SSR da pessoa, não service role.

---

## 6. Designer UX + UX Writer

### Fluxo de telas (mobile fullscreen)
1. `/onboarding/consent` — dois blocos de aceite (termos; personalização). CTA: Continuar. Link: “Ler resumo de privacidade” → `/terms`.
2. `/onboarding/identity` — campo apelido; gênero opcional + “Prefiro não informar”.
3. `/onboarding/focus` — 4 `ChoiceCard` de foco; seção colapsável/secundária “Peso (opcional)” com toggle de consentimento biométrico curto.

Progresso: “Passo X de 6” (total do onboarding completo, sendo 1–3 este sprint e 4–6 o próximo) — reduz ansiedade de “quando acaba”.

### Tokens
Surface, mint-deep CTA, choice cards com tonal layering, sem borda 1px, toque min ~48px.

### Componentes a criar (RN-ready)
- `components/ui/button.tsx`
- `components/ui/text-field.tsx`
- `components/ui/choice-card.tsx`
- `components/ui/progress-steps.tsx`
- `components/ui/inline-alert.tsx`
- `components/ui/surface.tsx`
- `components/onboarding/consent-step.tsx`
- `components/onboarding/identity-step.tsx`
- `components/onboarding/focus-step.tsx`

Lógica de validação em `lib/onboarding/` sem `next/`.

### Copy (pt-BR) — rascunho aprovável

**Consent — título:** Antes de continuar  
**Apoio:** Vamos pedir só o necessário para cuidar com segurança. Você pode mudar de ideia depois na Conta.  
**Check termos:** Li e aceito os termos de uso e a política de privacidade.  
**Check saúde:** Autorizo o uso dos meus dados de saúde para sugerir treinos e refeições compatíveis com o meu contexto.  
**CTA:** Continuar  
**Erro:** Para seguir, é preciso aceitar os dois itens. São eles que protegem você e deixam claro o que fazemos com os dados.

**Identity — título:** Como podemos te chamar?  
**Apoio:** Esse nome aparece para você e, se quiser, para quem cuidar junto.  
**Label gênero:** Identidade de gênero (opcional)  
**Pular gênero:** Prefiro não informar  
**CTA:** Continuar

**Focus — título:** Qual o seu foco de cuidado agora?  
**Opções (labels):** Qualidade de vida | Preparo físico | Manutenção | Composição corporal  
**Apoio composição:** Sem ranking e sem cobrança estética — só para alinhar sugestões.  
**Peso — título:** Peso (opcional)  
**Apoio peso:** Usamos só para sugerir uma meta de água. Você pode pular.  
**Consent peso:** Autorizo guardar meu peso só para a meta de hidratação.  
**CTA:** Continuar  
**Erro peso:** Se informar o peso, marque a autorização de uso.

**Termos banidos:** emagrecer rápido, modo homem/mulher, você precisa, desculpa fraca, emoji.

### Estados
Carregando no CTA; erro de rede genérico; sessão expirada → `/login`.

---

## 7. QA — casos que bloqueiam release

1. Sem login → `/onboarding/*` redireciona login.  
2. Sem os dois consentimentos → não grava perfil de foco/identidade via action (ou action recusa).  
3. Aceitar consent → 2 inserts (ou 2 eventos) em `lgpd_consent_logs`.  
4. Pessoa A não lê logs de B (RLS).  
5. Peso sem `biometrics` → rejeitado.  
6. Peso com consent → linha em `user_biometrics` só do dono.  
7. Gênero “não informar” → null/ausente; app não quebra.  
8. A11y: checks e radios/cards com nome acessível; foco visível; sem depender só de cor.  
9. Copy: zero emoji; sem pronome binário nas strings deste fluxo.

Massa: usuários sintéticos; nunca dado real de saúde de produção.

---

## Plano técnico numerado

| # | Dono | Artefato |
|---|---|---|
| 1 | UX Writer / Frontend | strings em `lib/i18n/onboarding-pt-br.ts` (ou similar) |
| 2 | Frontend | `components/ui/*` primitives |
| 3 | Backend | `app/actions/onboarding.ts` (3 actions) |
| 4 | Frontend | páginas `/onboarding/consent|identity|focus` |
| 5 | Frontend | gate: se Sprint 1 incompleto, `/home` manda para o passo certo |
| 6 | QA | checklist + smoke manual mobile |

---

## Próximo comando

`/implementar` seguindo este documento.

Depois: `/nova-feature` do Sprint 2 (clínica, comida, ciclo, água/sono/pausa prefs).
