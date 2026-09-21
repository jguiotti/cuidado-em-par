export const ACCOUNT_CONSENT_PURPOSES = [
  "terms",
  "health_personalization",
  "cycle_module",
  "biometrics",
  "habit_reminders",
] as const;

export type AccountConsentPurpose =
  (typeof ACCOUNT_CONSENT_PURPOSES)[number];

export function isAccountConsentPurpose(
  value: string,
): value is AccountConsentPurpose {
  return (ACCOUNT_CONSENT_PURPOSES as readonly string[]).includes(value);
}

/** Phrase the person must type to confirm account deletion. */
export const DELETE_ACCOUNT_CONFIRMATION = "EXCLUIR";

export function isValidDeleteConfirmation(value: string): boolean {
  return value.trim().toUpperCase() === DELETE_ACCOUNT_CONFIRMATION;
}
