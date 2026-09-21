import { createAdminClient } from "@/lib/supabase/admin";

/** Local UI validation only — never enable in production. */
export function isDevAuthBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.DEV_AUTH_BYPASS === "true";
}

export const DEV_AUTH_EMAIL = "dev@cuidado.local";

/**
 * Ensures a confirmed local user exists (no e-mail send).
 */
export async function ensureDevAuthUser(): Promise<{ email: string; userId: string }> {
  const admin = createAdminClient();
  const email = DEV_AUTH_EMAIL;

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        display_name: "Dev local",
      },
    });

  if (!createError && created.user) {
    return { email, userId: created.user.id };
  }

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw new Error(listError.message);
  }

  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === email,
  );

  if (!existing) {
    throw new Error(
      createError?.message ??
        "Não foi possível preparar a conta de desenvolvimento.",
    );
  }

  return { email, userId: existing.id };
}

/** Issues a magic-link token hash without sending e-mail (admin API). */
export async function createDevLoginTokenHash(email: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) {
    throw new Error(error.message);
  }

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("Token de desenvolvimento indisponível.");
  }

  return tokenHash;
}
