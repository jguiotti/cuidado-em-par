# Sprint 8 — Grupo + endurecimento + conteúdo de lançamento

Comando de origem: `/nova-feature`  
Status: **fechado (QA smoke + auditorias)** — ver `docs/features/sprint-08-qa-checklist.md`. Manuais G2–G3/L em staging antes do anúncio público.  
Pré-existência: Sprint 7 dupla (`pair`) com convite, feed agregado `care_events`, sync a partir de `habit_logs`; RPC `create_care_pair` / `join_care_circle` (máx. 2 em pair; uma membership por pessoa); bibliotecas grandes (~146 exercícios, ~99 refeições) + motor `list_safe_*`; Conta LGPD + PWA; comandos `/auditoria-motor`, `/revisao-clinica-lgpd`, `/revisao-ux`, `/revisao-qa`.

Esta é a **última sprint do MVP** no roadmap.

---

## 1. Product Manager

### Problema e para quem
A dupla já existe; quem cuida em família, turma ou clã pequeno ainda não tem **grupo**. Além disso, antes do lançamento público, o produto precisa de **endurecimento**: auditorias clínicas/LGPD/UX/QA e uma **biblioteca mínima de lançamento** comprovadamente inclusiva (PCD sentado, gestação, celíaco, vegano, baixo custo) — sem depender de “espero que o seed cubra”.

### Pilares
Cuidado coletivo (grupo); inclusão radical; LGPD (mesmo isolamento da dupla); segurança clínica (motor auditado); operação de lançamento.

### Escopo do Sprint 8
**Entra**
1. **Grupo** (`care_circles.kind = group`):
   - criar grupo (nome); convite por código (mesmo fluxo da dupla);
   - entrar com código; limite **N membros** (recomendação MVP: **8**);
   - feed e privacidade **idênticos** à dupla (só `display_name` + kinds do dia);
   - sair / dissolver (criador dissolve);
   - UI Círculo: escolher criar **dupla** ou **grupo**; se já em círculo, mostrar o tipo;
   - manter regra MVP: **no máximo um** círculo ativo por pessoa (pair **ou** group).
2. **Endurecimento / auditorias** (artefatos em `docs/features/`):
   - `/auditoria-motor` → parecer motor seguro + matriz perfis×conteúdo;
   - `/revisao-clinica-lgpd` → lista de riscos e correções bloqueantes;
   - `/revisao-ux` → Círculo/Hoje/Conta (carga cognitiva, empty states);
   - `/revisao-qa` → regressão RLS, falso seguro, PWA cache.
3. **Biblioteca mínima de lançamento** (documentada + verificável):
   - checklist com cobertura mínima explícita (não só “temos 146”);
   - critérios: ≥1 caminho seguro para **seated-only**, **gestação (trimestre relevante)**, **evita gluten**, **vegan + low-cost**, **active-pause**;
   - script/smoke ou doc de IDs/slugs publicados que passam nos perfis sintéticos;
   - se faltar cobertura: seed/ajuste pontual **sem** inventar fisiologia por IA (Educador/Nutri fecham tags).

**Fora**
- Múltiplos círculos simultâneos por pessoa.
- Chat, stories, fotos, comentários, “reagiu ao cuidado”.
- Ranking, streak punitivo, comparativo de volume (quem fez mais kinds).
- Push remoto VAPID completo; tema contraste alto; offline sync de hábitos.
- Painel DPO / admin lendo consentimentos de quem usa.
- React Native (só manter componentização já pedida).
- Expandir biblioteca “para bater número” sem matriz de inclusão.

### Aceite
1. Criar grupo + convite + join até o limite N; (N+1)-ésima pessoa recebe erro claro.
2. Feed de grupo sem clínico / sem detalhe de hábito (paridade Sprint 7).
3. Pessoa em dupla não entra em grupo (e vice-versa) enquanto membership ativa.
4. UI distingue dupla vs grupo sem aumentar carga (uma decisão por bloco).
5. Artefato de auditoria do motor com parecer **seguro** ou lista de bloqueios corrigidos nesta sprint.
6. Artefato revisão clínica+LGPD sem bloqueio aberto de lançamento.
7. Checklist UX + QA de regressão fechados (ou blockers corrigidos).
8. Doc/smoke da biblioteca mínima de lançamento verde nos perfis sintéticos acordados.
9. Zero emoji; sem culpa; sem ranking corporal.
10. Roadmap Sprint 8 → fechada após `/implementar` + QA ⇒ **MVP pronto para lançamento** (com ressalvas documentadas, se houver).

