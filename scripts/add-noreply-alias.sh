#!/usr/bin/env bash
# Add noreply@karisuite.com as an alias for jahi@karisuite.com via Google Workspace.
# Requires: GAM (install: sudo snap install gam-bp && sudo snap alias gam-bp.gam gam)
#           Then run: gam oauth create (one-time setup)
set -e

USER_EMAIL="jahi@karisuite.com"
ALIAS_EMAIL="noreply@karisuite.com"

if command -v gam &>/dev/null; then
  echo "Using GAM to add alias..."
  gam create alias "$ALIAS_EMAIL" user "$USER_EMAIL"
  echo "Done. noreply@karisuite.com is now an alias for $USER_EMAIL"
  exit 0
fi

echo "GAM not installed. To add the alias via terminal:"
echo ""
echo "  1. Install: sudo snap install gam-bp && sudo snap alias gam-bp.gam gam"
echo "  2. One-time setup: gam oauth create  (authorize with your Workspace admin)"
echo "  3. Run: gam create alias $ALIAS_EMAIL user $USER_EMAIL"
echo ""
echo "Option 2 - Admin Console:"
echo "  admin.google.com → Directory → Users → $USER_EMAIL"
echo "  → User information → Alternate email addresses → Add $ALIAS_EMAIL"
exit 1
