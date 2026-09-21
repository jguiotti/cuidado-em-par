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

## Estrutura

- `app/(public)` — boas-vindas, login, termos
- `app/(app)` — área autenticada
- `app/(admin)` — backoffice de conteúdo (role `admin`)
- `lib/supabase` — clientes browser, server e service role
- `lib/tags` — slugs em inglês e labels em pt-BR
- `supabase/migrations` — schema e motor relacional
