#!/bin/bash
# Limpia vuelos antiguos (más de 2 horas)

DELETED=$(PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c "WITH deleted AS (DELETE FROM flights WHERE created_at < NOW() - INTERVAL '2 hours' RETURNING *) SELECT COUNT(*) FROM deleted;" 2>/dev/null | tr -d ' ')

echo "Cleaned up $DELETED old flight records"

# Notificar a FastAPI vía webhook interno
curl -X POST http://backend:8000/api/zabbix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zabbix-Token: mi_secret_token_super_seguro_123" \
  -d "{
    \"trigger_name\": \"Cleanup executed\",
    \"severity\": \"info\",
    \"status\": \"OK\",
    \"item_value\": \"$DELETED\",
    \"timestamp\": \"$(date -Iseconds)\",
    \"message\": \"Database cleanup: $DELETED records deleted\"
  }"