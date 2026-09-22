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

Em **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (local) ou a URL de produção
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/update-password`
  - `http://localhost:3000/**` (opcional)
  - o equivalente em produção

O app usa `redirectTo` = `{origin}/auth/callback?next=/auth/update-password`.
O callback troca o `code` (ou `token_hash`) pela sessão **gravando cookies na resposta** e só então abre a tela de senha nova.
