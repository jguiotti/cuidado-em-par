#!/usr/bin/env bash
# Cria .env a partir de .env.example, sem sobrescrever se ja existir.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
example="$root/.env.example"
target="$root/.env"

if [[ ! -f "$example" ]]; then
  echo "Arquivo .env.example nao encontrado em $root" >&2
  exit 1
fi

if [[ -f "$target" ]]; then
  echo ".env ja existe. Nenhuma copia feita."
  echo "Se quiser recriar, apague .env e rode este script de novo."
  exit 0
fi

cp "$example" "$target"
echo "Criado: .env"
echo "Abra o arquivo e substitua os placeholders pelas chaves do Supabase (Project Settings > API)."