---

## 2. Educador Físico

### Grupo
1. Mesmas regras da dupla: feed não lista exercício; só `workout` / `active-pause` agregados.
2. Grupo grande não muda intensidade clínica — o motor continua individual.

### Biblioteca mínima
1. Garantir conteúdos **seated** e **active-pause** publicados e seguros.
2. Conteúdos com contraindicação de gestação corretamente tagueados (não sumir tudo sem motivo; não vazar gesto inseguro).
3. Participar da `/auditoria-motor` (mapa condição → bloqueios).

### QA clínico
- Perfis sintéticos: torn-acl, seated-only, pregnancy-t2/t3 — nenhum falso seguro.

---

## 3. Nutricionista

### Grupo
1. Feed só `meal` agregado; sem prato/restrição.

### Biblioteca mínima
1. Cobertura **vegan + low-cost** e **gluten avoided** (perfil com `avoids_tags` contendo gluten não vê pratos com `contains_tags` gluten).
2. Participar da auditoria alimentar do motor.

### QA nutricional
- Perfis vegan e gluten-avoid: listas não vazias **e** sem item incompatível.

---

## 4. Especialista LGPD — **aprovado com restrição**

### Inventário (delta Sprint 8)
| Dado | Classificação | Nota |
|---|---|---|
| Grupo N membros | Público + eventos agregados | Mesma fronteira da dupla; risco de reidentificação sobe com N |
| Auditorias internas | Processo | Sem dump de produção com dado real de saúde |
| Checklist lançamento | Operacional | Sem PII |

### Regras
1. Grupo **não** amplia o que se compartilha — só o número de olhares no agregado.
2. Limite N (8) mitiga feed barulhento e pressão social; copy sem culpa permanece.
3. Auditorias usam perfis **sintéticos**; preview ≠ produção.
4. Continua bloqueado: admin conteúdo lendo clínica; cache SW de feed; export cruzado do par/grupo.

### Parecer
**Aprovado com restrição:** grupo com mesmo contrato de privacidade da dupla + auditorias documentadas. Bloqueado: feed clínico, analytics de kinds por pessoa identificável fora do círculo, retenção pós-exclusão.

---

## 5. Gerente de Tecnologia — plano numerado

| # | Tarefa | Dono | Artefato | Depende de |
|---|---|---|---|---|
| 1 | Contrato group: N máx, create/join/leave, UI escolha pair/group | Arquiteto + PM | nota neste doc | — |
| 2 | Migration/RPC: `create_care_group`, join com limite group, índices | Backend | SQL | 1 |
| 3 | Actions + UI Círculo (dupla **ou** grupo) | Backend + Frontend | `care-circle.ts`, `components/circle/*` | 2 |
| 4 | Copy grupo | UX Writer | `circle-pt-br.ts` | 3 |
| 5 | `/auditoria-motor` + correções bloqueantes | Educador + Nutri + Backend | `docs/features/sprint-08-motor-audit.md` | — |
| 6 | `/revisao-clinica-lgpd` | Educador/Nutri + LGPD | `docs/features/sprint-08-clinical-lgpd-review.md` | 5 |
| 7 | `/revisao-ux` + `/revisao-qa` | UX + QA | docs de revisão Sprint 8 | 3–4 |
| 8 | Biblioteca mínima: matriz + smoke de cobertura | Educador/Nutri + QA + Backend | `docs/features/sprint-08-launch-library.md` + script | 5 |
| 9 | QA checklist grupo + regressão MVP | QA | `docs/features/sprint-08-qa-checklist.md` | 3–8 |
| 10 | Roadmap: Sprint 8 fechada / MVP | GT | roadmap | 9 |

**Ordem sugerida:** contrato group → RPC/UI → auditoria motor (pode paralelizar com group) → revisões → matriz biblioteca → QA final.

**Riscos:** join group sem teto; UI confusa pair/group; auditoria revelar falso seguro tarde; smoke de biblioteca flaky sem DB.

