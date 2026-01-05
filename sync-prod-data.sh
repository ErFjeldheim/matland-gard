#!/bin/bash
set -e

echo "📦 Syncing production data to local development..."

PROD_SERVER="debian-server"
PROD_PATH="/var/www/matland-gard"
DUMP_FILE="prod_data_$(date +%Y%m%d_%H%M%S).sql"

echo "🔄 Exporting data from production..."
ssh $PROD_SERVER "cd $PROD_PATH && docker compose exec -T db pg_dump -U matland_user matland_store" > $DUMP_FILE

echo "📥 Import to local development database..."
docker compose -f docker-compose.dev.yml exec -T db psql -U matland_user -d matland_store < $DUMP_FILE

echo "🧹 Cleaning up dump file..."
rm $DUMP_FILE

echo "✅ Production data synced successfully!"
