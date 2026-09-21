import { meal, type SeedMeal } from "./meal-seed-types";

/** Café da manhã — Nutricionista. */
export const MEAL_SEED_BREAKFAST: SeedMeal[] = [
  meal({
    slug: "oatmeal-banana-cinnamon",
    title: "Mingau de aveia com banana e canela",
    description:
      "Aqueça a aveia com água ou leite até engrossar. Amasse a banana, junte canela. Sem açúcar se preferir. Aveia comum: contém glúten.",
    mealSlot: "breakfast",
    containsTags: ["gluten"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "aveia em flocos", qty: "4 colheres de sopa" },
      { item: "banana", qty: "1 unidade" },
      { item: "canela", qty: "a gosto" },
      { item: "água ou leite", qty: "200 ml", alt: "água (sem lactose)" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "oatmeal-apple-clove",
    title: "Mingau de aveia com maçã e cravo",
    description:
      "Cozinhe a aveia com água. Acrescente maçã picada e um cravo. Contém glúten.",
    mealSlot: "breakfast",
    containsTags: ["gluten"],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "aveia em flocos", qty: "4 colheres de sopa" },
      { item: "maçã", qty: "1 unidade" },
      { item: "cravo", qty: "1 unidade" },
      { item: "água", qty: "200 ml" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "cornmeal-porridge-fruit",
    title: "Mingau de fubá com frutas",
    description:
      "Dissolva o fubá em água fria, cozinhe mexendo até engrossar. Adoce com frutas picadas, sem açúcar.",
    mealSlot: "breakfast",
    containsTags: [],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "fubá", qty: "3 colheres de sopa" },
      { item: "água", qty: "250 ml" },
      { item: "fruta da estação", qty: "1 unidade" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "crepioca-tomato-oregano",
    title: "Crepioca com tomate e orégano",
    description:
      "Misture goma de tapioca e ovo. Frite fino. Recheie com tomate e orégano.",
    mealSlot: "breakfast",
    containsTags: ["egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "goma de tapioca", qty: "2 colheres de sopa" },
      { item: "ovo", qty: "1 unidade" },
      { item: "tomate", qty: "1/2 unidade" },
      { item: "orégano", qty: "a gosto" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "green-crepioca-ricotta",
    title: "Crepioca verde com creme de ricota",
    description:
      "Bata ovo com espinafre ou couve e goma. Recheie com ricota amassada. Contém ovo e lactose.",
    mealSlot: "breakfast",
    containsTags: ["egg", "lactose"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "goma de tapioca", qty: "2 colheres de sopa" },
      { item: "ovo", qty: "1 unidade" },
      { item: "espinafre ou couve", qty: "1 punhado" },
      { item: "ricota", qty: "2 colheres de sopa" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "carrot-crepioca",
    title: "Crepioca de cenoura",
    description:
      "Rale a cenoura e bata com ovo e goma. Frite em frigideira antiaderente.",
    mealSlot: "breakfast",
    containsTags: ["egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "goma de tapioca", qty: "2 colheres de sopa" },
      { item: "ovo", qty: "1 unidade" },
      { item: "cenoura ralada", qty: "2 colheres de sopa" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "corn-couscous-scrambled-eggs",
    title: "Cuscuz de milho com ovos mexidos",
    description:
      "Hidrate o flocão de milho. Acompanhe com ovos mexidos simples.",
    mealSlot: "breakfast",
    containsTags: ["egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "flocão de milho", qty: "4 colheres de sopa" },
      { item: "ovos", qty: "2 unidades" },
      { item: "água", qty: "para hidratar" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "corn-couscous-shredded-chicken",
    title: "Cuscuz de milho com frango desfiado",
    description:
      "Cuscuz de milho acompanhado de frango desfiado temperado. Contém carne.",
    mealSlot: "breakfast",
    containsTags: ["meat"],
    dietCompatibleTags: ["low-cost"],
    ingredients: [
      { item: "flocão de milho", qty: "4 colheres de sopa" },
      { item: "frango desfiado", qty: "1/2 xícara" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "corn-couscous-white-cheese",
    title: "Cuscuz de milho com queijo branco",
    description:
      "Cuscuz de milho com fatias de queijo minas ou coalho. Contém lactose.",
    mealSlot: "breakfast",
    containsTags: ["lactose"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "flocão de milho", qty: "4 colheres de sopa" },
      { item: "queijo branco", qty: "2 fatias" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "tapioca-scrambled-eggs-chives",
    title: "Tapioca com ovos mexidos e cebolinha",
    description:
      "Abra a tapioca na frigideira. Recheie com ovos mexidos e cebolinha.",
    mealSlot: "breakfast",
    containsTags: ["egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "goma de tapioca", qty: "3 colheres de sopa" },
      { item: "ovos", qty: "2 unidades" },
      { item: "cebolinha", qty: "a gosto" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "tapioca-peanut-butter",
    title: "Tapioca com pasta de amendoim",
    description:
      "Tapioca fina recheada com pasta de amendoim integral. Contém amendoim.",
    mealSlot: "breakfast",
    containsTags: ["peanut"],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "goma de tapioca", qty: "3 colheres de sopa" },
      { item: "pasta de amendoim integral", qty: "1 colher de sopa" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "bread-fried-egg",
    title: "Pão com ovo na chapa",
    description:
      "Pão francês ou de forma integral com ovo frito na chapa. Contém glúten e ovo.",
    mealSlot: "breakfast",
    containsTags: ["gluten", "egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "pão", qty: "1 unidade", alt: "pão de forma integral" },
      { item: "ovo", qty: "1 unidade" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "bread-sardine-pate",
    title: "Pão com patê de sardinha",
    description:
      "Amasse sardinha em lata com iogurte ou ricota. Passe no pão. Contém glúten, peixe e lactose.",
    mealSlot: "breakfast",
    containsTags: ["gluten", "fish", "lactose"],
    dietCompatibleTags: ["low-cost"],
    ingredients: [
      { item: "pão", qty: "2 fatias" },
      { item: "sardinha em lata", qty: "1/2 lata" },
      { item: "iogurte natural ou ricota", qty: "1 colher de sopa" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "bread-carrot-pate",
    title: "Pão com patê de cenoura",
    description:
      "Misture cenoura ralada, azeite e orégano. Passe no pão. Contém glúten.",
    mealSlot: "breakfast",
    containsTags: ["gluten"],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "pão", qty: "2 fatias" },
      { item: "cenoura ralada", qty: "3 colheres de sopa" },
      { item: "azeite", qty: "1 fio" },
      { item: "orégano", qty: "a gosto" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "banana-oat-egg-pancake",
    title: "Panqueca de banana, aveia e ovo",
    description:
      "Amasse banana, misture aveia e ovo. Frite. Contém glúten e ovo.",
    mealSlot: "breakfast",
    containsTags: ["gluten", "egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "banana", qty: "1 unidade" },
      { item: "aveia em flocos", qty: "2 colheres de sopa" },
      { item: "ovo", qty: "1 unidade" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "apple-cinnamon-oat-pancake",
    title: "Panqueca de maçã, canela, aveia e ovo",
    description:
      "Rale a maçã, misture aveia, ovo e canela. Frite. Contém glúten e ovo.",
    mealSlot: "breakfast",
    containsTags: ["gluten", "egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "maçã ralada", qty: "1 unidade" },
      { item: "aveia em flocos", qty: "2 colheres de sopa" },
      { item: "ovo", qty: "1 unidade" },
      { item: "canela", qty: "a gosto" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "sweet-potato-boiled-eggs",
    title: "Batata-doce com ovos cozidos",
    description: "Sirva batata-doce cozida com ovos cozidos temperados.",
    mealSlot: "breakfast",
    containsTags: ["egg"],
    dietCompatibleTags: ["vegetarian", "low-cost"],
    ingredients: [
      { item: "batata-doce", qty: "1 média" },
      { item: "ovos cozidos", qty: "2 unidades" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "yam-or-cassava-olive-oil-coffee",
    title: "Inhame ou mandioca com azeite e café",
    description:
      "Cozinhe inhame ou mandioca. Regue com fio de azeite. Acompanhe café preto.",
    mealSlot: "breakfast",
    containsTags: [],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "inhame ou mandioca", qty: "1 porção" },
      { item: "azeite", qty: "1 fio" },
      { item: "café preto", qty: "1 xícara" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "banana-apple-oat-smoothie",
    title: "Vitamina de banana, maçã e aveia",
    description:
      "Bata banana, maçã e aveia com água. Contém glúten. Sem leite se preferir.",
    mealSlot: "breakfast",
    containsTags: ["gluten"],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "banana", qty: "1 unidade" },
      { item: "maçã", qty: "1/2 unidade" },
      { item: "aveia", qty: "1 colher de sopa" },
      { item: "água", qty: "200 ml" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "microwave-baked-apple-oat-bran",
    title: "Maçã assada com canela e farelo de aveia",
    description:
      "Asse a maçã no micro-ondas com canela e farelo de aveia. Contém glúten.",
    mealSlot: "breakfast",
    containsTags: ["gluten"],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "maçã", qty: "1 unidade" },
      { item: "canela", qty: "a gosto" },
      { item: "farelo de aveia", qty: "1 colher de sopa" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "banana-cinnamon-tapioca",
    title: "Tapioca com banana e canela",
    description:
      "Tapioca fina com banana amassada e canela. Opção sem glúten e vegana. (extra Nutri)",
    mealSlot: "breakfast",
    containsTags: [],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "goma de tapioca", qty: "3 colheres de sopa" },
      { item: "banana", qty: "1 unidade" },
      { item: "canela", qty: "a gosto" },
    ],
    isPublished: true,
  }),
  meal({
    slug: "banana-mash-no-oats",
    title: "Banana amassada com canela",
    description:
      "Amasse a banana com canela. Café rápido sem glúten e sem ovo. (extra Nutri)",
    mealSlot: "breakfast",
    containsTags: [],
    dietCompatibleTags: ["vegan", "vegetarian", "low-cost"],
    ingredients: [
      { item: "banana", qty: "1 a 2 unidades" },
      { item: "canela", qty: "a gosto" },
    ],
    isPublished: true,
  }),
];
