#!/bin/bash
# .git/hooks/pre-commit  (copy this file to .git/hooks/pre-commit and chmod +x)
# Auto-runs backup before every commit so you always have a snapshot

echo "🔒 Running pre-commit backup..."
bash "$(git rev-parse --show-toplevel)/scripts/backup.sh"
echo "✅ Pre-commit backup complete — proceeding with commit"
