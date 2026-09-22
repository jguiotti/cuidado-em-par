export const brandCopy = {
  name: "Cuidado em Par",
  /** Displayed in uppercase tracking on hero lockups. */
  tagline: "Movimento adaptado & bem-estar",
  taglineShort: "Santuário digital",
  lockupEyebrow: "Cuidado com a saúde no seu ritmo"
} as const;

export const welcomeCopy = {
  title: "Saúde acessível, no seu ritmo",
  support:
    "Treinos e refeições pensados para o seu corpo, com hábitos diários e companhia para manter a constância — sem mensalidade cara e sem promessa milagrosa.",
  primaryCta: "Entrar no santuário",
  secondaryCta: "Como cuidamos dos seus dados",
  accessNote: "Acesso com e-mail e senha. Sem link mágico a cada visita.",
  features: [
    {
      id: "safety",
      title: "Segurança no movimento",
      body: "Movimentos adaptados para desconforto lombar, gestação, mobilidade reduzida e retorno após reabilitação — sempre filtrados pelo seu perfil.",
      tone: "mint" as const,
    },
    {
      id: "circle",
      title: "Companhia em par",
      body: "Cultive hábitos com quem você confia, compartilhando só o cuidado do dia — sem comparação de corpos nem métricas que cobram.",
      tone: "blush" as const,
    },
    {
      id: "rhythm",
      title: "Ritmo sustentável",
      body: "Prática diária leve, no seu limite articular, com força funcional e acolhimento — sem cobrança estética.",
      tone: "mint" as const,
      centered: true,
    },
  ],
} as const;

export const loginCopy = {
  badge: "Santuário digital de movimento",
  title: "Boas-vindas ao seu espaço seguro de saúde e movimento",
  support:
    "Movimento acessível, respeito aos seus limites e acompanhamento preventivo contínuo — sem julgamento e sem exigência punitiva.",
  modeLabel: "Modo de acesso",
  modeSignIn: "Entrar",
  modeSignUp: "Criar conta",
  emailLabel: "Seu e-mail",
  emailPlaceholder: "nome@exemplo.com",
  passwordLabel: "Senha",
  passwordPlaceholder: "Mínimo de 8 caracteres",
  confirmPasswordLabel: "Confirmar senha",
  confirmPasswordPlaceholder: "Repita a senha",
  submit: "Entrar no santuário",
  submitSignUp: "Criar meu espaço",
  submitting: "Entrando...",
  submittingSignUp: "Criando conta...",
  signInHint: "Primeiro acesso? Use Criar conta com o mesmo e-mail.",
  signUpHint: "Já tem conta? Volte para Entrar.",
  forgotPassword: "Esqueci a senha",
  backToSignIn: "Voltar para Entrar",
  resetTitle: "Redefinir senha",
  resetSupport:
    "Enviamos um link seguro para o seu e-mail. Use-o para criar uma senha nova.",
  resetCta: "Enviar link de redefinição",
  resetSending: "Enviando...",
  resetEmailSent:
    "Se o e-mail estiver cadastrado, você receberá um link para criar uma senha nova. Confira também a caixa de spam.",
  updatePasswordTitle: "Crie uma senha nova",
  updatePasswordSupport:
    "Escolha uma senha com pelo menos 8 caracteres. Depois você já entra no seu espaço.",
  resetNewPasswordLabel: "Nova senha",
  resetSubmit: "Salvar senha e entrar",
  resetSubmitting: "Salvando...",
  resetPasswordSaved: "Senha atualizada. Bom cuidar.",
  resetSessionExpired:
    "Este link expirou ou já foi usado. Peça uma nova redefinição na tela de entrar.",
  rateLimitError:
    "Muitos e-mails em pouco tempo. Aguarde cerca de um minuto e tente de novo — é um limite do provedor de acesso.",
  recoverServerError:
    "O provedor não conseguiu enviar o e-mail de redefinição (erro interno). Cause comuns: template HTML, SMTP ou cota diária. Defina a senha sem e-mail: node scripts/set-user-password.cjs seu@email.com \"SenhaNova8\".",
  back: "Voltar ao início",
  authError: "Não foi possível concluir o acesso. Confira e-mail e senha.",
  privacyFooter:
    "Ambiente com privacidade protegida e adaptação para PCD e condições clínicas.",
  sendError:
    "Não foi possível concluir agora. Confira e-mail e senha e tente de novo.",
  invalidCredentials:
    "E-mail ou senha incorretos. Se a senha foi definida no painel do Supabase, confira se o usuário está com e-mail Confirmado e use o mesmo e-mail da conta. Ou use Esqueci a senha.",
  emailTaken:
    "Este e-mail já tem conta. Use Entrar com a senha cadastrada.",
  signUpConfirmEmail:
    "Conta criada. Abra o e-mail de confirmação para ativar o acesso — o link leva de volta ao app.",
  emailNotConfirmedSignIn:
    "Este e-mail ainda não foi confirmado. No Supabase: Authentication → Users → abra seu usuário → marque Confirm email (ou Confirmado) e salve. Depois tente entrar de novo.",
  passwordTooShort: "A senha precisa ter pelo menos 8 caracteres.",
  passwordMismatch: "As senhas não coincidem. Digite de novo.",
  envError:
    "Falta configurar o arquivo .env com a URL e a chave anon do Supabase. Depois reinicie o npm run dev.",
} as const;
