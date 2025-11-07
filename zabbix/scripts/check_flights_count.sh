#!/bin/bash
# Cuenta total de vuelos en BD

PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c "SELECT COUNT(*) FROM flights;" 2>/dev/null | tr -d ' '