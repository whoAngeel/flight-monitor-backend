#!/bin/bash
# Simula verificación de OpenSky (revisa logs recientes)

# Si hay vuelos guardados en los últimos 2 minutos, OpenSky funciona
RECENT=$(PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c "SELECT COUNT(*) FROM flights WHERE created_at > NOW() - INTERVAL '2 minutes';" 2>/dev/null | tr -d ' ')

if [ "$RECENT" -gt 0 ]; then
    echo "200"
else
    echo "503"
fi