/**
 * Exercise seed catalog — part 2 (upper body, arms, core, cardio + Educador extras).
 */

import type { SeedExercise } from "./exercise-seed-catalog";

function ex(partial: SeedExercise): SeedExercise {
  return partial;
}

const KNEE_IMPACT = [
  "torn-acl",
  "torn-pcl",
  "patellar-tendinopathy",
  "knee-osteoarthritis",
  "chondromalacia",
];
const PLYO = [
  "torn-acl",
  "patellar-tendinopathy",
  "knee-osteoarthritis",
  "plantar-fasciitis",
  "osteoporosis-osteopenia",
  "pregnancy-trimester-2",
  "pregnancy-trimester-3",
  "labyrinthitis",
  "hemiplegia-hemiparesis",
  "cerebral-palsy-mild-moderate",
  "visual-impairment",
];
const SPINE_FLEX_ROT = ["disc-herniation", "hernia", "spondylolisthesis"];
const SPINE_HYPER = ["spondylolisthesis", "spinal-stenosis", "disc-herniation"];
const SHOULDER_OVERHEAD = [
  "rotator-cuff-injury",
  "subacromial-bursitis",
  "shoulder-instability",
];
const SHOULDER_WIDE = [
  "shoulder-instability",
  "slap-tear",
  "ac-joint-injury",
];
const WRIST_LOAD = [
  "carpal-tunnel-de-quervain",
  "tfcc-injury",
  "rheumatoid-arthritis",
];
const CORE_PRESSURE = ["diastasis-recti", "athletic-pubalgia"];
const ELBOW = ["epicondylitis", "elbow-ucl-injury", "olecranon-bursitis"];
const PREGNANCY_PRONE = ["pregnancy-trimester-2", "pregnancy-trimester-3"];
const UPPER_PUSH = [...WRIST_LOAD, "upper-limb-amputation-unilateral"];

