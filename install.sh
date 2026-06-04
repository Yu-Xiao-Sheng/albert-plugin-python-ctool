#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Check Albert
if ! command -v albert &>/dev/null; then
    error "Albert is not installed. Please install it first: https://albertlauncher.github.io/installing/"
fi

ALBERT_VERSION=$(albert --version 2>/dev/null | grep -oP '[\d.]+' || echo "unknown")
info "Albert ${ALBERT_VERSION} detected."

# Check WebKit2 (required for popup windows)
if ! python3 -c "import gi; gi.require_version('WebKit2','4.1')" 2>/dev/null; then
    warn "WebKit2 4.1 not found. Install it:"
    echo "  Ubuntu/Debian: sudo apt install gir1.2-webkit2-4.1"
    echo ""
    read -rp "Continue anyway? [y/N] " ans
    [[ "$ans" =~ ^[Yy]$ ]] || exit 1
fi

# Install plugin
PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$HOME/.local/share/albert/python/plugins"
LINK_NAME="$TARGET_DIR/ctool"

info "Installing plugin from: $PLUGIN_DIR"
mkdir -p "$TARGET_DIR"

if [ -L "$LINK_NAME" ]; then
    CURRENT_TARGET=$(readlink -f "$LINK_NAME")
    if [ "$CURRENT_TARGET" = "$PLUGIN_DIR" ]; then
        info "Plugin symlink already exists and points to the correct location."
    else
        warn "Existing symlink points to $CURRENT_TARGET, updating..."
        ln -sfn "$PLUGIN_DIR" "$LINK_NAME"
        info "Symlink updated."
    fi
elif [ -e "$LINK_NAME" ]; then
    warn "$LINK_NAME exists but is not a symlink. Backing up..."
    mv "$LINK_NAME" "${LINK_NAME}.bak"
    ln -s "$PLUGIN_DIR" "$LINK_NAME"
    info "Plugin installed (backup saved)."
else
    ln -s "$PLUGIN_DIR" "$LINK_NAME"
    info "Plugin installed."
fi

echo ""
info "Installation complete!"
echo ""
echo "  Next steps:"
echo "    1. Open Albert Settings"
echo "    2. Go to Plugins"
echo "    3. Find and enable 'Ctool'"
echo "    4. Press Alt+Space, type 'ct' to use"
echo ""
