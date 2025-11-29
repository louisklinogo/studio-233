#!/usr/bin/env bash
set -euo pipefail

ROOT="${ROOT:-$(pwd)}"

readarray -d '' -t MODULE_DIRS < <(find "$ROOT" -type d -name node_modules -prune -print0)

TOTAL=${#MODULE_DIRS[@]}
if (( TOTAL == 0 )); then
  echo "No node_modules directories found under $ROOT"
  exit 0
fi

echo "Found $TOTAL node_modules directories. Starting removal..."
i=0
failed=0
for rawDir in "${MODULE_DIRS[@]}"; do
  dir=${rawDir//$'\r'/}
  ((i++))
  echo "[$i/$TOTAL] Removing $dir"
  if ! rm -rf -- "$dir"; then
    echo "Failed to remove $dir" >&2
    failed=1
  fi
done

if (( failed == 0 )); then
  echo "All node_modules directories removed."
else
  echo "Completed with errors. See logs above." >&2
  exit 1
fi
