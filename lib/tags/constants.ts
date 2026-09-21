export const TAG_DOMAINS = [
  "movement",
  "food",
  "habit",
  "cycle",
] as const;

export const TAG_KINDS = [
  "condition",
  "capability",
  "equipment",
  "contains",
  "diet",
  "intensity",
  "phase",
] as const;

export const HEALTH_FOCUS_VALUES = [
  "quality-of-life",
  "physical-preparation",
  "maintenance",
  "body-composition",
] as const;

export const DIET_PATTERN_VALUES = [
  "no-restriction",
  "vegetarian",
  "vegan",
] as const;

export const CYCLE_MODE_VALUES = [
  "menstrual-cycle",
  "pregnancy",
  "postpartum",
] as const;

export const HABIT_KIND_VALUES = [
  "water",
  "active-pause",
  "workout",
  "meal",
  "sleep",
] as const;

export const SEX_ASSIGNED_AT_BIRTH_VALUES = [
  "female",
  "male",
  "intersex",
  "prefer_not_to_say",
] as const;

export const MEAL_SLOT_VALUES = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
] as const;

/** Stable English slugs used by the relational engine. */
export const TAG_SLUGS = {
  tornAcl: "torn-acl",
  hernia: "hernia",
  chondromalacia: "chondromalacia",
  hypertension: "hypertension",
  labyrinthitis: "labyrinthitis",
  wheelchairUser: "wheelchair-user",
  reducedMobility: "reduced-mobility",
  pregnancyTrimester1: "pregnancy-trimester-1",
  pregnancyTrimester2: "pregnancy-trimester-2",
  pregnancyTrimester3: "pregnancy-trimester-3",
  postpartum: "postpartum",
  standing: "standing",
  seated: "seated",
  lying: "lying",
  unilateral: "unilateral",
  lowImpact: "low-impact",
  bodyweight: "bodyweight",
  wall: "wall",
  chair: "chair",
  bottle: "bottle",
  towel: "towel",
  foodBag: "food-bag",
  activePause: "active-pause",
  lowIntensity: "low-intensity",
  mediumIntensity: "medium-intensity",
  highIntensity: "high-intensity",
  highImpact: "high-impact",
  lowerBodyPlyometrics: "lower-body-plyometrics",
  axialLoad: "axial-load",
  pronePosition: "prone-position",
  spin: "spin",
  inversion: "inversion",
  gluten: "gluten",
  lactose: "lactose",
  egg: "egg",
  peanut: "peanut",
  soy: "soy",
  meat: "meat",
  fish: "fish",
  vegan: "vegan",
  vegetarian: "vegetarian",
  lowCost: "low-cost",
  cycleActive: "cycle-active",
  menstrualPhase: "menstrual-phase",
  follicularPhase: "follicular-phase",
  ovulation: "ovulation",
  lutealPhase: "luteal-phase",
} as const;

export type TagSlug = (typeof TAG_SLUGS)[keyof typeof TAG_SLUGS];
export type HealthFocus = (typeof HEALTH_FOCUS_VALUES)[number];
export type DietPattern = (typeof DIET_PATTERN_VALUES)[number];
export type CycleMode = (typeof CYCLE_MODE_VALUES)[number];
export type HabitKind = (typeof HABIT_KIND_VALUES)[number];
export type MealSlot = (typeof MEAL_SLOT_VALUES)[number];
export type SexAssignedAtBirthValue =
  (typeof SEX_ASSIGNED_AT_BIRTH_VALUES)[number];
