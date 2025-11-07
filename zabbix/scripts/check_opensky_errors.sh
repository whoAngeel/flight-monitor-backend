#!/bin/sh
# Check for OpenSky API errors in the last hour
# Returns: count of API-related error events (401, 429, timeout, rate limit)
# Usage: check_opensky_errors.sh

HOURS=1

# Query the events API for OpenSky-related errors
wget -qO- "http://backend:8000/api/stats/events?limit=100&severity=error" 2>/dev/null | \
  grep -o '"message":"[^"]*"' | \
  grep -iE "(opensky|rate limit|429|401|token error|timeout|connection)" | \
  wc -l | \
  tr -d ' '
