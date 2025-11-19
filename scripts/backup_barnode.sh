#!/bin/bash

BACKUP_DIR="backup"
TIMESTAMP=$(date "+%d_%b_%H.%M" | sed 's/Jan/Gen/;s/Feb/Feb/;s/Mar/Mar/;s/Apr/Apr/;s/May/Mag/;s/Jun/Giu/;s/Jul/Lug/;s/Aug/Ago/;s/Sep/Set/;s/Oct/Ott/;s/Nov/Nov/;s/Dec/Dic/')
BACKUP_NAME="Backup_${TIMESTAMP}.tar.gz"
MAX_BACKUPS=3

mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup: $BACKUP_NAME"

tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.cache' \
  --exclude='tmp' \
  --exclude='backup' \
  --exclude='.git' \
  . 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_NAME"
else
  echo "❌ Backup failed"
  exit 1
fi

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  echo "🗑️  Rotating backups (keeping last $MAX_BACKUPS)..."
  ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
  echo "✅ Old backups removed"
fi

echo "📊 Current backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
