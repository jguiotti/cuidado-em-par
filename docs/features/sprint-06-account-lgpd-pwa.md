# Sprint 6 — Conta, LGPD prática, PWA instalável

Comando de origem: `/nova-feature`  
Status: **fechado (QA aprovado)** — ver `docs/features/sprint-06-qa-checklist.md`.  
Pré-existência: placeholder `/account`; `lgpd_consent_logs` (purposes: `terms`, `health_personalization`, `cycle_module`, `biometrics`, `habit_reminders`); tabelas sensíveis 1:1 + `habit_logs` / `user_habit_prefs` com RLS dono; `list_safe_*` já exige consentimento de personalização; SW mínimo de lembretes (`public/sw.js`) sem cache de saúde; cascade `on delete` em `auth.users` → tabelas `user_*` / logs.

---

## 1. Product Manager

### Problema e para quem
Quem usa o app já confiou dados sensíveis no cadastro e no ritual do dia, mas **ainda não consegue exercer direitos na interface**: ver o que está guardado, revogar finalidades, exportar ou apagar a conta. Sem isso, a promessa de soberania LGPD fica só no onboarding. Em paralelo, a PWA ainda não é instalável de forma clara (manifest + cache só da casca), o que limita uso no celular como app.

### Pilares
LGPD (acesso, revogação, portabilidade, exclusão); santuário (Conta calma, sem jargão); confiança (explicar o motor em linguagem humana); PWA acessível (instalação, sem cache de saúde).

### Escopo do Sprint 6
**Entra**
- Tela **Conta** (`/account`) completa para quem concluiu onboarding:
  - resumo do **perfil público** editável (`display_name`, `gender_identity` opcional; sem clínica na mesma seção visual);
  - **Como o cuidado é escolhido** — texto curto explicando o motor de tags (sem jargão, sem prometer diagnóstico);
  - **Consentimentos** — estado atual por purpose + CTA de revogar (e reativar quando fizer sentido);
  - **Exportar meus dados** — arquivo JSON (ou download) com o que a pessoa tem direito de portar;
  - **Excluir minha conta** — fluxo com confirmação explícita (digitar frase ou checkbox + confirmação), depois logout.
- **Revogação com efeito real:**
  - `health_personalization` → novo log `accepted=false`; limpar/zerar dados clínicos usados pelo motor **ou** esconder bibliotecas até novo aceite (ver Arquiteto); Mover/Comer deixam de personalizar;
  - `cycle_module` → log + remover/desligar `user_cycle_profiles`;
  - `biometrics` → log + limpar peso (e campos biométricos);
  - `habit_reminders` → log + UI já existente pode desligar (reuso Sprint 5);
  - `terms` → revogar **não** mantém conta “normal”: exige exclusão ou bloqueio de uso até novo aceite (ver LGPD).
- **PWA instalável:** `manifest.webmanifest` (ou JSON), ícones, `theme_color` / `background_color` alinhados ao Santuário; metadata Next; SW estendido **só** para casca estática (HTML shell / assets públicos), **nunca** respostas de actions/RPC com saúde.
- Seção Conta: atalho para `/habits` (prefs já existem).
- Estados: carregando, erro genérico, sucesso suave, confirmação destrutiva.

**Fora**
- Círculo / convites / `care_events` no feed — Sprint 7.
- Admin lendo consentimentos identificáveis — permanente fora.
- Painel DPO interno / ticket de suporte com dump clínico.
- Push remoto VAPID completo (opcional stretch; não bloqueia aceite se local + install ok).
- Tema contraste alto avançado; offline de hábitos com sync — pós-MVP.
- Editar todas as tags clínicas na Conta (isso é onboarding / “algo mudou” futuro); aqui: revogar/limpar e link “refazer personalização” se reaceitar.
- Foto de avatar real / upload biométrico.

### Aceite
1. `/account` mostra perfil público, consentimentos, exportar, excluir, e texto do motor.
2. Exportação inclui apenas dados **da pessoa autenticada**; formato legível (JSON); sem dados de outras pessoas; sem service role no client.
3. Revogar `health_personalization` impede `list_safe_*` de devolver conteúdo personalizado (comportamento atual do RPC) **e** limpa ou isola dado clínico conforme contrato Arquiteto.
4. Revogar ciclo/biometria limpa as tabelas correspondentes e registra auditoria.
5. Excluir conta remove `auth.users` (cascade) ou equivalente documentado; sessão encerra; login antigo não restaura dado.
6. Pessoa B não exporta nem apaga conta de A; RLS mantido.
7. Manifest + ícones: app instalável em Chromium mobile (e doc de limitação iOS/Safari).
8. SW: cache só de casca/assets públicos; zero cache de payloads clínicos, hábitos, export JSON.
9. Zero emoji; copy de consentimento informativa, não persuasiva; exclusão sem culpa.
10. Nenhum dado sensível em URL, analytics ou log de erro (ids opacos ok).

