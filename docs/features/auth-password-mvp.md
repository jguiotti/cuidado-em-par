# Auth MVP — e-mail + senha

**Status:** entregue no MVP finalizado (2026-09-22).

Fluxo principal: **e-mail + senha**. Magic link não é o caminho feliz (legado apenas).

## Configuração no Supabase Dashboard

1. **Authentication → Providers → Email**
   - E-mail habilitado; login com senha ativo.

2. **Confirm email**
   - Pode ficar **ligado** se o template de confirmação estiver configurado (`docs/email-templates/`).
   - Sem confirmação, o app entra direto após `signUp`.
   - Com confirmação, o app pede para abrir o e-mail e só libera o login depois.

3. **Email Templates**
   - Cole os HTML de `docs/email-templates/confirm-signup.html` e `reset-password.html`.
   - Ver `docs/email-templates/README.md`.

4. **URL Configuration**
   - Site URL = URL do app.
   - Redirect URLs: incluir `/auth/callback` (local e produção).

## Conta — definir senha

Na tela **Conta**, painel **Senha de acesso**: quem entrou por magic link legado (ou quer trocar a senha) define uma nova sem sair do app (`updateUser`).

## Login — esqueci a senha

1. Em Entrar → **Esqueci a senha**.
2. E-mail com link → `/auth/callback?next=/auth/update-password`.
3. Pessoa define a senha nova e segue para `/home`.

## Contas legadas (só magic link)

- Definir senha em **Conta** (recomendado: o app confirma o e-mail no provedor ao salvar), ou
- **Esqueci a senha**, ou
- No Dashboard: Authentication → Users → usuário → **definir senha** e marcar **Confirm email / Confirmado**.

### Erro 500 em `recover` (redefinir senha)

Quase sempre é **lado Supabase**, não o formulário:

1. Template HTML inválido → cole de novo `docs/email-templates/reset-password.html` (versão simples).
2. Cota diária de e-mail esgotada / SMTP.
3. Veja **Authentication → Logs**.

Enquanto o e-mail falhar, defina a senha sem enviar e-mail:

```bash
node scripts/set-user-password.cjs seu@email.com "SenhaNova8"
```

(O script lê `.env` ou `.env.local` na raiz. Neste repo o arquivo é `.env`.)

Depois entre no app com esse e-mail e senha.

### Erro 400 `invalid_credentials` com e-mail já confirmado

A senha do Dashboard muitas vezes **não grava** de fato. Use o script acima (service role) — é o caminho confiável.

## Favicon

Fonte da verdade: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` (convenção do App Router). Também em `public/favicon.ico` e `public/icons/icon.png`.

Se a aba ainda mostrar ícone antigo: pare o `next dev`, apague `.next`, reinicie; em produção, faça redeploy. Anônimo sozinho não basta se o deploy antigo ainda estiver no ar.

## Checklist rápido

- [ ] Templates de e-mail colados
- [ ] Redirect URLs com `/auth/callback`
- [ ] Criar conta → e-mail de confirmação (se Confirm ligado) ou sessão direta
- [ ] Conta → salvar senha nova
- [ ] Login → Esqueci a senha → link → nova senha
- [ ] Favicon das duas figuras após limpar `.next` / redeploy
