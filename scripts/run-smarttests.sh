#!/usr/bin/env bash
# Run SmartTests from repo-root `tests/` (not under ios/ or android/).
#
# Usage (from repo root):
#   ./scripts/run-smarttests.sh ios
#   ./scripts/run-smarttests.sh android
#   ./scripts/run-smarttests.sh ios --grep "main dishes"
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PLATFORM="${1:-ios}"
shift || true

: "${MILLIWAYS_API_BASE_URL:=http://localhost:3001}"
export MILLIWAYS_API_BASE_URL

MCP_JSON="$ROOT/.cursor/mcp.json"
TESTS_ROOT="$ROOT/tests"
IOS_BUNDLE_ID="com.mobilenext.Milliways"

if [[ ! -f "$MCP_JSON" ]]; then
  echo "Missing $MCP_JSON — add testchimp MCP env (TESTCHIMP_API_KEY, TESTCHIMP_PROJECT_ID; optional TESTCHIMP_BACKEND_URL)." >&2
  exit 1
fi

backend_healthy() {
  curl -fsS "$MILLIWAYS_API_BASE_URL/health" >/dev/null 2>&1
}

wait_for_backend() {
  echo "==> Waiting for backend at $MILLIWAYS_API_BASE_URL"
  for _ in {1..60}; do
    if backend_healthy; then
      return 0
    fi
    sleep 2
  done
  echo "Backend not healthy at $MILLIWAYS_API_BASE_URL after 120s" >&2
  return 1
}

ensure_backend() {
  if backend_healthy; then
    echo "==> Backend already healthy at $MILLIWAYS_API_BASE_URL (skipping docker compose)"
    return 0
  fi

  echo "==> Stopping prior Milliways compose stack (if any)"
  docker compose down --remove-orphans 2>/dev/null || true

  echo "==> Starting local backend"
  local compose_err
  compose_err="$(mktemp)"
  if docker compose up --build -d 2>"$compose_err"; then
    rm -f "$compose_err"
    wait_for_backend
    return 0
  fi

  if backend_healthy; then
    echo "==> Compose reported errors but backend is healthy; continuing"
    rm -f "$compose_err"
    return 0
  fi

  if grep -q '5432' "$compose_err" 2>/dev/null && grep -qi 'allocated\|bind' "$compose_err" 2>/dev/null; then
    echo "==> Port 5432 busy — retrying postgres on host port 5433"
    export POSTGRES_HOST_PORT=5433
    if docker compose up --build -d 2>>"$compose_err"; then
      rm -f "$compose_err"
      wait_for_backend
      return 0
    fi
  fi

  cat "$compose_err" >&2
  rm -f "$compose_err"
  if backend_healthy; then
    echo "==> Backend became healthy after compose errors; continuing"
    return 0
  fi
  echo "Start backend manually or free port 5432 / 3001, then re-run." >&2
  return 1
}

ensure_backend

if [[ "$PLATFORM" == "ios" ]]; then
  : "${DEVICE_NAME:=iPhone 17 Pro}"
  export DEVICE_NAME
  echo "==> Clean build iOS app ($DEVICE_NAME) + resolve SPM (testchimp-rum-ios)"
  make -C "$ROOT/ios" boot
  make -C "$ROOT/ios" clean build
  IOS_PRODUCTS="$ROOT/ios/build/Build/Products/Debug-iphonesimulator"
  IOS_APP="$IOS_PRODUCTS/Milliways.app"
  IOS_ZIP="$IOS_PRODUCTS/Milliways.zip"
  rm -f "$IOS_ZIP"
  (cd "$IOS_PRODUCTS" && zip -qr Milliways.zip Milliways.app)
  export IOS_APP_PATH="$IOS_ZIP"
  echo "==> Reinstall app on simulator (remove stale build)"
  xcrun simctl uninstall booted "$IOS_BUNDLE_ID" 2>/dev/null || true
  xcrun simctl install booted "$IOS_APP"
  echo "==> Warming up simulator (pre-launch to avoid cold-start launchApp flake)"
  xcrun simctl launch booted com.mobilenext.Milliways >/dev/null 2>&1 || true
  sleep 8
  xcrun simctl terminate booted com.mobilenext.Milliways >/dev/null 2>&1 || true
  sleep 2
elif [[ "$PLATFORM" == "android" ]]; then
  echo "==> Building Android debug APK"
  (cd "$ROOT/android" && ./gradlew :app:assembleDebug)
  export ANDROID_APK_PATH="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
else
  echo "Usage: $0 ios|android [mobilewright args...]" >&2
  exit 1
fi

echo "==> Installing SmartTests dependencies"
npm ci --prefix "$TESTS_ROOT"

echo "==> Running Mobilewright ($PLATFORM) — TestChimp env from .cursor/mcp.json"
node "$ROOT/scripts/run-mobilewright-with-mcp-env.mjs" \
  --mcp-json "$MCP_JSON" \
  --tests-root "$TESTS_ROOT" \
  -- mobile/e2e/common -c mobilewright.config.ts "--project=$PLATFORM" "$@"
