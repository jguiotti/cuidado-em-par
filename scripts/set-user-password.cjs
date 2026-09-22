/**
 * Force-set Auth password for an existing user (no e-mail sent).
 *
 * Usage (from repo root):
 *   node --env-file=.env scripts/set-user-password.cjs you@email.com "SuaSenhaNova8"
 *
 * Or without --env-file (loads .env / .env.local from the repo root):
 *   node scripts/set-user-password.cjs you@email.com "SuaSenhaNova8"
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile(fileName) {
  const filePath = path.join(__dirname, "..", fileName);
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return true;
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const loadedLocal = loadEnvFile(".env.local");
  const loadedEnv = loadEnvFile(".env");
  if (!loadedLocal && !loadedEnv) {
    console.error(
      "Nao achei .env nem .env.local na raiz do projeto. Crie a partir de .env.example.",
    );
    process.exit(1);
  }
}

const email = (process.argv[2] || "").trim().toLowerCase();
const password = process.argv[3] || "";

if (!email || !password || password.length < 8) {
  console.error(
    'Uso: node scripts/set-user-password.cjs email@dominio.com "SenhaMin8"',
  );
  process.exit(1);
}

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!url || !serviceKey) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.",
  );
  process.exit(1);
}

async function main() {
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let page = 1;
  let user = null;

  while (!user && page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      throw error;
    }
    user = data.users.find((row) => (row.email || "").toLowerCase() === email);
    if (!data.users.length || data.users.length < 200) {
      break;
    }
    page += 1;
  }

  if (!user) {
    console.error("Usuario nao encontrado:", email);
    process.exit(1);
  }

  const { data: updated, error: updateError } =
    await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });

  if (updateError) {
    throw updateError;
  }

  console.log("Senha atualizada e e-mail confirmado para:", updated.user.email);
  console.log("Agora entre no app com esse e-mail e a senha informada.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
