export const accountCopy = {
  title: "Conta",
  support: "Perfil público, cuidados de saúde editáveis, consentimentos e direitos sobre os dados.",
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
  healthEdit: {
    title: "Cuidados que mudam com o tempo",
    support:
      "Lesões, mobilidade e alimentação podem mudar. Ao salvar, treinos e refeições são filtrados de novo com o que vale agora.",
    clinicalTitle: "Condições e lesões",
    clinicalSupport:
      "Adicione o que surgiu ou remova o que já não se aplica — por exemplo, após uma cirurgia ou uma nova lesão.",
    nutritionTitle: "Alimentação e restrições",
    nutritionSupport:
      "Padrão alimentar e alergias ou intolerâncias. O cardápio seguro acompanha cada alteração.",
    save: "Salvar cuidados",
    motorHint:
      "As listas de Mover e Comer passam a usar só o perfil atualizado.",
  },
  cycle: {
    title: "Calendário do ciclo",
    support:
      "Estimativa pelo método do calendário, para você acompanhar menstruação, janela fértil e atraso. Não é diagnóstico nem método contraceptivo.",
    inactive:
      "O acompanhamento de ciclo não está ativo. Ative em Consentimentos (Ciclo menstrual ou gestação) e escolha o modo menstrual no cadastro de cuidados.",
    pregnancyMode:
      "Você marcou possível gestação. O calendário menstrual fica pausado enquanto o modo gestação estiver ativo.",
    lastPeriod: "Início da última menstruação",
    cycleLength: "Duração média do ciclo (dias)",
    periodLength: "Duração média do sangramento (dias)",
    logPeriod: "Registrar que a menstruação começou hoje",
    logPeriodOther: "Registrar início em outra data",
    saveSettings: "Salvar calendário",
    possiblePregnancy: "Marcar possível gestação",
    possiblePregnancyHint:
      "Troca o cuidado para modo gestação (1º trimestre) e adapta movimentos. Confirme com profissional de saúde.",
    remindersTitle: "Lembretes do ciclo",
    remindPeriod: "Avisar quando a menstruação estiver próxima",
    remindFertile: "Avisar no início da janela fértil estimada",
    remindLate: "Avisar se o ciclo atrasar muito (cadastrar ou possível gestação)",
    legendPeriod: "Menstruação",
    legendFertile: "Janela fértil",
    legendOvulation: "Ovulação estimada",
    legendPredicted: "Próxima menstruação (estimada)",
    legendLate: "Atraso",
    monthPrev: "Mês anterior",
    monthNext: "Próximo mês",
    weekdays: ["D", "S", "T", "Q", "Q", "S", "S"] as const,
    disclaimer:
      "Estimativas educativas. Em dúvida clínica, procure atendimento de saúde.",
  },
  cycleAlerts: {
    periodApproaching: (days: number) =>
      days === 1
        ? "A menstruação estimada fica a cerca de 1 dia."
        : `A menstruação estimada fica a cerca de ${days} dias.`,
    fertileStarting: "A janela fértil estimada começa por estes dias.",
    late: (days: number) =>
      days === 1
        ? "O ciclo parece 1 dia atrasado. Dá para registrar a menstruação ou marcar possível gestação na Conta."
        : `O ciclo parece ${days} dias atrasado. Dá para registrar a menstruação ou marcar possível gestação na Conta.`,
    openCycle: "Abrir calendário do ciclo",
  },
} as const;
