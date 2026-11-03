#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Defina DATABASE_URL antes de gerar o backup." >&2
  exit 1
fi

backup_dir="${1:-backups}"
mkdir -p "$backup_dir"
backup_file="$backup_dir/barberhub-$(date -u +%Y%m%dT%H%M%SZ).sql"

pg_dump --no-owner --no-privileges "$DATABASE_URL" > "$backup_file"
echo "Backup salvo em $backup_file"
