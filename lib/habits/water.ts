const WATER_MIN_ML = 0;
const WATER_MAX_ML = 8000;
const WATER_DELTA_OPTIONS = [200, 300, 500] as const;

export { WATER_DELTA_OPTIONS, WATER_MAX_ML, WATER_MIN_ML };

export function clampWaterMl(value: number): number {
  if (!Number.isFinite(value)) {
    return WATER_MIN_ML;
  }
  return Math.min(WATER_MAX_ML, Math.max(WATER_MIN_ML, Math.round(value)));
}

export function addWaterMl(currentMl: number, deltaMl: number): number {
  return clampWaterMl(currentMl + deltaMl);
}
