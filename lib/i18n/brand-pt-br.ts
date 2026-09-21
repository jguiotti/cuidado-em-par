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
  primaryCta: "Entrar com link seguro",
  secondaryCta: "Como cuidamos dos seus dados",
  accessNote: "Acesso por link no e-mail. Sem senha para memorizar.",
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
  emailLabel: "Seu e-mail",
  emailPlaceholder: "nome@exemplo.com",
  submit: "Entrar no santuário",
  submitting: "Enviando link...",
  firstAccess: "Primeiro acesso? O mesmo link cria seu espaço.",
  back: "Voltar ao início",
  authError: "Não foi possível concluir o acesso. Tente pedir um novo link.",
  privacyFooter:
    "Ambiente com privacidade protegida e adaptação para PCD e condições clínicas.",
  sendError:
    "Não foi possível enviar o link agora. Confira o e-mail e tente de novo.",
  rateLimitError:
    "Muitos pedidos de link em pouco tempo. Aguarde cerca de um minuto e tente de novo — é um limite de segurança do acesso por e-mail.",
  sendOk:
    "Se o e-mail estiver correto, você receberá um link de acesso em instantes.",
  envError:
    "Falta configurar o arquivo .env com a URL e a chave anon do Supabase. Depois reinicie o npm run dev.",
} as const;
