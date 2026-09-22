export const habitsCopy = {
  navToday: "Início",
  home: {
    title: "Início",
    greeting: "Olá. Como está seu corpo hoje?",
    support:
      "Espaço calmo para constância: água, descanso, pausa, movimento e refeição — no seu ritmo.",
    dateLabel: (isoDay: string) => {
      const [y, m, d] = isoDay.split("-").map(Number);
      if (!y || !m || !d) {
        return isoDay;
      }
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(Date.UTC(y, m - 1, d, 12)));
    },
    safetyPill: "Filtros seguros ativos",
    ringsTitle: "Anéis de hábitos do dia",
    ringsHint: "Sem cobrança",
    practiceTitle: "Sua prática de hoje",
    practiceSupport:
      "Sugestões filtradas pelo seu perfil — abra e registre com calma.",
    motto:
      "Respeite os limites do seu dia. Movimento é autocuidado compartilhado.",
    loadError: "Não foi possível carregar o cuidado de hoje.",
    circleEyebrow: "Apoio em par",
    circleEmpty:
      "Quando alguém do círculo registrar o dia, aparece um sinal leve aqui.",
    circleMate: (name: string) =>
      `${name} já registrou cuidado hoje — sem detalhes de saúde.`,
    circleProgress: (n: number, goal: number) =>
      `${n} de ${goal} dias de cuidado em companhia nesta semana.`,
    circleNudge: (name: string) => `${name} enviou um carinho hoje.`,
    circleOpen: "Abrir círculo",
    openMove: "Começar prática",
    openEat: "Ver refeição",
    moveChip: "Movimento seguro",
    eatChip: "Nutrição acessível",
    lowCostChip: "Baixo custo",
  },
  restDay: {
    title: "Hoje não consigo",
    support:
      "Registrar descanso conta como presença no círculo — sem detalhes de saúde e sem culpa.",
    cta: "Registrar descanso hoje",
    done: "Descanso registrado hoje",
    undo: "Remover registro de descanso",
    error: "Não foi possível atualizar agora. Tente de novo.",
  },
  water: {
    title: "Água de hoje",
    meta: (n: number) => `Meta: ${n} ml`,
    total: (n: number) => `${n} ml hoje`,
    add: (n: number) => `+ ${n} ml`,
    progressLabel: "Progresso da água de hoje",
    ringLabel: "Hidratação",
    ringDetail: (total: number, goal: number) =>
      `${total.toLocaleString("pt-BR")} de ${goal.toLocaleString("pt-BR")} ml`,
  },
  sleep: {
    title: "Como foi o descanso?",
    support: "Registro subjetivo do dia. Não é avaliação clínica.",
    poor: "Difícil",
    ok: "Ok",
    good: "Bom",
    hoursLabel: "Quantas horas você dormiu? (opcional)",
    hoursHint: "Ex.: 6 ou 6,5. O sistema converte para o registro do dia.",
    invalidHours: "Informe um número de horas entre 0 e 24.",
    save: "Salvar descanso",
    saved: "Descanso registrado para hoje.",
    qualityLegend: "Qualidade do descanso",
    ringLabel: "Descanso",
    ringEmpty: "Ainda sem registro hoje.",
    ringDetail: (minutes: number | null) =>
      minutes != null
        ? `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")} registradas`
        : "Qualidade registrada para hoje.",
    adjust: "Ajustar",
    cancelAdjust: "Fechar ajuste",
  },
  pause: {
    title: "Pausa ativa",
    support: "Cinco minutos de movimento leve, a cada cerca de 90 minutos.",
    reminderEyebrow: "Lembrete de pausa ativa",
    suggestion: (title: string) =>
      `Sugestão filtrada para você: ${title}.`,
    listTitle: "Movimentos leves compatíveis com seu perfil",
    markDone: "Registrar pausa (5 min)",
    marked: (n: number) =>
      n === 1
        ? "1 pausa registrada hoje."
        : `${n} pausas registradas hoje.`,
    countLabel: (n: number) =>
      n === 0
        ? "Nenhuma pausa ainda hoje."
        : n === 1
          ? "1 pausa hoje"
          : `${n} pausas hoje`,
    unmarked: "Pausas de hoje removidas do registro.",
    resetToday: "Zerar pausas de hoje",
    empty:
      "Por enquanto não há movimento de pausa listado para o seu perfil.",
    openMove: "Ver mais movimentos",
  },
  move: {
    title: "Mover",
    done: (n: number) =>
      n === 1
        ? "1 movimento registrado hoje."
        : `${n} movimentos registrados hoje.`,
    pending: "Ainda sem registro de movimento hoje.",
    open: "Abrir Rotina",
  },
  eat: {
    title: "Comer",
    done: (n: number) =>
      n === 1
        ? "1 refeição registrada hoje."
        : `${n} refeições registradas hoje.`,
    pending: "Ainda sem registro de refeição hoje.",
    open: "Abrir Comer",
  },
  reminders: {
    title: "Lembretes no aparelho",
    support:
      "Podemos lembrar água e pausa. Você pode desligar quando quiser. Não é monitoramento clínico.",
    ctaOn: "Quero lembretes",
    ctaOff: "Sem lembretes",
    enabled: "Lembretes ativos neste aparelho.",
    denied:
      "O navegador bloqueou notificações. Você pode mudar isso nas configurações do aparelho.",
    unsupported: "Este navegador não oferece notificações locais.",
    waterTitle: "Água",
    waterBody: "Um gole de água quando fizer sentido.",
    pauseTitle: "Pausa ativa",
    pauseBody: "Cinco minutos de movimento leve, se couber agora.",
  },
  prefs: {
    title: "Ajustar hábitos",
    support: "Metas e lembretes só você vê e altera.",
    waterLabel: "Meta de água (ml)",
    waterReminder: "Lembrete de água",
    sleepReminder: "Lembrete de descanso",
    sleepBedtimeLabel: "Horário alvo para deitar (opcional)",
    pauseEnabled: "Lembrete de pausa ativa",
    pauseIntervalLabel: "Intervalo da pausa (minutos)",
    save: "Salvar preferências",
    saved: "Preferências salvas.",
    errorWater: "Informe uma meta entre 250 e 8000 ml.",
    errorInterval: "Informe um intervalo entre 30 e 240 minutos.",
    linkFromHome: "Ajustar hábitos",
  },
  genericError: "Não foi possível registrar agora. Tente de novo.",
  statusDone: "Feito",
  statusPending: "Em aberto",
} as const;
