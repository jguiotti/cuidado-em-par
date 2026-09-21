import type { HealthFocus } from "@/lib/tags/constants";

export const onboardingCopy = {
  progressLabel: (current: number, total: number) =>
    `Passo ${current} de ${total}`,
  genericError:
    "Não foi possível salvar agora. Tente de novo em instantes.",
  sessionExpired: "Sua sessão expirou. Entre novamente para continuar.",
  saving: "Salvando...",
  continueCta: "Continuar",
  skipCta: "Pular por agora",
  consent: {
    title: "Antes de continuar",
    support:
      "Vamos pedir só o necessário para cuidar com segurança. Você pode mudar de ideia depois na Conta.",
    termsLabel:
      "Li e aceito os termos de uso e a política de privacidade.",
    healthLabel:
      "Autorizo o uso dos meus dados de saúde para sugerir treinos e refeições compatíveis com o meu contexto.",
    privacyLink: "Ler resumo de privacidade",
    cta: "Continuar",
    errorBothRequired:
      "Para seguir, é preciso aceitar os dois itens. São eles que protegem você e deixam claro o que fazemos com os dados.",
  },
  identity: {
    title: "Como podemos te chamar?",
    support:
      "Esse nome aparece para você e, se quiser, para quem cuidar junto.",
    displayNameLabel: "Apelido ou nome",
    displayNamePlaceholder: "Como prefere aparecer neste espaço",
    genderLabel: "Identidade de gênero (opcional)",
    genderPlaceholder: "Escreva do seu jeito",
    skipGender: "Prefiro não informar",
    cta: "Continuar",
    errorName: "Informe como podemos te chamar (pelo menos 2 caracteres).",
  },
  focus: {
    title: "Qual o seu foco de cuidado agora?",
    support:
      "Escolha o que faz mais sentido neste momento. Dá para mudar depois.",
    bodyCompositionHint:
      "Sem ranking e sem cobrança estética — só para alinhar sugestões.",
    weightTitle: "Peso (opcional)",
    weightSupport:
      "Usamos só para sugerir uma meta de água. Você pode pular.",
    weightLabel: "Peso em kg",
    weightConsent:
      "Autorizo guardar meu peso só para a meta de hidratação.",
    cta: "Continuar",
    errorFocus: "Escolha um foco para continuar.",
    errorWeightConsent:
      "Se informar o peso, marque a autorização de uso.",
    errorWeightInvalid: "Informe um peso válido em quilogramas.",
  },
  sexAssigned: {
    title: "Sexo atribuído ao nascer",
    support:
      "Essa pergunta é opcional. Com essa escolha, conseguimos montar treinos e refeições mais adequados ao seu corpo — inclusive quando há ciclo menstrual ou gestação. Não assumimos a sua identidade de gênero. Na sequência você decide se quer adaptar a rotina ao ciclo ou à gestação.",
    whyTitle: "Por que perguntamos",
    whyBody:
      "Ciclo e gestação podem mudar energia, recuperação e a intensidade segura do movimento, além de algumas escolhas alimentares. As opções são fechadas só para oferecer esse cuidado com mais clareza.",
    cta: "Continuar",
    skip: "Pular por agora",
    labels: {
      female: "Feminino",
      male: "Masculino",
      intersex: "Intersexo",
      prefer_not_to_say: "Prefiro não informar",
    },
  },
  clinical: {
    title: "Condições que pedem cuidado",
    support:
      "Digite para buscar e adicione todas que fizerem sentido — joelho e lombar, ombro e joelho, o que for o seu caso. Pode ser nenhuma. Nada disso aparece para outras pessoas.",
    searchLabel: "Buscar e adicionar",
    searchPlaceholder: "Ex.: joelho, hérnia, LCA, ombro…",
    searchHint: "Toque em um resultado para adicionar. Pode repetir a busca e incluir várias.",
    searchIdle: "Comece digitando o nome da condição ou da região do corpo.",
    noResults: "Nada encontrado com esse termo. Tente outra palavra, como “lombar” ou “ombro”.",
    selectedLabel: (count: number) =>
      count === 1
        ? "1 condição adicionada"
        : `${count} condições adicionadas`,
    addMoreHint: "Pode buscar de novo e adicionar outras.",
    add: "Adicionar",
    remove: "Remover",
    none: "Nenhuma destas",
    noneConfirmed: "Você marcou que não tem nenhuma destas condições.",
    needChoice:
      "Adicione ao menos uma condição ou toque em “Nenhuma destas”.",
    preferNot: "Prefiro não informar",
    cta: "Continuar",
  },
  mobility: {
    title: "Como é a sua mobilidade no dia a dia?",
    support:
      "Usamos isso para sugerir só movimentos compatíveis — por exemplo, opções sentadas quando for o caso.",
    full: "Me movo em pé com autonomia na maior parte do tempo",
    wheelchair: "Uso cadeira de rodas",
    reduced: "Tenho mobilidade reduzida permanente",
    cta: "Continuar",
    error: "Escolha uma opção de mobilidade.",
  },
  nutrition: {
    title: "Alimentação",
    support:
      "Escolha o padrão (vegano, vegetariano ou nenhum específico) e adicione todas as restrições que fizerem sentido — glúten e lactose, alergias, o que for o seu caso. Pode ser nenhuma.",
    patternLegend: "Padrão alimentar",
    avoidsLegend: "Restrições, intolerâncias e alergias",
    avoidsHint:
      "Pode adicionar várias. Ex.: glúten e lactose juntos, ou alergia a amendoim sendo vegana.",
    searchLabel: "Buscar e adicionar restrição",
    searchPlaceholder: "Ex.: glúten, lactose, ovo, amendoim…",
    searchHint:
      "Toque em um resultado para adicionar. Pode repetir a busca e incluir várias.",
    searchIdle:
      "Digite o alimento ou a restrição. Se não evitar nada, use “Nenhuma restrição”.",
    noResults:
      "Nada encontrado com esse termo. Tente “leite”, “trigo” ou “amendoim”.",
    selectedLabel: (count: number) =>
      count === 1
        ? "1 restrição adicionada"
        : `${count} restrições adicionadas`,
    addMoreHint: "Pode buscar de novo e adicionar outras.",
    add: "Adicionar",
    remove: "Remover",
    none: "Nenhuma restrição",
    noneConfirmed: "Você marcou que não tem restrições alimentares extras.",
    needChoice:
      "Adicione ao menos uma restrição ou toque em “Nenhuma restrição”.",
    cta: "Continuar",
    patterns: {
      "no-restriction": "Sem padrão específico",
      vegetarian: "Vegetariano",
      vegan: "Vegano",
    },
    avoids: {
      gluten: "Glúten",
      lactose: "Lactose",
      egg: "Ovo",
      peanut: "Amendoim",
      soy: "Soja",
      meat: "Carne",
      fish: "Peixe",
    },
  },
  cycle: {
    title: "Ciclo menstrual ou gestação",
    support:
      "Isso pode influenciar energia, recuperação e a intensidade segura do movimento, além de algumas escolhas alimentares. Vale para quem menstrua ou gesta — inclusive pessoas trans e intersexo.",
    skip: "Não agora",
    menstrual: "Acompanhar ciclo menstrual",
    pregnancy: "Estou gestante",
    postpartum: "Pós-gestação",
    trimesterLegend: "Em qual trimestre você está?",
    trimester1: "1º trimestre",
    trimester2: "2º trimestre",
    trimester3: "3º trimestre",
    phaseHint: "Se não souber a fase do ciclo, seguimos com cuidado geral.",
    consent:
      "Autorizo o uso desses dados só para adaptar treinos e refeições ao ciclo ou à gestação.",
    cta: "Continuar",
    errorConsent: "Para ativar este cuidado, marque a autorização.",
    errorTrimester: "Informe o trimestre para continuar.",
  },
  habits: {
    title: "Hábitos do dia a dia",
    support:
      "Água, sono e pausa ativa ajudam a manter constância sem cobrança. Você pode ajustar depois.",
    waterLabel: "Meta diária de água (ml)",
    waterReminder: "Lembrete de água ligado",
    sleepReminder: "Lembrete de descanso ligado",
    sleepBedtimeLabel: "Horário desejado para dormir (opcional)",
    pauseReminder: "Pausa ativa ligada (5 minutos a cada 90 minutos)",
    cta: "Concluir cadastro",
    errorWater: "Informe uma meta de água entre 250 e 8000 ml.",
  },
  healthFocusLabels: {
    "quality-of-life": "Qualidade de vida",
    "physical-preparation": "Preparo físico",
    maintenance: "Manutenção",
    "body-composition": "Composição corporal",
  } satisfies Record<HealthFocus, string>,
} as const;
