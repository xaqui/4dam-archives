#!/bin/bash

# Load environment variables
source /root/4dam-db/.env  # Asegúrate de que la ruta al archivo .env sea correcta

# Directory where the dumps will be stored
DUMP_DIR="/root/4dam-db/dumps"  # Cambia la ruta al directorio correcto

# Date and time format for file names
DATE=$(date +%Y%m%d-%H%M)

# Perform the dump
mysqldump -u "$DB_USERNAME" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_DATABASE" > "$DUMP_DIR/dump-$DB_DATABASE-$DATE.sql"

# Change to the dump directory
cd $DUMP_DIR || exit

# Git add, commit, and push the new dump
git add dump-"$DB_DATABASE"-"$DATE".sql
git commit -m "Added dump for $DB_DATABASE dated $DATE"
git push

# Cleanup old files and commit the changes to Git
find $DUMP_DIR -type f -name "dump-$DB_DATABASE-*.sql" -mtime +13 ! -name "*-0000.sql" -exec git rm {} \; -exec git commit -m "Removed old dump {}" \; -delete

# Finally, push the deletion changes
git push