---

## 2. Educador Físico

### Regras (impacto indireto)
1. Revogar personalização de saúde **não** pode deixar a UI fingir que ainda há treino “seguro sob medida”. Sem consentimento → sem lista personalizada (já no RPC).
2. Texto “como o cuidado é escolhido” deve dizer: filtramos por restrições e capacidades **cadastradas**, sem inventar treino.
3. Não há tags novas neste sprint. Não reabrir catálogo clínico.

### QA clínico
- Após revogar saúde: `/workouts` vazio ou mensagem segura (não lista geral sem filtro fingindo segurança).

---

## 3. Nutricionista

### Regras (impacto indireto)
1. Mesma lógica em `/meals` após revogação de personalização.
2. Exportação pode listar `avoids_tags` / `diet_pattern` da pessoa — **sem** receita prescritiva gerada.
3. Sem tags alimentares novas.

### QA nutricional
- Pós-revogação: Comer não mostra cardápio “genérico perigoso” como se fosse filtrado.

---

## 4. Especialista LGPD — **aprovado com restrição**

### Inventário
| Dado / ato | Classificação | Finalidade | Onde |
|---|---|---|---|
| `display_name`, `gender_identity` | Público / identidade | Conta, futuro círculo | `user_profiles` |
| Consentimentos (histórico) | Auditoria | Prova de aceite/revogação | `lgpd_consent_logs` (só dono) |
| Clínica, nutrição, ciclo, biometria, hábitos | Sensível / hábito | Exportação e exclusão | tabelas `user_*`, `habit_logs` |
| Pedido de exclusão | Direito | Apagar conta | Auth + cascade |
| Manifest / ícones | Técnico | Instalação PWA | `public/` — sem PII |

### Consentimento e direitos
- **Acesso + portabilidade:** export JSON sob demanda (Server Action / rota autenticada).
- **Revogação:** append-only em `lgpd_consent_logs`; efeito colateral limpa ou isola finalidade.
- **Exclusão:** apagar conta Auth; cascade nas FKs existentes; confirmar que não sobra órfão sensível.
- **Terms:** se a pessoa revoga termos sem excluir, **bloquear uso do app** (tela Conta / middleware) até novo aceite **ou** forçar fluxo de exclusão — **não** deixar motor ativo sem base. Recomendação: revogar terms ⇒ CTA “Excluir conta” ou “Aceitar de novo”; sem meio-termo de biblioteca.

### Restrições
1. Export **não** vai para e-mail automático com anexo clínico no MVP (download na sessão).
2. Admin de conteúdo **não** acessa export nem logs de consentimento de quem usa.
3. Confirmação de exclusão deve evitar clique acidental (não um único tap).
4. Reativação de `health_personalization` exige novo aceite + fluxo para reinformar dados (pode redirecionar ao onboarding clínico mínimo — detalhar na implementação; se curto demais, Conta só reaceita e pede “completar de novo” em `/onboarding/...`).
5. SW/manifest: sem PII.

### Parecer
**Aprovado com restrição:** Conta com exportar/revogar/excluir + PWA casca. Bloqueado: e-mail com dump clínico, retenção pós-exclusão “para analytics”, cache SW de export/RPC, admin lendo consentimento alheio.

---

## 5. Gerente de Tecnologia — plano numerado

