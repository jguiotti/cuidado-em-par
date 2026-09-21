export const appCopy = {
  nav: {
    home: "Início",
    move: "Rotina",
    eat: "Comer",
    habits: "Hábitos",
    circle: "Círculo",
    account: "Perfil",
  },
  move: {
    title: "Rotina de movimento",
    support:
      "Movimentos compatíveis com o seu perfil — sem ranking e sem cobrança estética.",
    empty:
      "Por enquanto não há movimento seguro listado para o seu perfil.",
    markDone: "Marquei como feito",
    marked: "Registrado para hoje.",
    unmarked: "Removido do registro de hoje.",
    todayCount: (n: number) =>
      n === 0
        ? "Nenhum movimento registrado hoje."
        : n === 1
          ? "1 movimento registrado hoje."
          : `${n} movimentos registrados hoje.`,
    equipment: "Equipamento",
    muscles: "Grupos",
    loadError: "Não foi possível carregar os movimentos agora.",
    safetyTitle: "Diretrizes de segurança",
    safetyBody:
      "A lista abaixo já passou pelo filtro do seu perfil. Em dor aguda, interrompa e busque orientação profissional.",
    autonomy:
      "Interrompa a qualquer instante se houver dor aguda. O conforto do seu corpo é o guia.",
    sequenceTitle: "Sequência sugerida",
    chipSafe: "Filtrado pelo seu perfil",
    chipBodyweight: "Peso corporal e itens domésticos",
  },
  eat: {
    title: "Comer com cuidado",
    support: "Ideias acessíveis, filtradas pelo que você evita.",
    empty: "Por enquanto não há refeição listada para o seu perfil.",
    markDone: "Marquei como feito",
    marked: "Registrado para hoje.",
    unmarked: "Removido do registro de hoje.",
    todayCount: (n: number) =>
      n === 0
        ? "Nenhuma refeição registrada hoje."
        : n === 1
          ? "1 refeição registrada hoje."
          : `${n} refeições registradas hoje.`,
    ingredients: "Ingredientes",
    alt: "Se preferir",
    allSlots: "Todas",
    loadError: "Não foi possível carregar as refeições agora.",
    filterLabel: "Momento da refeição",
  },
  habit: {
    genericError: "Não foi possível registrar agora. Tente de novo.",
  },
} as const;
