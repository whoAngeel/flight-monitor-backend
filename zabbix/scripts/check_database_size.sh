#!/bin/bash
# Monitorea el tamaño de la base de datos en MB

PGPASSWORD=postgres psql -h db -U postgres -d air_traffic -t -c \
  "SELECT ROUND(pg_database_size('air_traffic') / 1024.0 / 1024.0, 2);" \
  2>/dev/null | tr -d ' '
