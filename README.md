# Cuidado em Par

PWA de saúde preventiva acessível: calistenia, refeições de baixo custo, hábitos e cuidado em dupla/grupo.

## Stack

- Next.js (App Router) + React + Tailwind CSS
- Supabase (Auth, PostgreSQL + RLS, Storage)

## Setup

1. Copie o ambiente:

```powershell
.\scripts\criar-env.ps1
```

2. Preencha `.env` com URL, anon key e service role do Supabase.

3. Instale e rode:

```powershell
npm install
npm run dev
```

4. No Supabase Auth, configure o redirect URL:

`http://localhost:3000/auth/callback`

5. Para acessar o backoffice (`/admin`), promova um usuário:

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'admin')
on conflict (user_id) do update set role = 'admin';
```

Aplique também a migration de seed de exercícios (Sprint 3) no SQL Editor, se ainda não rodou com as demais.

## Estrutura

- `app/(public)` — boas-vindas, login, termos
- `app/(app)` — área autenticada
- `app/(admin)` — backoffice de conteúdo (role `admin`)
- `lib/supabase` — clientes browser, server e service role
- `lib/tags` — slugs em inglês e labels em pt-BR
- `supabase/migrations` — schema e motor relacional
