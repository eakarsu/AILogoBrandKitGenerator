#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; cd "$ROOT"
if [ ! -f .env ]; then echo "Missing .env; configure it before starting." >&2; exit 1; fi
set -a
# shellcheck disable=SC1091
source .env
set +a
BACKEND_PORT="${BACKEND_PORT:-${PORT:-3001}}"; FRONTEND_PORT="${FRONTEND_PORT:-${CLIENT_PORT:-3000}}"
if [ ! -d server/node_modules ]; then echo "Server dependencies missing; run scripts/bootstrap.sh explicitly." >&2; exit 1; fi
if [[ "${NODE_ENV:-}" == "test" ]]; then exec env PORT="$BACKEND_PORT" node server/index.js; fi
if [ ! -d web/node_modules ]; then echo "Web dependencies missing; run scripts/bootstrap.sh explicitly." >&2; exit 1; fi
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do if command -v lsof >/dev/null && lsof -ti ":$port" >/dev/null 2>&1; then echo "Port $port is already in use." >&2; exit 1; fi; done
CLIENT_URL_VALUE="${CLIENT_URL:-}"
if [[ "${NODE_ENV:-development}" != "production" ]]; then CLIENT_URL_VALUE="${CLIENT_URL_VALUE:-http://127.0.0.1:$FRONTEND_PORT}"; fi
(cd server && PORT="$BACKEND_PORT" CLIENT_URL="$CLIENT_URL_VALUE" node index.js) & BACKEND_PID=$!
(cd web && PORT="$FRONTEND_PORT" BROWSER=none REACT_APP_API_URL="${REACT_APP_API_URL:-http://127.0.0.1:$BACKEND_PORT}" npm start) & FRONTEND_PID=$!
cleanup() { kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; }; trap cleanup EXIT INT TERM
wait
