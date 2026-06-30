#!/bin/bash
# Backup MongoDB locally
# Add this script to your crontab to run daily.
# Example: 0 2 * * * /path/to/backup_mongo.sh

BACKUP_DIR="/var/backups/proctoriq_mongodb"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_NAME="ProctorIQ_db"

mkdir -p $BACKUP_DIR

echo "Starting backup for $DB_NAME..."
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress the backup
tar -czvf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Keep only the last 7 backups
ls -dt $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -I {} rm -f {}

echo "Backup completed successfully!"
