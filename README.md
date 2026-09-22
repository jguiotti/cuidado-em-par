# Cuidado em Par

**MVP finalizado (2026-09-22).** Ver `docs/mvp-finalizado.md`.

PWA de saúde preventiva e bem-estar: movimento adaptado, refeições acessíveis, hábitos diários e cuidado em companhia — sem mensalidade cara e sem promessa milagrosa.

[Sobre](#sobre) · [Funcionalidades](#principais-funcionalidades) · [Tecnologias](#tecnologias-utilizadas) · [Requisitos](#pré-requisitos) · [Instalação](#instalação) · [Configuração](#configuração) · [Motor de tags](#motor-relacional-de-tags) · [Documentação](#documentação) · [Deploy](#deploy) · [Contribuição](#contribuição) · [Licença](#licença)

---

## Sobre

O **Cuidado em Par** democratiza o acesso à saúde preventiva. A inteligência do sistema **não** é IA generativa: é o cruzamento relacional de tags (restrições do perfil × tags de conteúdo). Em dúvida clínica, o conteúdo é bloqueado.

Pensado para pessoas com pouco orçamento, PCD, lesões, restrições alimentares, quem menstrua ou gesta (opt-in), neurodivergência e quem quer constância em dupla ou grupo pequeno.

---

## Principais funcionalidades

- **Onboarding seguro** — consentimento LGPD antes de dado de saúde; condições clínicas, nutrição, ciclo (opt-in) e hábitos.
- **Motor de movimento** — calistenia e itens domésticos filtrados por lesão, capacidade, equipamento e fase de ciclo/gestação.
- **Motor alimentar** — refeições de baixo custo filtradas por restrições, padrão alimentar e aversões.
- **Ritual do dia** — água, sono, pausa ativa, plano de movimento e refeições; descanso conta como presença.
- **Círculo de cuidado** — dupla ou grupo; só sinais de constância, sem comparação de corpo nem dado clínico.
- **Conta e soberania** — perfil público isolado do sensível; exportação, consentimentos e exclusão.
- **Backoffice** — cadastro e publicação de exercícios e refeições (papel `admin`), com enriquecimento clínico/nutricional.
- **PWA mobile-first** — santuário digital (Verde Menta / Warm Blush), tonal layering, sem borda dura.

---

## Tecnologias utilizadas

| Camada | Stack |
| --- | --- |
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Server Actions, Supabase Auth |
| Banco | PostgreSQL (Supabase) com RLS e funções `list_safe_*` |
| Infra | Vercel (frontend), Supabase (Auth, DB, Storage) |
| Linguagem | TypeScript; identificadores em inglês; UI em pt-BR |

---

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Projeto Supabase (URL, anon key e service role)
- Conta Vercel (opcional, para deploy)

---

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/jguiotti/cuidado-em-par.git
cd cuidado-em-par
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente:

```powershell
.\scripts\criar-env.ps1
```

Ou copie manualmente:

```bash
cp .env.example .env
```

4. Preencha o `.env` (veja [Configuração](#configuração)).

5. Aplique as migrations no Supabase (SQL Editor ou CLI), na ordem de `supabase/migrations/`.

6. Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Configuração

### Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Só desenvolvimento local — nunca em produção
# DEV_AUTH_BYPASS=true
```

- A **anon key** passa pelo RLS e pode ir ao browser (`NEXT_PUBLIC_*`).
- A **service role** é só servidor/scripts. Nunca use em Client Components nem em `NEXT_PUBLIC_*`.
- Depois de salvar o `.env`, reinicie o `npm run dev`.

### Auth (Supabase)

Em **Authentication → URL Configuration**:

1. **Site URL** = domínio da Vercel (ex.: `https://seu-app.vercel.app`), não `localhost`.
2. **Redirect URLs** devem incluir produção **e** local, por exemplo:

```text
https://seu-app.vercel.app/auth/callback
https://seu-app.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Se o redirect de produção não estiver na lista, o e-mail de confirmação/redefinição usa o Site URL e cai em `localhost`.

Detalhes e templates: `docs/email-templates/README.md`.

### Papel de admin (backoffice)

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'admin')
on conflict (user_id) do update set role = 'admin';
```

### Scripts úteis de segurança clínica

```bash
npx tsx scripts/educador-exercise-safety-audit.ts
npx tsx scripts/nutricionista-meal-safety-audit.ts
```

---

## Motor relacional de tags

O filtro seguro acontece **no banco** (`list_safe_exercises`, `list_safe_meals`), não só na UI.

| Motor | Bloqueia quando |
| --- | --- |
| Exercícios | Contraindicações ∩ condições/fases; capabilities (postura em **OR**: standing \| seated \| lying; demais em **AND**); equipamento specialty; `tag_block_rules` × `intensity_tags` |
| Refeições | `contains_tags` ∩ `avoids_tags`; `diet_pattern`; aversões sem substituto (`alt`) |
| Ciclo | Fases em `user_cycle_profiles.phase_tags` — T1 e postpartum (impacto/pliometria); T2/T3 (+ prono, intensidade, inversão conforme fase) |

Fontes de verdade: `lib/clinical/conditions-catalog.ts`, `lib/nutrition/food-conditions-catalog.ts`, `docs/arquitetura-e-regras-de-negocio.md`.

Em dúvida clínica ou de alergia: **bloquear**.

---

## Documentação

| Doc | Conteúdo |
| --- | --- |
| `docs/mvp-finalizado.md` | Fechamento oficial do MVP |
| `docs/arquitetura-e-regras-de-negocio.md` | Modelo de dados, RLS, motor |
| `docs/roadmap-pos-mvp-e-sprints.md` | Histórico de sprints + ideias pós-MVP |
| `docs/features/` | Planos e checklists por sprint |
| `docs/features/auth-password-mvp.md` | Auth e-mail + senha |

---

## Estrutura do repositório

```text
app/(public)     Boas-vindas, login, termos
app/(app)        Área autenticada (hoje, rotina, comer, círculo, progresso, conta)
app/(admin)      Backoffice de conteúdo
app/(onboarding) Wizard de cadastro
lib/             Domínio, tags, i18n pt-BR, Supabase
components/      UI e blocos por domínio
supabase/migrations  Schema, RLS, motor, seeds
scripts/         Seeds, sync clínico/nutricional, auditorias
docs/            Arquitetura e planos de sprint
```

---

## Deploy

Otimizado para **Vercel** + projeto Supabase de produção.

1. Configure as mesmas variáveis de ambiente no painel da Vercel.
2. Aplique todas as migrations no Supabase de produção.
3. Atualize as URLs de redirect do Auth.
4. Não aponte preview da Vercel para dump de dados reais de saúde.

---

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`.
3. Siga `.cursor/rules/13-coding-standards.mdc` (código/SQL em inglês; textos de UI em pt-BR).
4. Rode as auditorias do motor antes de publicar conteúdo clínico ou alimentar.
5. Abra um Pull Request com o contexto da mudança.

Comandos da squad (Cursor): `/nova-feature`, `/implementar`, `/revisao-ux`, `/revisao-qa`, `/revisao-clinica-lgpd`, `/auditoria-motor`.

---

## Licença

Uso interno / conforme política do repositório. Ajuste este trecho se publicar sob MIT ou outra licença.

---

Desenvolvido com ❤️ por [Janaina Guiotti](https://forgeproductstudio.com/)
