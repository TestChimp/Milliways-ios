#!/usr/bin/env bash
# Capture device logcat (TrueCoverage / RUM troubleshooting) while running SmartTests.
#
# Tags:
#   Milliways     — RUM skipped, emit-without-CI warnings
#   MilliwaysTC   — automation SET/CLEAR from MainActivity
#
# Output: device-logs/logcat-ci-debug-<timestamp>.txt (NOT under test-results/ — Playwright clears that folder).
#
# Usage (from repo root or this directory):
#   cd android/tests && ./run-with-logcat.sh
#   cd android/tests && ./run-with-logcat.sh smoke.quick.spec.js
#
# Env:
#   CLEAR_LOGCAT=0   — skip "adb logcat -c" so buffer history is kept (default: clear)
#   ANDROID_SERIAL   — passed through to adb when set
#
set -euo pipefail

TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$TESTS_DIR"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

if ! adb devices | grep -E '^\S+\s+device$' -q; then
  echo "ERROR: No device in adb devices (start an emulator or plug in a device)." >&2
  exit 1
fi

mkdir -p "$TESTS_DIR/device-logs"
LOGFILE="$TESTS_DIR/device-logs/logcat-ci-debug-$(date +%Y%m%d-%H%M%S).txt"

if [[ "${CLEAR_LOGCAT:-1}" != "0" ]]; then
  adb logcat -c 2>/dev/null || true
fi

# Verbose for our tags only; threadtime helps correlate with test timeline.
adb logcat -v threadtime Milliways:V MilliwaysTC:V '*:S' >"$LOGFILE" 2>&1 &
LOGPID=$!

cleanup() {
  local st=$?
  kill "$LOGPID" 2>/dev/null || true
  wait "$LOGPID" 2>/dev/null || true
  echo ""
  echo "==> Logcat saved: $LOGFILE"
  echo "    grep -E 'TrueCoverage|ci_test_info=|CI context|FLUSH' \"$LOGFILE\""
  exit "$st"
}
trap cleanup EXIT INT TERM

echo "==> Writing logcat (Milliways, MilliwaysTC) to:"
echo "    $LOGFILE"
echo "==> Running npm test -- $*"
npm test -- "$@"
