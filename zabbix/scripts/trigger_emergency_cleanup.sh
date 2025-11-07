#!/bin/bash
# Script de limpieza de emergencia cuando hay sobrecarga
# Elimina registros más antiguos de 1 hora (más agresivo que el cleanup normal)

set -e  # Exit on error

RETENTION_HOURS="${1:-1}"  # Default: 1 hora

echo "Starting emergency cleanup (retention: $RETENTION_HOURS hours)..."

# Ejecutar limpieza
DELETED=$(PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c \
  "WITH deleted AS (
     DELETE FROM flights
     WHERE created_at < NOW() - INTERVAL '$RETENTION_HOURS hours'
     RETURNING *
   ) SELECT COUNT(*) FROM deleted;" \
  2>/dev/null | tr -d ' ')

echo "Emergency cleanup completed: $DELETED records deleted"

# Notificar al backend vía webhook
curl -X POST http://backend:8000/api/zabbix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zabbix-Token: ${ZABBIX_WEBHOOK_SECRET:-mi_secret_token_super_seguro_123}" \
  -d "{
    \"trigger_name\": \"Emergency Cleanup Executed\",
    \"severity\": \"warning\",
    \"status\": \"PROBLEM\",
    \"item_value\": \"$DELETED\",
    \"timestamp\": \"$(date -Iseconds)\",
    \"message\": \"Emergency database cleanup: $DELETED records deleted (retention: $RETENTION_HOURS hours)\"
  }" 2>/dev/null

exit 0
