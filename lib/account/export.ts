export interface AccountExportPayload {
  exported_at: string;
  user_id: string;
  profile: Record<string, unknown> | null;
  consents: Array<{
    purpose: string;
    accepted: boolean;
    recorded_at: string;
  }>;
  clinical: Record<string, unknown> | null;
  nutrition: Record<string, unknown> | null;
  cycle: Record<string, unknown> | null;
  cycle_period_logs: Array<Record<string, unknown>>;
  biometrics: Record<string, unknown> | null;
  body_measurements: Array<Record<string, unknown>>;
  daily_plans: Array<Record<string, unknown>>;
  habit_prefs: Record<string, unknown> | null;
  habit_logs: Array<Record<string, unknown>>;
}

export function buildExportFilename(exportedAt: Date = new Date()): string {
  const day = exportedAt.toISOString().slice(0, 10);
  return `cuidado-em-par-export-${day}.json`;
}

export function assertExportOwnsUser(
  payload: AccountExportPayload,
  userId: string,
): boolean {
  return payload.user_id === userId;
}
