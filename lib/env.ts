export class MissingEnvError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`Missing environment variable: ${missingKeys.join(", ")}`);
    this.name = "MissingEnvError";
    this.missingKeys = missingKeys;
  }
}

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.includes("SEU_PROJECT_REF") ||
    trimmed.startsWith("sua_")
  ) {
    return undefined;
  }
  return trimmed;
}

/**
 * Public Supabase env. Keys are read with static access so Next.js can inline
 * NEXT_PUBLIC_* values into the browser bundle.
 */
export function getPublicSupabaseEnv() {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const missing: string[] = [];

  if (!url) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (missing.length > 0 || !url || !anonKey) {
    throw new MissingEnvError(missing);
  }

  return { url, anonKey };
}

export function getServiceRoleKey() {
  const value = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!value) {
    throw new MissingEnvError(["SUPABASE_SERVICE_ROLE_KEY"]);
  }
  return value;
}
