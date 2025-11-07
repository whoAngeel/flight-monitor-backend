#!/bin/sh
# Check if backend API is responding
# Returns: 1 = healthy, 0 = down

wget -qO- --timeout=5 http://backend:8000/api/stats/current >/dev/null 2>&1 && echo "1" || echo "0"
