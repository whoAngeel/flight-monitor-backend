#!/bin/bash
# Cuenta vuelos activos (últimos 5 minutos)

PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c "SELECT COUNT(*) FROM flights WHERE created_at > NOW() - INTERVAL '5 minutes';" 2>/dev/null | tr -d ' '