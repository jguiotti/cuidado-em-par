# Templates de e-mail (Supabase Auth)

Arquivos prontos para colar no Dashboard:

| Template no Supabase | Arquivo |
|---|---|
| Confirm signup | [`confirm-signup.html`](./confirm-signup.html) |
| Reset password | [`reset-password.html`](./reset-password.html) |

## Como colar

1. Abra **Authentication → Email Templates**.
2. Em cada template, cole **somente o HTML** do arquivo (corpo completo).
3. Subject sugeridos:
   - Confirm: `Confirme seu e-mail — Cuidado em Par`
   - Reset: `Redefina sua senha — Cuidado em Par`
4. Salve e teste **Send test e-mail** no Dashboard, se existir.

Os templates foram simplificados (sem imagem externa nem CSS avançado) para evitar **500** no endpoint `/recover` por falha ao renderizar o template.

## Se `/recover` retornar 500

1. Cole de novo `reset-password.html` (versão simplificada).
2. Confira **Authentication → Logs** (erro de SMTP ou template).
3. Cota diária de e-mail do plano gratuito esgotada também pode falhar o envio.
4. Enquanto o e-mail estiver quebrado, defina a senha **sem e-mail**:

```bash
node scripts/set-user-password.cjs seu@email.com "SenhaNova8"
```

(O script carrega `.env` / `.env.local` sozinho.)

## Variáveis usadas

- `{{ .ConfirmationURL }}` — link de confirmação ou redefinição

## Site URL e Redirect

Em **Authentication → URL Configuration** (Dashboard do Supabase):

### Produção (obrigatório para e-mails não irem para localhost)

1. **Site URL** = URL pública do app na Vercel, **sem** barra no final  
   Ex.: `https://cuidado-em-par.vercel.app` (use o domínio real do deploy).
2. Em **Redirect URLs**, inclua **todas** estas linhas (uma por linha):

```text
https://SEU-DOMINIO.vercel.app/auth/callback
https://SEU-DOMINIO.vercel.app/auth/callback/**
https://SEU-DOMINIO.vercel.app/auth/update-password
https://SEU-DOMINIO.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback/**
http://localhost:3000/auth/update-password
http://localhost:3000/**
```

Troque `SEU-DOMINIO.vercel.app` pelo host real (incluindo domínio customizado, se houver).

Se o redirect enviado pelo app **não** estiver nesta lista, o Supabase **ignora** e monta o link do e-mail com o **Site URL** (por isso aparece `localhost`).

### Local

Mantenha `http://localhost:3000/**` na lista para desenvolvimento.  
O **Site URL** em projeto compartilhado de staging/prod deve ser a URL de **produção**, não localhost.

O app envia `emailRedirectTo` / `redirectTo` = `{origin}/auth/callback?next=...`.  
O callback troca o `code` (ou `token_hash`) pela sessão **gravando cookies na resposta** e só então abre a home ou a tela de senha nova.

Depois de alterar Site URL / Redirect URLs, **peça um novo e-mail** (criar conta de novo ou reenviar confirmação). Links antigos no inbox continuam apontando para o destino antigo.
