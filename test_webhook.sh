#!/bin/bash
# Test webhook integration without Zabbix Cloud connection
# This simulates what Zabbix Cloud would send to your backend

echo "🧪 Testing Zabbix Webhook Integration..."
echo ""

# Test 1: High Flight Volume Alert
echo "📤 Test 1: Sending 'High Flight Volume' alert..."
curl -X POST http://localhost:8000/api/zabbix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zabbix-Token: change_this_secret_token" \
  -d '{
    "trigger_name": "High volume of flights detected (>50 active)",
    "severity": "Warning",
    "status": "PROBLEM",
    "item_value": "65",
    "timestamp": "'$(date -Iseconds)'",
    "message": "High traffic detected over CDMX. More than 50 active flights in the last 5 minutes.",
    "host": "flight-monitor-backend"
  }'
echo -e "\n"

sleep 2

# Test 2: Backend Down Alert
echo "📤 Test 2: Sending 'Backend Down' alert..."
curl -X POST http://localhost:8000/api/zabbix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zabbix-Token: change_this_secret_token" \
  -d '{
    "trigger_name": "Backend API is DOWN",
    "severity": "High",
    "status": "PROBLEM",
    "item_value": "0",
    "timestamp": "'$(date -Iseconds)'",
    "message": "FastAPI backend is not responding. Service may be down.",
    "host": "flight-monitor-backend"
  }'
echo -e "\n"

sleep 2

# Test 3: Recovery Alert
echo "📤 Test 3: Sending 'Backend Recovered' alert..."
curl -X POST http://localhost:8000/api/zabbix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zabbix-Token: change_this_secret_token" \
  -d '{
    "trigger_name": "Backend API is DOWN",
    "severity": "High",
    "status": "OK",
    "item_value": "1",
    "timestamp": "'$(date -Iseconds)'",
    "message": "Backend API recovered and is now responding.",
    "host": "flight-monitor-backend"
  }'
echo -e "\n"

echo "✅ All test alerts sent!"
echo ""
echo "📊 Verify results:"
echo "1. Check backend logs: docker logs flight-monitor-backend | grep webhook"
echo "2. Check database: docker exec -it flight-monitor-db psql -U postgres -d air_traffic -c 'SELECT * FROM system_events ORDER BY created_at DESC LIMIT 5;'"
echo "3. Check API: curl http://localhost:8000/api/stats/events | jq"
echo ""
