#!/bin/bash
# Cuenta eventos del sistema en la última hora por severidad

SEVERITY="${1:-warning}"  # Default: warning (also accepts: info, error, critical)

PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c \
  "SELECT COUNT(*) FROM system_events
   WHERE created_at > NOW() - INTERVAL '1 hour'
     AND severity = '$SEVERITY';" \
  2>/dev/null | tr -d ' '