| # | Tarefa | Dono | Artefato | Depende de |
|---|---|---|---|---|
| 1 | Contratos de revogação/exclusão/export (efeito em tabelas) | Arquiteto + LGPD | nota neste doc | — |
| 2 | Migration se faltar RPC `delete_own_account` / `export` helper (security definer mínimo) | Backend | SQL | 1 |
| 3 | Server Actions: getAccountSnapshot, updatePublicProfile, revokeConsent, exportMyData, deleteMyAccount | Backend | `app/actions/account.ts` | 1–2 |
| 4 | UI Conta: seções perfil, motor, consentimentos, export, excluir | Frontend + UX | `app/(app)/account`, `components/account/*` | 3 |
| 5 | Copy pt-BR Conta + confirmações | UX Writer | `lib/i18n/account-pt-br.ts` | 4 |
| 6 | Manifest + ícones + metadata + register SW casca | DevOps + Frontend | `public/manifest.webmanifest`, ícones, `sw.js` | — |
| 7 | Garantir pós-revogação Mover/Comer/Hoje sem falso seguro | Frontend + Educador/Nutri | mensagens vazias | 3 |
| 8 | QA checklist + smoke (export shape, revoke, delete dry-run rules) | QA | `docs/features/sprint-06-qa-checklist.md` | 3–7 |
| 9 | Roadmap status | GT | este arquivo + roadmap | 8 |

**Ordem:** contratos → (migration/RPC se preciso) → actions → UI Conta → PWA → regressão motor pós-revogação → QA.

**Riscos:** exclusão incompleta no Auth (service role só servidor); iOS install limitado; pessoa revoga saúde e ainda vê conteúdo em cache client (mitigar `revalidatePath` + sem cache SW de dados); complexidade de “re-onboarding” após reaceite.

**Agentes:** PM, LGPD (central), Arquiteto, Backend, Frontend, UX, UX Writer, DevOps (PWA), Educador/Nutri (revisão pós-revogação), QA. Sem feature clínica nova.

---

## 6. Arquiteto

### Fronteira
- **Público editável na Conta:** `user_profiles.display_name`, `gender_identity` (opcional).
- **Sensível:** só via ações de export/revoke/delete do dono; nunca no layout público do círculo.
- **Conteúdo biblioteca:** permanece (admin); exclusão de conta **não** apaga exercícios/refeições.
- **Auth:** exclusão = `auth.admin.deleteUser` (service role **somente servidor**) **ou** Edge Function/`security definer` equivalente; client nunca recebe service role.

### Efeito da revogação (contrato)
| Purpose | Log | Efeito de dado | Efeito de produto |
|---|---|---|---|
| `health_personalization` | `accepted=false` | Zerar `user_clinical_conditions` (tags `{}`) e/ou apagar linha; avaliar se nutrição também entra na mesma finalidade (sim: motor de refeição depende do mesmo consent) → limpar ou manter nutrição **só se** houver purpose separado; **MVP: limpar clínica + nutrição juntos na revogação de health**, ciclo só se `cycle_module` | `list_safe_*` retorna vazio |
| `cycle_module` | `accepted=false` | `delete` `user_cycle_profiles` | tags de fase saem do motor |
| `biometrics` | `accepted=false` | limpar `weight_kg` (e altura se existir) | meta água deixa de sugerir por peso |
| `habit_reminders` | `accepted=false` | prefs de lembrete off (opcional) | sem Notification prompt |
| `terms` | `accepted=false` | sem wipe clínico automático | **bloquear app** até reaceite ou exclusão |

### Export (payload sugerido)
JSON com chaves em inglês (identifiers); labels humanos só se necessário em campo `label` separado:
- `exported_at`, `user_id`
- `profile` (público)
- `consents` (histórico purpose/accepted/recorded_at)
- `clinical`, `nutrition`, `cycle`, `biometrics`, `habit_prefs`, `habit_logs` (janela: todos ou últimos 90 dias — **preferir todos do dono no MVP** se volume baixo)
- **Não incluir:** JWT, role admin de terceiros, conteúdo da biblioteca global, dados de outras pessoas do círculo

### Exclusão
1. Verificar `auth.uid()`.
2. (Opcional) registrar último evento de auditoria se ainda possível.
3. `deleteUser` no Auth → cascade nas tabelas públicas.
4. Invalidar sessão; redirect `/login`.

Se cascade incompleto em alguma tabela futura, migration deve corrigir FKs **antes** do ship.

### RLS
Manter políticas dono. Export/delete via Server Action com client do user + admin delete só no server module. Sem policy nova que permita `select` amplo.

### Contratos (Server Actions)
```
getAccountSnapshotAction() -> {
  profile, consents: { purpose, accepted, recordedAt }[],
  hasClinical, hasNutrition, hasCycle, hasBiometrics
}

updatePublicProfileAction({ displayName, genderIdentity? })

revokeConsentAction({ purpose, accepted: false })
  // side effects per table above
reacceptConsentAction({ purpose }) // só abre aceite; health pode exigir onboarding

exportMyDataAction() -> { filename, json } // ou Response download

deleteMyAccountAction({ confirmation: string }) // confirmation === phrase pt-BR estável
```

