#!/usr/bin/env bash
# Run the full iOS SmartTests suite (ios/tc-tests) on the Simulator with Docker backend + TestChimp env.
# Prerequisites: Xcode, Docker, jq, CocoaPods not required. Keys: ios/.cursor/mcp.json (gitignored).
#
# Usage:
#   ./ios/run-smarttests.sh              # full suite
#   ./ios/run-smarttests.sh smoke.quick.spec.js
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${DEVICE_NAME:=iPhone 17 Pro}"
: "${MILLIWAYS_API_BASE_URL:=http://localhost:3001}"
export DEVICE_NAME
export MILLIWAYS_API_BASE_URL

MCP_JSON="$ROOT/ios/.cursor/mcp.json"
if [[ -f "$MCP_JSON" ]]; then
  export TESTCHIMP_API_KEY="$(jq -r '.mcpServers.testchimp.env.TESTCHIMP_API_KEY' "$MCP_JSON")"
  export TESTCHIMP_BACKEND_URL="$(jq -r '.mcpServers.testchimp.env.TESTCHIMP_BACKEND_URL // empty' "$MCP_JSON")"
else
  echo "WARN: $MCP_JSON not found — set TESTCHIMP_API_KEY (and optional TESTCHIMP_BACKEND_URL) in the environment." >&2
fi
export TESTCHIMP_PROJECT_TYPE="${TESTCHIMP_PROJECT_TYPE:-ios}"

echo "==> Starting local backend"
docker compose up --build -d

echo "==> Waiting for backend at $MILLIWAYS_API_BASE_URL"
for _ in {1..60}; do
  if curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null

echo "==> Building Debug app for Simulator ($DEVICE_NAME)"
make -C "$ROOT/ios" build

echo "==> Booting Simulator"
make -C "$ROOT/ios" boot

export IOS_APP_PATH="$ROOT/ios/build/Build/Products/Debug-iphonesimulator/Milliways.app"
if [[ ! -d "$IOS_APP_PATH" ]]; then
  echo "Expected app not found: $IOS_APP_PATH" >&2
  exit 1
fi

echo "==> Installing app on booted Simulator"
xcrun simctl install booted "$IOS_APP_PATH"

echo "==> Installing npm dependencies (ios/tc-tests)"
npm ci --prefix "$ROOT/ios/tc-tests"

echo "==> Running SmartTests"
cd "$ROOT/ios/tc-tests"
if [[ $# -gt 0 ]]; then
  node "$ROOT/scripts/run-mobilewright-with-mcp-env.mjs" --mcp-json "$MCP_JSON" --tests-root "$ROOT/ios/tc-tests" --project-type ios -- "$@"
else
  node "$ROOT/scripts/run-mobilewright-with-mcp-env.mjs" --mcp-json "$MCP_JSON" --tests-root "$ROOT/ios/tc-tests" --project-type ios
fi
