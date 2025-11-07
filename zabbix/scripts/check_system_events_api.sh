#!/bin/sh
# Check system events count via API
# Usage: check_system_events_api.sh [severity]
# Returns: count of events with given severity in last hour

SEVERITY="${1:-warning}"

wget -qO- "http://backend:8000/api/stats/events/summary?hours=1" 2>/dev/null | \
  grep -o "\"${SEVERITY}\":[0-9]*" | cut -d':' -f2 || echo "0"
