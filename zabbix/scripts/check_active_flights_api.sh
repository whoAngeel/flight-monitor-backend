#!/bin/sh
# Check active flights via Backend API
# Returns: number of active flights

wget -qO- http://backend:8000/api/stats/current 2>/dev/null | grep -o '"active_flights":[0-9]*' | cut -d':' -f2
