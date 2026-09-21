import type {
  CycleMode,
  DietPattern,
  HabitKind,
  HealthFocus,
  MealSlot,
  TagSlug,
} from "@/lib/tags/constants";
import { TAG_SLUGS } from "@/lib/tags/constants";

/** pt-BR labels for UI only. Never store these as database identifiers. */
export const TAG_LABELS_PT_BR: Record<TagSlug, string> = {
  [TAG_SLUGS.tornAcl]: "LCA rompido",
  [TAG_SLUGS.hernia]: "Hérnia",
  [TAG_SLUGS.chondromalacia]: "Condromalácia",
  [TAG_SLUGS.hypertension]: "Hipertensão",
  [TAG_SLUGS.labyrinthitis]: "Labirintite",
  [TAG_SLUGS.wheelchairUser]: "Uso de cadeira de rodas",
  [TAG_SLUGS.reducedMobility]: "Mobilidade reduzida permanente",
  [TAG_SLUGS.pregnancyTrimester1]: "Gestação trimestre 1",
  [TAG_SLUGS.pregnancyTrimester2]: "Gestação trimestre 2",
  [TAG_SLUGS.pregnancyTrimester3]: "Gestação trimestre 3",
  [TAG_SLUGS.postpartum]: "Pós-gestação",
  [TAG_SLUGS.standing]: "Em pé",
  [TAG_SLUGS.seated]: "Sentado",
  [TAG_SLUGS.lying]: "Deitado",
  [TAG_SLUGS.unilateral]: "Unilateral",
  [TAG_SLUGS.lowImpact]: "Sem impacto",
  [TAG_SLUGS.bodyweight]: "Peso corporal",
  [TAG_SLUGS.wall]: "Parede",
  [TAG_SLUGS.chair]: "Cadeira",
  [TAG_SLUGS.bottle]: "Garrafa",
  [TAG_SLUGS.towel]: "Toalha",
  [TAG_SLUGS.foodBag]: "Saco de alimento",
  [TAG_SLUGS.activePause]: "Pausa ativa",
  [TAG_SLUGS.lowIntensity]: "Intensidade baixa",
  [TAG_SLUGS.mediumIntensity]: "Intensidade média",
  [TAG_SLUGS.highIntensity]: "Intensidade alta",
  [TAG_SLUGS.highImpact]: "Alto impacto",
  [TAG_SLUGS.lowerBodyPlyometrics]: "Pliometria inferior",
  [TAG_SLUGS.axialLoad]: "Carga axial",
  [TAG_SLUGS.pronePosition]: "Decúbito ventral",
  [TAG_SLUGS.spin]: "Giro",
  [TAG_SLUGS.inversion]: "Inversão",
  [TAG_SLUGS.gluten]: "Glúten",
  [TAG_SLUGS.lactose]: "Lactose",
  [TAG_SLUGS.egg]: "Ovo",
  [TAG_SLUGS.peanut]: "Amendoim",
  [TAG_SLUGS.soy]: "Soja",
  [TAG_SLUGS.meat]: "Carne",
  [TAG_SLUGS.fish]: "Peixe",
  [TAG_SLUGS.vegan]: "Vegano",
  [TAG_SLUGS.vegetarian]: "Vegetariano",
  [TAG_SLUGS.lowCost]: "Baixo custo",
  [TAG_SLUGS.cycleActive]: "Ciclo ativo",
  [TAG_SLUGS.menstrualPhase]: "Fase menstrual",
  [TAG_SLUGS.follicularPhase]: "Fase folicular",
  [TAG_SLUGS.ovulation]: "Ovulação",
  [TAG_SLUGS.lutealPhase]: "Fase lútea",
};

export const HEALTH_FOCUS_LABELS_PT_BR: Record<HealthFocus, string> = {
  "quality-of-life": "Qualidade de vida",
  "physical-preparation": "Preparo físico",
  maintenance: "Manutenção",
  "body-composition": "Composição corporal",
};

export const DIET_PATTERN_LABELS_PT_BR: Record<DietPattern, string> = {
  "no-restriction": "Sem restrição de padrão",
  vegetarian: "Vegetariano",
  vegan: "Vegano",
};

export const CYCLE_MODE_LABELS_PT_BR: Record<CycleMode, string> = {
  "menstrual-cycle": "Ciclo menstrual",
  pregnancy: "Gestação",
  postpartum: "Pós-gestação",
};

export const HABIT_KIND_LABELS_PT_BR: Record<HabitKind, string> = {
  water: "Água",
  "active-pause": "Pausa ativa",
  workout: "Treino",
  meal: "Refeição",
  sleep: "Sono",
};

export const MEAL_SLOT_LABELS_PT_BR: Record<MealSlot, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  snack: "Lanche",
  dinner: "Jantar",
};