Erros genéricos (`unauthenticated`, `forbidden`, `save_failed`, `invalid_confirmation`); sem stack clínica em log.

### Dia / PWA
- Manifest: `name`, `short_name`, `start_url: /home`, `display: standalone`, cores Santuário, ícones 192/512.
- SW: precache de `/`, CSS/font públicos se seguro; **network-only** para `/home`, actions, Supabase.

---

## 7. Designer UX + UX Writer

### Fluxo Conta
1. Entrar em Conta → ver nome + texto do motor (uma decisão por bloco).
2. Consentimentos: lista com estado “ativo / revogado” + botão Revogar.
3. Exportar → prepara download → feedback “arquivo pronto”.
4. Excluir → tela/passo de confirmação (frase a digitar) → adeus sem culpa → login.
5. PWA: banner ou bloco discreto “Instalar no aparelho” (só se `beforeinstallprompt` / instrução iOS), sem pressionar.

### Visual
Santuário; seções empilhadas; destrutivo em Warm Blush só na confirmação de exclusão; touch targets grandes; sem dashboard denso.

### Copy (pt-BR) — chaves sugeridas
| Chave | Texto |
|---|---|
| Título | Conta |
| Apoio | Seu perfil público, consentimentos e direitos sobre os dados. |
| Motor título | Como o cuidado é escolhido |
| Motor apoio | Usamos só o que você cadastrou (restrições e capacidades) para filtrar movimentos e refeições. Não geramos treino nem dieta por inteligência artificial. |
| Consentimentos | Seus consentimentos |
| Revogar | Revogar |
| Reativar | Aceitar de novo |
| Exportar | Exportar meus dados |
| Exportar apoio | Você recebe um arquivo com o que guardamos sobre você. |
| Excluir | Excluir minha conta |
| Excluir apoio | Apaga perfil, dados de saúde e hábitos ligados a esta conta. Não dá para desfazer. |
| Confirmar frase | Digite EXCLUIR para confirmar |
| Instalável | Instalar o Cuidado em Par |
| Instalável apoio | Atalho na tela inicial. Sem monitoramento clínico. |

Banidos: “nós cuidamos melhor se você deixar”, chantagem de revogação, “perderá todos os benefícios premium”, emoji, “deletar forever!!”.

---

## 8. DevOps (PWA)

1. `public/manifest.webmanifest` + ícones SVG/PNG simples (marca, sem foto de corpo).
2. Metadata `manifest` no `app/layout.tsx`.
3. Estender `public/sw.js`: precache allowlist de assets estáticos; **proibir** cache de rotas de dados.
4. Documentar: Android Chrome install; iOS Add to Home Screen.
5. Env: nenhum secret novo obrigatório; service role só se deleteUser no server (já existente em admin pattern — **não** expor).
6. Logs de SW sem payload.

---

## 9. QA

### Riscos
1. Export vaza dado de outra pessoa.
2. Revogou saúde mas Mover ainda lista exercícios (falso seguro / cache).
3. Exclusão deixa linhas órfãs sensíveis.
4. SW cacheia `/home` com ritual.
5. Confirmação frágil de exclusão (um tap).
6. Copy persuasiva em consentimento.

### Casos
| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | conta A completa | export | JSON só de A; contém profile + consents |
| 2 | health aceito | revogar health | log false; list_safe vazio; clínica limpa |
| 3 | ciclo ativo | revogar cycle | sem `user_cycle_profiles` |
| 4 | peso salvo | revogar biometrics | weight null |
| 5 | — | excluir com frase errada | não apaga |
| 6 | — | excluir com confirmação | user some; login falha com mesma senha/conta |
| 7 | B autenticado | tentar action com id de A | impossível / vazio |
| 8 | SW | offline fetch de API hábitos | sem resposta cacheada de saúde |
| 9 | Chromium | manifest | instalável ou critérios PWA ok |
| 10 | copy Conta | varrer | zero emoji/culpa |

### Critério de pronto
Aceite 1–10 verde; checklist QA aprovado; roadmap Sprint 6 → fechada.

---

## Próximo comando

**Sugerido:** `/nova-feature` Sprint 7 (já disponível em `docs/features/sprint-07-care-circle-pair.md`) ou `/implementar` Sprint 7.