**Agentes:** PM, LGPD, Arquiteto, Backend, Frontend, UX Writer, Educador, Nutri, QA, DevOps (só se env/PWA).

---

## 6. Arquiteto

### Fronteira
Inalterada vs Sprint 7: público = nome + events; sensível só dono.

### Schema / RPC
1. `create_care_group(p_name text)` — espelho de `create_care_pair`, `kind = 'group'`.
2. `join_care_circle`: se `kind = group` e `count >= 8` → `group_full`; pair continua máx. 2.
3. Manter **uma** membership por `user_id`.
4. `getMyCareCircleAction` deixa de filtrar só `pair` — retorna `kind: 'pair' | 'group'`.
5. Feed/listagem reutilizam `care_events` (já indexado).
6. Sem nova tabela; sem purpose LGPD novo (copy de privacidade cobre grupo).

### Contratos (delta)
```
createGroupAction({ name? }) -> { inviteCode, circleId }
// joinPairAction → renomear ou alias joinCircleAction(inviteCode) para pair e group

getMyCareCircleAction() -> {
  ...
  kind: 'pair' | 'group'
  memberLimit: 2 | 8
}
```

Erros novos: `group_full`.

### RLS
Sem afrouxar. Group mates já cobertos por `is_circle_member` / `is_circle_mate`.

---

## 7. Designer UX + UX Writer

### Fluxo Círculo (vazio)
1. Bloco privacidade (igual).
2. **Criar dupla** | **Criar grupo** (duas ações claras, não um formulário denso).
3. **Entrar com código** (único campo — o código define o tipo).

### Grupo ativo
- Título do grupo + contagem “3 de 8 pessoas”.
- Mesmo feed; lista de membros rolável; sair com confirmação.
- Sem mural / sem destaque de quem “lidera”.

### Copy (delta)
| Chave | Texto |
|---|---|
| Criar grupo | Criar grupo |
| Grupo apoio | Até 8 pessoas. Mesma privacidade da dupla: só o cuidado do dia, sem detalhes de saúde. |
| Membros N | {n} de {max} pessoas |
| group_full | Este grupo já está completo. |
| Tipo dupla / grupo | Dupla / Grupo |

Banidos: “competir com o grupo”, “último colocado”, emoji, pressão por frequência.

---

## 8. DevOps
1. Sem secret novo.
2. Garantir SW ainda network-only para `/circle` e dados.
3. Preview/staging com migrations 7+8 aplicadas para QA de grupo.
4. Documentar no checklist de lançamento: migrations obrigatórias listadas.

---

## 9. QA

### Riscos
1. Group sem limite / race no join.
2. Vazamento clínico em feed com mais membros.
3. Motor com falso seguro não pegado pela auditoria.
4. Biblioteca “mínima” documentada mas perfil seated/vegan vazio.
5. Regressão pair após mudar RPCs.

### Casos (grupo)
| # | Pré | Ação | Esperado |
|---|---|---|---|
| 1 | — | criar group | código; 1 membro |
| 2 | código | joins até 8 | ok |
| 3 | 8 membros | 9º join | `group_full` |
| 4 | em pair | criar group | `already_in_circle` |
| 5 | group | hábitos | feed agregado só kinds |
| 6 | B | clínica A | vazio |

### Casos (lançamento)
| # | Perfil sintético | Esperado |
|---|---|---|
| L1 | seated-only | ≥1 exercício; sem standing-only |
| L2 | torn-acl | sem high-impact/plyo bloqueados |
| L3 | pregnancy-t3 | sem contraindicações de gestação |
| L4 | vegan | só diet-compatible |
| L5 | avoids gluten | sem contains gluten |
| L6 | active-pause | ≥1 pausa na lista segura |

### Critério de pronto
Aceite 1–10; checklists QA + auditorias anexas; roadmap Sprint 8 **fechada** ⇒ MVP.

---

## Próximo comando

Plano coerente como fechamento do MVP: grupo fino + endurecimento + prova de biblioteca.

**Sugerido:** `/implementar` Sprint 8 (grupo + wire UI; em paralelo ou na sequência as auditorias e a matriz de lançamento), na ordem da seção 5.

Não implementar neste comando.
