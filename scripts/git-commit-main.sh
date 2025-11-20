#!/usr/bin/env bash
set -e

echo "📂 Current git status:"
git status

CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
  echo "✅ No changes to commit. Skipping commit and push."
  exit 0
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "📝 Adding all changes..."
git add -A

echo "✅ Committing with message: chore: sync from Cascade $TIMESTAMP"
git commit -m "chore: sync from Cascade $TIMESTAMP"

echo "🚀 Pushing to origin main..."
git push origin main

echo "✅ Push completed. Latest status:"
git status
