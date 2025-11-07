#!/bin/bash
# Obtiene la altitud promedio de vuelos activos (últimos 5 min)

PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c \
  "SELECT COALESCE(ROUND(AVG(altitude)::numeric, 0), 0)
   FROM flights
   WHERE created_at > NOW() - INTERVAL '5 minutes'
     AND altitude IS NOT NULL
     AND altitude > 0;" \
  2>/dev/null | tr -d ' '
