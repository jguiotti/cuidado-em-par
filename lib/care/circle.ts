export const CARE_CIRCLE_KINDS = ["pair", "group"] as const;

export type CareCircleKind = (typeof CARE_CIRCLE_KINDS)[number];

export const CARE_CIRCLE_MEMBER_LIMIT: Record<CareCircleKind, number> = {
  pair: 2,
  group: 8,
};

export function isCareCircleKind(value: string): value is CareCircleKind {
  return (CARE_CIRCLE_KINDS as readonly string[]).includes(value);
}

export function memberLimitForKind(kind: CareCircleKind): number {
  return CARE_CIRCLE_MEMBER_LIMIT[kind];
}
