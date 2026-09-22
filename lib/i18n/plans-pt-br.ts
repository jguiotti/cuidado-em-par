import type { CardioSuggestion } from "@/lib/plans/daily-movement";
import type { MealSlot } from "@/lib/tags/constants";

export const plansCopy = {
  movement: {
    title: "Movimento de hoje",
    restTitle: "Dia de descanso planejado",
    restSupport:
      "Hoje não há série marcada. Se quiser, registre uma caminhada leve ou só cuide da água e do sono.",
    minutesTarget: (n: number) => `Meta de cerca de ${n} min`,
    mixHint: "Mistura membros inferiores e superiores no seu tempo disponível.",
    empty:
      "Ainda não há movimentos seguros para montar o plano. Revise condições na Conta se precisar.",
    markDone: "Marquei como feito",
    done: "Feito",
    swap: "Trocar",
    swapPick: "Escolha outro movimento seguro",
    duration: (n: number) => `${n} min`,
    openLibrary: "Ver biblioteca completa",
  },
  meals: {
    title: "Refeições de hoje",
    support: "Sugestões filtradas. Dá para trocar ou registrar a refeição que você fez.",
    slots: {
      breakfast: "Café da manhã",
      lunch: "Almoço",
      snack: "Lanche",
      dinner: "Jantar",
    } satisfies Record<MealSlot, string>,
    empty: "Sem sugestão segura neste horário.",
    markDone: "Marquei como feita",
    swap: "Trocar",
    swapPick: "Escolha outra refeição segura",
    custom: "Registrar a minha",
    customLabel: "O que você comeu?",
    customPlaceholder: "Ex.: arroz, feijão e ovo",
    customSave: "Salvar no histórico",
    customDone: (note: string) => `Registrada: ${note}`,
    openLibrary: "Ver cardápio completo",
  },
  cardio: {
    title: "Caminhada ou corrida",
    support:
      "Estimativa do seu dia. Distância é opcional. Não substitui orientação profissional.",
    walk: "Caminhada",
    run: "Corrida",
    minutes: "Minutos",
    distance: "Distância (metros, opcional)",
    save: "Registrar",
    saved: "Cardio registrado para hoje.",
    suggestion: {
      walk: "Sugestão de hoje: caminhada leve, no seu ritmo.",
      run: "Sugestão de hoje: corrida leve, só se o corpo permitir.",
      seated: "Sugestão: movimento cardio sentado da biblioteca (sem corrida).",
      none: "Sem sugestão de cardio ao ar livre hoje.",
    } satisfies Record<CardioSuggestion, string>,
  },
  availability: {
    title: "Tempo para se mover",
    support:
      "Dias da semana e minutos por dia. O plano de hoje usa isso para escolher movimentos seguros.",
    minutes: "Minutos por dia de treino",
    weekdays: "Dias com treino planejado",
    weekdayLabels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const,
    save: "Salvar disponibilidade",
    saved: "Disponibilidade salva. O próximo plano do dia usa o novo tempo.",
    errorMinutes: "Informe entre 5 e 120 minutos.",
  },
  genericError: "Não foi possível concluir agora. Tente de novo.",
} as const;

export const progressCopy = {
  title: "Progresso",
  support:
    "Acompanhe a constância do cuidado. Medidas corporais são opcionais e só suas.",
  loadError: "Não foi possível carregar o progresso agora.",
  range7: "7 dias",
  range30: "30 dias",
  careDays: (n: number, total: number) =>
    n === 1
      ? `1 dia com cuidado nos últimos ${total}`
      : `${n} dias com cuidado nos últimos ${total}`,
  consistencyTitle: "Constância",
  water: "Água",
  sleep: "Descanso",
  pause: "Pausa",
  workout: "Movimento",
  meal: "Refeição",
  cardio: "Cardio",
  cardioSummary: (minutes: number, meters: number) => {
    const km =
      meters > 0 ? ` · ${(meters / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km` : "";
    return `${minutes} min${km}`;
  },
  dayCare: "Cuidou",
  dayRest: "Sem registro",
  measurementsTitle: "Peso e medidas (opcional)",
  measurementsSupport:
    "Só se fizer sentido para você. Sem ranking, sem IMC e sem cobrança estética.",
  needConsent:
    "Para registrar peso ou medidas, aceite o uso de biometria em Consentimentos na Conta.",
  weight: "Peso (kg)",
  waist: "Cintura (cm)",
  hip: "Quadril (cm)",
  saveMeasurement: "Salvar registro de hoje",
  saved: "Registro salvo.",
  history: "Histórico recente",
  emptyHistory: "Nenhum registro de medidas neste período.",
  currentWeight: (kg: number) =>
    `Peso atual cadastrado: ${kg.toLocaleString("pt-BR")} kg`,
  delta: (label: string, value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${label}: ${sign}${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`;
  },
  openAccount: "Abrir Conta",
  openHabits: "Ajustar hábitos e tempo de treino",
} as const;
