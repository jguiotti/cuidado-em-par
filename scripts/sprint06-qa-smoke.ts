import {
  DELETE_ACCOUNT_CONFIRMATION,
  isAccountConsentPurpose,
  isValidDeleteConfirmation,
} from "../lib/account/consent";
import {
  assertExportOwnsUser,
  buildExportFilename,
  type AccountExportPayload,
} from "../lib/account/export";

function assert(name: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} ${name}`);
}

assert(
  "delete confirmation EXCLUIR",
  isValidDeleteConfirmation("EXCLUIR") &&
    isValidDeleteConfirmation(" excluir ") &&
    !isValidDeleteConfirmation("DELETE"),
);

assert(
  "confirmation constant matches phrase",
  DELETE_ACCOUNT_CONFIRMATION === "EXCLUIR",
);

assert("purpose health valid", isAccountConsentPurpose("health_personalization"));
assert("purpose junk invalid", !isAccountConsentPurpose("marketing"));

const payload: AccountExportPayload = {
  exported_at: "2026-09-21T12:00:00.000Z",
  user_id: "user-a",
  profile: { display_name: "Alex" },
  consents: [{ purpose: "terms", accepted: true, recorded_at: "2026-09-01T00:00:00.000Z" }],
  clinical: null,
  nutrition: null,
  cycle: null,
  biometrics: null,
  habit_prefs: null,
  habit_logs: [],
};

assert("export owns user A", assertExportOwnsUser(payload, "user-a"));
assert("export rejects user B", !assertExportOwnsUser(payload, "user-b"));
assert(
  "export filename shape",
  /^cuidado-em-par-export-\d{4}-\d{2}-\d{2}\.json$/.test(buildExportFilename()),
);

const requiredKeys = [
  "exported_at",
  "user_id",
  "profile",
  "consents",
  "clinical",
  "nutrition",
  "cycle",
  "biometrics",
  "habit_prefs",
  "habit_logs",
];
assert(
  "export payload keys",
  requiredKeys.every((key) => key in payload),
);
