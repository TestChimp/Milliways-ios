#!/usr/bin/env bash
# Bring up the Milliways demo stack for local PR / SmartTest authoring.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "Starting backend via Docker Compose…"
docker compose up --build -d

echo "Waiting for API health at http://localhost:3001 …"
for i in $(seq 1 60); do
  if curl -sf "http://localhost:3001/health" >/dev/null 2>&1; then
    echo "API is healthy."
    exit 0
  fi
  sleep 2
done

echo "Timed out waiting for http://localhost:3001/health" >&2
exit 1
