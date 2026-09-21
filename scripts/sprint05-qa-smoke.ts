import {
  addWaterMl,
  clampWaterMl,
  WATER_DELTA_OPTIONS,
} from "../lib/habits/water";
import {
  isValidSleepInput,
  normalizeSleepMinutes,
  normalizeSleepQuality,
} from "../lib/habits/sleep";
import { isValidIsoDate, todayInSaoPaulo } from "../lib/habits/day";
import { isSleepQuality } from "../lib/habits/types";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
}

assert("water deltas include 200/300/500", WATER_DELTA_OPTIONS.join(",") === "200,300,500");

let water = 0;
water = addWaterMl(water, 500);
water = addWaterMl(water, 500);
water = addWaterMl(water, 500);
assert("three +500 accumulate to 1500", water === 1500);

assert("clamp allows over goal up to 8000", clampWaterMl(2500) === 2500);
assert("clamp floors below zero", clampWaterMl(-10) === 0);
assert("clamp caps at 8000", clampWaterMl(9000) === 8000);

assert("sleep quality good", isSleepQuality("good"));
assert("sleep quality invalid rejected", !isSleepQuality("excellent"));
assert(
  "sleep input requires quality or minutes",
  isValidSleepInput({ quality: "good", minutes: 420 }),
);
assert(
  "sleep input rejects empty",
  !isValidSleepInput({ quality: null, minutes: null }),
);
assert("normalize minutes 420", normalizeSleepMinutes(420) === 420);
assert("normalize quality ok", normalizeSleepQuality("ok") === "ok");

const day = todayInSaoPaulo();
assert("todayInSaoPaulo is ISO date", isValidIsoDate(day));
assert(
  "fixed instant SP day",
  todayInSaoPaulo(new Date("2026-09-21T03:30:00.000Z")) === "2026-09-21",
);
assert(
  "UTC late evening may be previous SP day",
  todayInSaoPaulo(new Date("2026-09-22T02:30:00.000Z")) === "2026-09-21",
);
