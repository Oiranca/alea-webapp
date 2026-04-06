#!/usr/bin/env bash
# Instala los git hooks locales del proyecto.
# Ejecutar una vez tras clonar: pnpm setup

set -euo pipefail

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

install_hook() {
  local name="$1"
  local target="$HOOKS_DIR/$name"
  cat > "$target" <<HOOK
#!/usr/bin/env bash
exec "$SCRIPT_DIR/ci-local.sh"
HOOK
  chmod +x "$target"
  echo "✓ Hook instalado: $name"
}

chmod +x "$SCRIPT_DIR/ci-local.sh"
install_hook "pre-push"

echo ""
echo "Hooks instalados correctamente."
echo "El CI local se ejecutará antes de cada 'git push'."
echo "Para saltarlo puntualmente: git push --no-verify"