export const EXERCISE_SEED_CATALOG_PART2: SeedExercise[] = [
  // --- Upper body push ---
  ex({
    slug: "push-up",
    title: "Flexão de braços tradicional",
    description:
      "Mãos no chão na linha dos ombros, corpo alinhado. Desça o peito e empurre o chão. Joelhos no solo se precisar regressar.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["medium-intensity", "floor-push", "bilateral-push-up", "wrist-extension-load"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE, "ac-joint-injury"],
    isPublished: true,
  }),
  ex({
    slug: "knee-push-up",
    title: "Flexão com joelhos apoiados",
    description:
      "Mesma linha de flexão com joelhos no solo. Mantém o tronco firme sem deixar o quadril cair.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "floor-push", "bilateral-push-up", "wrist-extension-load"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE],
    isPublished: true,
  }),
  ex({
    slug: "diamond-push-up",
    title: "Flexão diamante",
    description:
      "Mãos próximas formando um diamante sob o peito. Desça e empurre com controle.",
    targetMuscles: ["arms", "chest"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "floor-push", "wrist-extension-load", "prolonged-grip"],
    contraindicationTags: [...WRIST_LOAD, ...ELBOW],
    isPublished: true,
  }),
  ex({
    slug: "wide-push-up",
    title: "Flexão aberta",
    description:
      "Mãos mais afastadas que os ombros. Desça o peito entre as mãos sem forçar o ombro.",
    targetMuscles: ["chest", "shoulders"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["medium-intensity", "floor-push", "wide-arm-tension", "wrist-extension-load"],
    contraindicationTags: [...SHOULDER_WIDE, ...WRIST_LOAD],
    isPublished: true,
  }),
  ex({
    slug: "decline-push-up",
    title: "Flexão declinada",
    description:
      "Pés na cadeira e mãos no chão. Aumenta a demanda de ombros — use só com base estável.",
    targetMuscles: ["chest", "shoulders", "arms"],
    equipmentTags: ["chair", "bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "floor-push", "overhead-press", "wrist-extension-load"],
    contraindicationTags: [...SHOULDER_OVERHEAD, ...WRIST_LOAD, "pregnancy-trimester-3"],
    isPublished: true,
  }),
  ex({
    slug: "incline-push-up",
    title: "Flexão inclinada",
    description:
      "Mãos na cadeira e pés no chão. Boa regressão da flexão tradicional.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["chair", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["low-intensity", "floor-push"],
    contraindicationTags: [...WRIST_LOAD, "upper-limb-amputation-unilateral"],
    isPublished: true,
  }),
  ex({
    slug: "pike-push-up",
    title: "Flexão pike",
    description:
      "Quadril elevado formando um V invertido. Flexione os cotovelos levando a cabeça ao chão entre as mãos.",
    targetMuscles: ["shoulders", "arms"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "overhead-press", "wrist-extension-load"],
    contraindicationTags: [...SHOULDER_OVERHEAD, ...WRIST_LOAD, ...PREGNANCY_PRONE],
    isPublished: true,
  }),
  ex({
    slug: "wall-pike-push-up",
    title: "Flexão pike na parede",
    description:
      "Pés na parede e mãos no chão em pike. Desça a cabeça com controle. Exige equilíbrio.",
    targetMuscles: ["shoulders", "arms"],
    equipmentTags: ["wall", "bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "overhead-press", "inversion", "wrist-extension-load"],
    contraindicationTags: [
      ...SHOULDER_OVERHEAD,
      ...WRIST_LOAD,
      "hypertension",
      "labyrinthitis",
      ...PREGNANCY_PRONE,
    ],
    isPublished: true,
  }),
  ex({
    slug: "uneven-push-up",
    title: "Flexão assimétrica",
    description:
      "Uma mão em apoio mais alto (livro ou degrau baixo) e a outra no chão. Alternar lados.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "unilateral"],
    intensityTags: ["medium-intensity", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE],
    isPublished: true,
  }),
  ex({
    slug: "archer-push-up",
    title: "Flexão arqueiro",
    description:
      "Em flexão, desloque o peito para um braço enquanto o outro permanece mais estendido. Avançado.",
    targetMuscles: ["chest", "arms"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "unilateral"],
    intensityTags: ["high-intensity", "wide-arm-tension", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...SHOULDER_WIDE, ...WRIST_LOAD],
    isPublished: true,
  }),
  ex({
    slug: "typewriter-push-up",
    title: "Flexão máquina de escrever",
    description:
      "Na posição baixa da flexão, deslize o peito de um lado para o outro antes de subir.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "wide-arm-tension", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...SHOULDER_WIDE, ...WRIST_LOAD, "ac-joint-injury"],
    isPublished: true,
  }),
  ex({
    slug: "spiderman-push-up",
    title: "Flexão homem-aranha",
    description:
      "A cada descida, leve um joelho em direção ao cotovelo do mesmo lado. Alterne.",
    targetMuscles: ["chest", "core", "arms"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["medium-intensity", "floor-push", "deep-hip-flexion", "wrist-extension-load"],
    contraindicationTags: [...WRIST_LOAD, "femoroacetabular-impingement"],
    isPublished: true,
  }),
  ex({
    slug: "hindu-push-up",
    title: "Flexão hindu / dive bomber",
    description:
      "Do pike, desça o peito em um arco passando para extensão da coluna. Evite se houver dor lombar.",
    targetMuscles: ["chest", "shoulders", "back", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "spine-hyperextension", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...SPINE_HYPER, ...WRIST_LOAD, ...SHOULDER_OVERHEAD],
    isPublished: true,
  }),
  ex({
    slug: "pseudo-planche-push-up",
    title: "Flexão pseudo-planche",
    description:
      "Mãos mais abaixo do peito, inclinando o ombro à frente. Extremamente avançado — amplitude curta.",
    targetMuscles: ["shoulders", "arms", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "wrist-extension-load", "floor-push"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE, "elbow-ucl-injury"],
    isPublished: false,
  }),
  ex({
    slug: "plyo-push-up",
    title: "Flexão pliométrica (com palmas)",
    description:
      "Empurre o chão com força suficiente para bater palmas e aterrissar com cotovelos macios.",
    targetMuscles: ["chest", "arms"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "high-impact", "high-speed", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE, "labyrinthitis", ...PLYO],
    isPublished: true,
  }),
  ex({
    slug: "sphinx-push-up",
    title: "Flexão esfinge",
    description:
      "Dos antebraços, estenda os cotovelos até a prancha alta e volte. Controle o punho e o ombro.",
    targetMuscles: ["arms", "shoulders", "core"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["medium-intensity", "forearm-plank-hard", "wrist-extension-load"],
    contraindicationTags: [...ELBOW, ...WRIST_LOAD, "olecranon-bursitis"],
    isPublished: true,
  }),
  ex({
    slug: "sliding-lateral-push-up",
    title: "Flexão deslizante lateral",
    description:
      "Com uma mão sobre toalha em piso liso, deslize para o lado na descida e volte.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["towel", "bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["medium-intensity", "wide-arm-tension", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...SHOULDER_WIDE, ...WRIST_LOAD],
    isPublished: true,
  }),
  ex({
    slug: "weighted-push-up",
    title: "Flexão lastreada",
    description:
      "Flexão tradicional com mochila preenchida nas costas. Carga leve e controle total.",
    targetMuscles: ["chest", "arms", "core"],
    equipmentTags: ["backpack", "bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["high-intensity", "floor-push", "wrist-extension-load", "axial-load"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE, "osteoporosis-osteopenia"],
    isPublished: true,
  }),
  ex({
    slug: "band-resisted-push-up",
    title: "Flexão de braços resistida",
    description:
      "Passe um elástico longo pelas costas e sob as mãos. Execute a flexão contra a resistência.",
    targetMuscles: ["chest", "arms"],
    equipmentTags: ["resistance-band", "bodyweight"],
    requiredCapabilityTags: ["lying"],
    intensityTags: ["medium-intensity", "floor-push", "wrist-extension-load"],
    contraindicationTags: [...WRIST_LOAD, ...SHOULDER_WIDE],
    isPublished: true,
  }),
  ex({
    slug: "floor-press",
    title: "Supino no chão (floor press)",
    description:
      "Deite de costas e empurre garrafas ou pacotes do peito para cima até estender os cotovelos.",
    targetMuscles: ["chest", "arms"],
    equipmentTags: ["bottle", "food-bag", "bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity"],
    contraindicationTags: [...SHOULDER_WIDE, "shoulder-instability"],
    isPublished: true,
  }),
  ex({
    slug: "floor-fly",
    title: "Crucifixo no solo",
    description:
      "Deite de costas e abra os braços com garrafas ou elástico, depois una à frente do peito sem forçar o ombro.",
    targetMuscles: ["chest"],
    equipmentTags: ["bottle", "food-bag", "resistance-band"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "wide-arm-tension", "cross-body-load"],
    contraindicationTags: [...SHOULDER_WIDE, "ac-joint-injury"],
    isPublished: true,
  }),
  // --- Pull ---
  ex({
    slug: "bent-over-row",
    title: "Remada curvada bilateral",
    description:
      "Tronco inclinado com coluna neutra. Puxe elástico ou garrafas em direção ao tronco e solte com controle.",
    targetMuscles: ["back", "arms"],
    equipmentTags: ["resistance-band", "bottle", "bodyweight"],
    requiredCapabilityTags: ["standing", "low-impact"],
    intensityTags: ["medium-intensity"],
    contraindicationTags: [...SPINE_FLEX_ROT],
    isPublished: true,
  }),
  ex({
    slug: "single-arm-row",
    title: "Remada unilateral (serrote)",
    description:
      "Apoie uma mão e um joelho na cadeira. Puxe o peso com o outro braço até o tronco.",
    targetMuscles: ["back", "arms"],
    equipmentTags: ["chair", "bottle", "backpack"],
    requiredCapabilityTags: ["standing", "unilateral", "low-impact"],
    intensityTags: ["medium-intensity"],
    contraindicationTags: ["upper-limb-amputation-unilateral"],
    isPublished: true,
  }),
  ex({
    slug: "seated-row",
    title: "Remada sentada",
    description:
      "Sente-se e puxe um elástico ancorado à frente em direção ao tronco, aproximando as omoplatas.",
    targetMuscles: ["back", "arms"],
    equipmentTags: ["resistance-band", "chair"],
    requiredCapabilityTags: ["seated", "low-impact"],
    intensityTags: ["low-intensity", "active-pause"],
    contraindicationTags: [],
    isPublished: true,
  }),
  ex({
    slug: "lat-pulldown-band",
    title: "Puxada alta",
    description:
      "Ancore o elástico no alto e puxe as mãos em direção aos ombros. Controle a subida.",
    targetMuscles: ["back", "arms"],
    equipmentTags: ["resistance-band"],
    requiredCapabilityTags: ["standing", "seated", "low-impact"],
    intensityTags: ["medium-intensity", "hanging-traction"],
    contraindicationTags: ["slap-tear", "shoulder-instability", "rotator-cuff-injury"],
    isPublished: true,
  }),
  ex({
    slug: "reverse-snow-angel",
    title: "Anjo de neve invertido",
    description:
      "Deite de bruços e deslize os braços do lado do corpo até acima da cabeça, sem dor no ombro.",
    targetMuscles: ["back", "shoulders"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "prone-position"],
    contraindicationTags: [...PREGNANCY_PRONE, ...SHOULDER_OVERHEAD],
    isPublished: true,
  }),
  ex({
    slug: "prone-back-pull",
    title: "Puxada de costas no solo",
    description:
      "Deite de bruços e puxe os cotovelos para trás apertando as omoplatas. Solte com calma.",
    targetMuscles: ["back"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "prone-position"],
    contraindicationTags: [...PREGNANCY_PRONE],
    isPublished: true,
  }),
  ex({
    slug: "superman",
    title: "Extensão de tronco (superman)",
    description:
      "Deite de bruços e eleve levemente braços e pernas. Amplitude pequena. Pare se houver dor lombar.",
    targetMuscles: ["back", "glutes"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "prone-position", "spine-hyperextension"],
    contraindicationTags: [...SPINE_HYPER, ...PREGNANCY_PRONE],
    isPublished: true,
  }),
  ex({
    slug: "floor-pullover",
    title: "Pullover no solo",
    description:
      "Deite de costas e leve um pacote ou garrafão de cima da cabeça até o peito, com cotovelos semi-flexionados.",
    targetMuscles: ["back", "chest"],
    equipmentTags: ["food-bag", "bottle"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity"],
    contraindicationTags: [...SHOULDER_OVERHEAD, "slap-tear"],
    isPublished: true,
  }),
  ex({
    slug: "overhead-press",
    title: "Desenvolvimento de ombros",
    description:
      "Em pé ou sentado, empurre garrafas ou elástico acima da cabeça até estender os cotovelos sem arquear a lombar.",
    targetMuscles: ["shoulders", "arms"],
    equipmentTags: ["resistance-band", "bottle", "chair"],
    requiredCapabilityTags: ["standing", "seated", "low-impact"],
    intensityTags: ["medium-intensity", "overhead-press", "lateral-raise-above-90"],
    contraindicationTags: [...SHOULDER_OVERHEAD],
    isPublished: true,
  }),
  ex({
    slug: "lateral-raise",
    title: "Elevação lateral",
    description:
      "Eleve os braços ao lado até no máximo a linha dos ombros. Evite subir acima de 90 graus se houver dor.",
    targetMuscles: ["shoulders"],
    equipmentTags: ["resistance-band", "bottle", "food-bag"],
    requiredCapabilityTags: ["standing", "seated", "low-impact"],
    intensityTags: ["low-intensity", "lateral-raise-above-90"],
    contraindicationTags: [...SHOULDER_OVERHEAD],
    isPublished: true,
  }),
  ex({
    slug: "front-raise",
    title: "Elevação frontal",
    description:
      "Eleve os braços à frente até a linha dos ombros e desça com controle.",
    targetMuscles: ["shoulders"],
    equipmentTags: ["resistance-band", "bottle", "food-bag"],
    requiredCapabilityTags: ["standing", "seated", "low-impact"],
    intensityTags: ["low-intensity", "lateral-raise-above-90"],
    contraindicationTags: [...SHOULDER_OVERHEAD],
    isPublished: true,
  }),
  ex({
    slug: "band-pull-apart",
    title: "Afastamento peitoral (pull-apart)",
    description:
      "Segure o elástico à frente e afaste as mãos abrindo o peito, apertando as omoplatas.",
    targetMuscles: ["shoulders", "back"],
    equipmentTags: ["resistance-band"],
    requiredCapabilityTags: ["standing", "seated", "low-impact"],
    intensityTags: ["low-intensity", "active-pause"],
    contraindicationTags: ["ac-joint-injury"],
    isPublished: true,
  }),
  ex({
    slug: "floor-t-isometric",
    title: "Isometria em cruz no solo",
    description:
      "Deite de bruços com braços abertos em T e mantenha uma leve elevação dos braços.",
    targetMuscles: ["shoulders", "back"],
    equipmentTags: ["bodyweight"],
    requiredCapabilityTags: ["lying", "low-impact"],
    intensityTags: ["low-intensity", "prone-position", "wide-arm-tension"],
    contraindicationTags: [...PREGNANCY_PRONE, ...SHOULDER_WIDE],
    isPublished: true,
  }),
];
