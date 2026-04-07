#!/usr/bin/env bash
# Instala los git hooks locales del proyecto.
# Ejecutar una vez tras clonar: pnpm hooks:install

set -euo pipefail

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MANAGED_MARKER="# alea-webapp-managed-hook"

install_hook() {
  local name="$1"
  local target="$HOOKS_DIR/$name"

  if [[ -f "$target" ]] && ! grep -Fq "$MANAGED_MARKER" "$target"; then
    echo "Hook already exists and is not managed by alea-webapp: $target"
    echo "Skipping installation to avoid overwriting an existing hook."
    return 0
  fi

  cat > "$target" <<HOOK
#!/usr/bin/env bash
$MANAGED_MARKER
exec "$SCRIPT_DIR/ci-local.sh"
HOOK
  chmod +x "$target"
  echo "✓ Hook instalado: $name"
}

chmod +x "$SCRIPT_DIR/ci-local.sh"
install_hook "pre-push"

echo ""
echo "Hooks instalados correctamente."
echo "El CI local se ejecutará antes de cada 'git push' solo si el hook quedó instalado."
echo "Para saltarlo puntualmente: git push --no-verify"
