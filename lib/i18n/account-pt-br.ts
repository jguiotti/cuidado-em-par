export const accountCopy = {
  title: "Conta",
  support: "Seu perfil público, consentimentos e direitos sobre os dados.",
  loadError: "Não foi possível carregar a conta agora.",
  genericError: "Não foi possível concluir agora. Tente de novo.",
  saved: "Alterações salvas.",
  profile: {
    title: "Perfil público",
    support: "Nome visível no app. Sem dados de saúde nesta seção.",
    displayName: "Nome de exibição",
    genderIdentity: "Identidade de gênero (opcional)",
    genderHint: "Só para respeito. Não altera treino nem refeição.",
    save: "Salvar perfil",
  },
  motor: {
    title: "Como o cuidado é escolhido",
    support:
      "Usamos só o que você cadastrou (restrições e capacidades) para filtrar movimentos e refeições. Não geramos treino nem dieta por inteligência artificial.",
  },
  consents: {
    title: "Seus consentimentos",
    support: "Você pode revogar a qualquer momento. A revogação fica registrada.",
    active: "Ativo",
    revoked: "Revogado",
    never: "Ainda não registrado",
    revoke: "Revogar",
    reaccept: "Aceitar de novo",
    purposes: {
      terms: "Termos e privacidade",
      health_personalization: "Personalização de saúde (treino e refeição)",
      cycle_module: "Ciclo menstrual ou gestação",
      biometrics: "Peso para sugerir meta de água",
      habit_reminders: "Lembretes no aparelho",
    },
    healthReacceptHint:
      "Ao aceitar de novo, será preciso completar o cadastro de personalização.",
    termsGate:
      "Os termos estão revogados. Aceite de novo para usar o app, ou exclua a conta.",
    revokedHealth:
      "Personalização revogada. Mover e Comer ficam sem lista sob medida até novo aceite.",
  },
  export: {
    title: "Exportar meus dados",
    support: "Você recebe um arquivo com o que guardamos sobre você.",
    cta: "Baixar arquivo",
    ready: "Arquivo pronto para download.",
  },
  delete: {
    title: "Excluir minha conta",
    support:
      "Apaga perfil, dados de saúde e hábitos ligados a esta conta. Não dá para desfazer.",
    confirmLabel: "Digite EXCLUIR para confirmar",
    cta: "Excluir conta de forma permanente",
    invalid: "Confirmação incorreta. Digite EXCLUIR.",
  },
  install: {
    title: "Instalar o Cuidado em Par",
    support: "Atalho na tela inicial. Sem monitoramento clínico.",
    cta: "Instalar",
    iosHint:
      "No iPhone ou iPad: Compartilhar, depois Adicionar à Tela de Início.",
    unsupported: "Seu navegador não oferece instalação automática.",
  },
  habitsLink: "Ajustar hábitos",
  moveEmptyAfterRevoke:
    "Sem personalização de saúde ativa, não listamos movimentos sob medida.",
  eatEmptyAfterRevoke:
    "Sem personalização de saúde ativa, não listamos refeições sob medida.",
} as const;
