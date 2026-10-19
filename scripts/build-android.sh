#!/usr/bin/env bash
# ── build-android.sh ──────────────────────────────────────────────────────────
# Builds the Kolo Quest Kids Android APK / AAB for Google Play.
#
# Usage:
#   ./scripts/build-android.sh          # debug APK (no signing needed)
#   ./scripts/build-android.sh release  # release AAB (requires keystore)
#
# Environment variables for release signing (or set in android/local.properties):
#   KEYSTORE_PATH      — absolute path to .jks / .keystore file
#   KEYSTORE_PASSWORD  — keystore password
#   KEY_ALIAS          — key alias inside the keystore
#   KEY_PASSWORD       — key password
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

MODE="${1:-debug}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔨  Building web assets..."
cd "$ROOT_DIR"
npm run build

echo "📦  Syncing Capacitor..."
npx cap sync android

echo "🤖  Building Android ($MODE)..."
cd "$ROOT_DIR/android"

if [ "$MODE" = "release" ]; then
  # Build release AAB (upload to Google Play)
  ./gradlew bundleRelease \
    -PKEYSTORE_PATH="${KEYSTORE_PATH:-}" \
    -PKEYSTORE_PASSWORD="${KEYSTORE_PASSWORD:-}" \
    -PKEY_ALIAS="${KEY_ALIAS:-}" \
    -PKEY_PASSWORD="${KEY_PASSWORD:-}"

  AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
  echo ""
  echo "✅  AAB ready: android/$AAB_PATH"
  echo "    Upload this file to Google Play Console → Production → Create release"
else
  # Debug APK for testing on device
  ./gradlew assembleDebug

  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
  echo ""
  echo "✅  APK ready: android/$APK_PATH"
  echo "    Install: adb install android/$APK_PATH"
fi
