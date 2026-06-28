#!/usr/bin/env bash
# One-time setup: installs the GitHub Spec Kit `specify` CLI via uv.
set -euo pipefail

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required (https://docs.astral.sh/uv/). Install it first." >&2
  exit 1
fi

if command -v specify >/dev/null 2>&1; then
  echo "specify-cli already installed: $(specify --version 2>&1 | head -1)"
else
  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
fi

specify check || true
echo "Done. 'specify' is on PATH (you may need a new shell session)."
