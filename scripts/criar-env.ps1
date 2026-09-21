# Cria .env a partir de .env.example, sem sobrescrever se ja existir.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$example = Join-Path $root ".env.example"
$target = Join-Path $root ".env"

if (-not (Test-Path $example)) {
  Write-Error "Arquivo .env.example nao encontrado em $root"
}

if (Test-Path $target) {
  Write-Host ".env ja existe. Nenhuma copia feita."
  Write-Host "Se quiser recriar, apague .env e rode este script de novo."
  exit 0
}

Copy-Item -Path $example -Destination $target
Write-Host "Criado: .env"
Write-Host "Abra o arquivo e substitua os placeholders pelas chaves do Supabase (Project Settings > API)."
