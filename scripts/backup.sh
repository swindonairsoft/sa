#!/bin/bash
# scripts/backup.sh
# ─────────────────────────────────────────────────────────────
# Local backup script — run manually or via git pre-commit hook
# Creates a timestamped zip of the project before any major edit
# Usage: bash scripts/backup.sh
# ─────────────────────────────────────────────────────────────

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
PROJECT_NAME="swindon-airsoft"
BACKUP_DIR="../${PROJECT_NAME}_backups"
BACKUP_FILE="${BACKUP_DIR}/${PROJECT_NAME}_${TIMESTAMP}_${COMMIT}.zip"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup: ${BACKUP_FILE}"

zip -r "$BACKUP_FILE" . \
  --exclude "*.git*" \
  --exclude "node_modules/*" \
  --exclude ".next/*" \
  --exclude "*.env.local" \
  --exclude "*.env" \
  --quiet

if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup created: ${BACKUP_FILE} (${SIZE})"
else
  echo "❌ Backup failed"
  exit 1
fi

# Keep only the last 10 local backups to save disk space
cd "$BACKUP_DIR"
ls -t *.zip 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
echo "🧹 Old backups cleaned (keeping last 10)"
