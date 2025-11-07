# 🎯 Zabbix Cloud Setup Guide - Flight Monitor CDMX

## Complete E2E Setup Instructions

This guide walks you through setting up Zabbix monitoring from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Host](#step-1-create-host)
3. [Step 2: Configure Items](#step-2-configure-items)
4. [Step 3: Configure Triggers](#step-3-configure-triggers)
5. [Step 4: Configure Actions](#step-4-configure-actions)
6. [Step 5: Test the Integration](#step-5-test-the-integration)

---

## Prerequisites

✅ Zabbix Cloud account created at https://www.zabbix.com/cloud
✅ Docker containers running (`flight-monitor-db`, `flight-monitor-backend`, `flight-monitor-zabbix-agent`)
✅ Backend accessible at http://localhost:8000
✅ Zabbix Agent 2 running and connected to Zabbix Cloud

---

## Step 1: Create Host

### 1.1 Login to Zabbix Cloud

1. Go to your Zabbix Cloud instance URL: `https://corriditos.zabbix.cloud`
2. Login with your credentials

### 1.2 Create New Host

1. Navigate to **Configuration → Hosts**
2. Click **Create host** button (top right)

### 1.3 Configure Host Settings

Fill in the following fields:

**Host Tab:**
```yaml
Host name: flight-monitor-backend
Visible name: Flight Monitor CDMX
Groups:
  - Click "Select" → Choose "Linux servers"
  - Or create new group: "Flight Monitor"
Interfaces:
  - Click "Add" → Select "Agent"
  - IP address: <YOUR_SERVER_PUBLIC_IP>  # Get from your VPS/Cloud provider
  - DNS name: (leave empty)
  - Connect to: IP
  - Port: 10050
```

**Templates Tab:**
```yaml
Link new templates:
  - Search for: "Linux by Zabbix agent active"
  - Click "Select" to add it
```

**Macros Tab:**
```yaml
(Leave default for now)
```

3. Click **Add** button at the bottom to create the host

### 1.4 Verify Agent Connection

1. Go to **Monitoring → Hosts**
2. Find your host "flight-monitor-backend"
3. Check the **Availability** column:
   - **ZBX** should show green (agent is active)
   - If red, check docker logs: `docker logs flight-monitor-zabbix-agent`

---

## Step 2: Configure Items

Items collect metrics from your application. You'll create 3 items using the monitoring scripts.

### 2.1 Navigate to Items

1. Go to **Configuration → Hosts**
2. Click on **Items** next to "flight-monitor-backend"
3. Click **Create item** button

---

### Item 1: Active Flights Count

**Purpose:** Monitor real-time flights over CDMX

```yaml
Name: Active Flights (Last 5 min)
Type: Zabbix agent
Key: system.run["/usr/local/bin/custom_scripts/check_active_flights_api.sh",nowait]
Type of information: Numeric (unsigned)
Units: flights
Update interval: 40s
History storage period: 90d
Trend storage period: 365d
Description: Number of active flights detected in the last 5 minutes from OpenSky API
```

**Steps:**
1. Click **Create item**
2. Fill in all fields exactly as shown above
3. Click **Add** button

---

### Item 2: Backend Health Status

**Purpose:** Monitor if FastAPI backend is responding

```yaml
Name: Backend API Health
Type: Zabbix agent
Key: system.run["/usr/local/bin/custom_scripts/check_backend_health.sh",nowait]
Type of information: Numeric (unsigned)
Units: (leave empty)
Update interval: 1m
History storage period: 90d
Value mapping:
  - Click "Show value mappings" → "Add"
  - Name: "Service state"
  - Mappings:
    - 1 = UP
    - 0 = DOWN
Description: Backend API health check (1=healthy, 0=down)
```

**Steps:**
1. Click **Create item**
2. Fill in all fields
3. For **Value mapping**:
   - Click "Show value mappings"
   - Click "Add"
   - Enter mapping name: "Service state"
   - Add mapping: `1` → `UP`
   - Add mapping: `0` → `DOWN`
   - Click "Add"
4. Click **Add** button to save item

---

### Item 3: System Events Count (Warning)

**Purpose:** Monitor warning-level events in the last hour

```yaml
Name: System Events - Warning (Last Hour)
Type: Zabbix agent
Key: system.run["/usr/local/bin/custom_scripts/check_system_events_api.sh warning",nowait]
Type of information: Numeric (unsigned)
Units: events
Update interval: 5m
History storage period: 90d
Description: Count of warning-level system events in the last hour
```

**Steps:**
1. Click **Create item**
2. Fill in all fields exactly as shown
3. Click **Add** button

---

### 2.2 Verify Items are Collecting Data

1. Go to **Monitoring → Latest data**
2. Select your host: "flight-monitor-backend"
3. You should see all 3 items with recent values:
   - **Active Flights**: Should show a number (e.g., 8, 15, 23)
   - **Backend API Health**: Should show 1 (UP)
   - **System Events - Warning**: Should show 0 or a small number

**If no data:**
- Wait 1-2 minutes for first data collection
- Check **History** column - should show timestamps
- If still no data, test scripts manually:
  ```bash
  docker exec flight-monitor-zabbix-agent /usr/local/bin/custom_scripts/check_active_flights_api.sh
  docker exec flight-monitor-zabbix-agent /usr/local/bin/custom_scripts/check_backend_health.sh
  ```

---

## Step 3: Configure Triggers

Triggers define alert conditions based on item values.

### 3.1 Navigate to Triggers

1. Go to **Configuration → Hosts**
2. Click on **Triggers** next to "flight-monitor-backend"
3. Click **Create trigger** button

---

### Trigger 1: High Flight Volume Alert

**Purpose:** Alert when >50 active flights detected

```yaml
Name: High volume of flights detected (>50 active)
Severity: Warning
Expression:
  - Click "Add" next to Expression
  - Item: Select "Active Flights (Last 5 min)"
  - Function: last()
  - Result: > 50
  - Click "Insert"

Final Expression: last(/flight-monitor-backend/system.run["/usr/local/bin/custom_scripts/check_active_flights_api.sh",nowait])>50

OK event generation: Recovery expression
Recovery expression:
  - Click "Add"
  - Item: Select "Active Flights (Last 5 min)"
  - Function: last()
  - Result: <= 50
  - Click "Insert"

Description: High traffic detected over CDMX. More than 50 active flights in the last 5 minutes.

Allow manual close: ✓ (checked)
```

**Steps:**
1. Click **Create trigger**
2. Enter **Name**
3. Select **Severity**: Warning (yellow)
4. For **Expression**:
   - Click "Add" button
   - In popup, click "Select" next to Item
   - Choose "Active Flights (Last 5 min)"
   - In "Function" dropdown, select "last()"
   - In "Result" field, enter: `>50`
   - Click "Insert"
5. For **OK event generation**, select "Recovery expression"
6. For **Recovery expression**:
   - Click "Add" button
   - Select same item
   - Function: "last()"
   - Result: `<=50`
   - Click "Insert"
7. Enter **Description**
8. Check **Allow manual close**
9. Click **Add** button

---

### Trigger 2: Backend API Down

**Purpose:** Alert when backend stops responding

```yaml
Name: Backend API is DOWN
Severity: High
Expression: last(/flight-monitor-backend/system.run["/usr/local/bin/custom_scripts/check_backend_health.sh",nowait])=0

OK event generation: Recovery expression
Recovery expression: last(/flight-monitor-backend/system.run["/usr/local/bin/custom_scripts/check_backend_health.sh",nowait])=1

Description: FastAPI backend is not responding. Service may be down.

Allow manual close: ✓ (checked)
```

**Steps:**
1. Click **Create trigger**
2. Name: "Backend API is DOWN"
3. Severity: High (orange/red)
4. Expression:
   - Click "Add"
   - Item: "Backend API Health"
   - Function: "last()"
   - Result: `=0`
   - Click "Insert"
5. Recovery expression:
   - Click "Add"
   - Item: "Backend API Health"
   - Function: "last()"
   - Result: `=1`
   - Click "Insert"
6. Click **Add**

---

### Trigger 3: No Active Flights (Possible API Failure)

**Purpose:** Alert when 0 flights detected for extended period

```yaml
Name: No active flights detected - Possible API failure
Severity: Average
Expression: last(/flight-monitor-backend/system.run["/usr/local/bin/custom_scripts/check_active_flights_api.sh",nowait])=0

OK event generation: Recovery expression
Recovery expression: last(/flight-monitor-backend/system.run["/usr/local/bin/custom_scripts/check_active_flights_api.sh",nowait])>0

Description: No flights detected in the last 5 minutes. Check OpenSky API connection or scheduler.

Allow manual close: ✓ (checked)
```

**Steps:** (Same as above, adjust item and thresholds)

---

### 3.2 Verify Triggers

1. Go to **Monitoring → Problems**
2. If you have >50 flights, you should see "High volume" alert
3. You can also check: **Monitoring → Hosts** → Look for problem count

---

## Step 4: Configure Actions

Actions define what happens when a trigger fires (send webhook, execute script, etc.)

### 4.1 Create Webhook Media Type

First, create a custom webhook to send alerts to your backend.

#### 4.1.1 Navigate to Media Types

1. Go to **Administration → Media types**
2. Click **Create media type** button

#### 4.1.2 Configure Webhook

```yaml
Name: Flight Monitor Webhook
Type: Webhook

Script:
```

Copy and paste this JavaScript code:

```javascript
try {
    var params = JSON.parse(value);
    var req = new HttpRequest();
    req.addHeader('Content-Type: application/json');
    req.addHeader('X-Zabbix-Token: mi_secret_token_super_seguro_123');

    var payload = {
        trigger_name: params.trigger_name,
        severity: params.severity,
        status: params.status,
        item_value: params.item_value,
        timestamp: new Date().toISOString(),
        message: params.message,
        host: params.host
    };

    var response = req.post(
        'http://YOUR_SERVER_IP:8000/api/zabbix/webhook',
        JSON.stringify(payload)
    );

    if (response !== null) {
        Zabbix.log(4, 'Webhook sent successfully: ' + response);
    }
    return 'OK';
} catch (error) {
    Zabbix.log(3, 'Webhook failed: ' + error);
    throw error;
}
```

**⚠️ IMPORTANT:** Replace `YOUR_SERVER_IP` with your actual server IP address (e.g., `http://192.168.1.100:8000` or your public IP)

**Parameters (Add these):**

Click "Add" under Parameters section for each:

| Name | Value |
|------|-------|
| trigger_name | `{TRIGGER.NAME}` |
| severity | `{TRIGGER.SEVERITY}` |
| status | `{TRIGGER.STATUS}` |
| item_value | `{ITEM.LASTVALUE}` |
| message | `{TRIGGER.DESCRIPTION}` |
| host | `{HOST.NAME}` |

**Steps:**
1. Click **Add** under Parameters
2. Enter Name: `trigger_name`
3. Enter Value: `{TRIGGER.NAME}`
4. Click small "Add" button
5. Repeat for all 6 parameters
6. Click main **Add** button to save media type

---

### 4.2 Assign Media Type to User

#### 4.2.1 Navigate to Users

1. Go to **Administration → Users**
2. Click on your username (usually "Admin")

#### 4.2.2 Add Media

1. Click on **Media** tab
2. Click **Add** button
3. Configure:

```yaml
Type: Flight Monitor Webhook
Send to: admin@localhost  (can be any value, not used)
When active: 1-7,00:00-24:00  (all week, 24 hours)
Use if severity: (Check all boxes)
  ✓ Not classified
  ✓ Information
  ✓ Warning
  ✓ Average
  ✓ High
  ✓ Disaster
Status: Enabled
```

4. Click **Add**
5. Click **Update** to save user changes

---

### 4.3 Create Action

Now create an action that uses the webhook.

#### 4.3.1 Navigate to Actions

1. Go to **Configuration → Actions**
2. Make sure **Trigger actions** is selected in the dropdown
3. Click **Create action** button

#### 4.3.2 Configure Action

**Action Tab:**

```yaml
Name: Send alerts to FastAPI webhook

Conditions:
  - Click "New" button
  - Condition: Trigger severity
  - Operator: >=
  - Severity: Warning
  - Click "Add"

(This means: only send alerts for Warning, Average, High, or Disaster severity)

Enabled: ✓ (checked)
```

**Operations Tab:**

```yaml
Operations:
  Click "Add" under Operations

  Operation details:
    Operation type: Send message
    Send to users:
      - Click "Add"
      - Select your user (e.g., "Admin")
    Send only to: Flight Monitor Webhook

  Click "Add" button to add the operation
```

**Recovery operations Tab:**

```yaml
Recovery operations:
  Click "Add"

  Operation details:
    Operation type: Send message
    Send to users:
      - Click "Add"
      - Select your user (e.g., "Admin")
    Send only to: Flight Monitor Webhook

  Click "Add"
```

**Update operations Tab:**

```yaml
(Leave empty for now)
```

3. Click **Add** button to save the action

---

## Step 5: Test the Integration

### 5.1 Trigger a Test Alert

Let's manually trigger the "High volume" alert to test the complete flow.

#### Option 1: Wait for Natural Alert

If you have >50 flights currently active, the alert will trigger automatically.

#### Option 2: Temporarily Lower Threshold

1. Go to **Configuration → Hosts → Triggers**
2. Click on "High volume of flights detected"
3. Change expression from `>50` to `>5` (or current flight count - 1)
4. Click **Update**
5. Wait 40 seconds (item update interval)
6. Check **Monitoring → Problems** - you should see the alert

---

### 5.2 Verify Webhook Received

Check if your backend received the webhook:

```bash
# Check backend logs
docker logs flight-monitor-backend | grep webhook

# Expected output:
# POST /api/zabbix/webhook
# Webhook received: {'trigger_name': 'High volume...', ...}
```

---

### 5.3 Verify Database Entry

Check if the alert was stored in `system_events` table:

```bash
docker exec -it flight-monitor-db psql -U postgres -d air_traffic -c "SELECT * FROM system_events ORDER BY created_at DESC LIMIT 5;"
```

**Expected output:**
```
 id | event_type | severity | message | metadata | created_at
----+------------+----------+---------+----------+------------
  1 | zabbix_alert | warning | High volume... | {...} | 2025-11-07...
```

---

### 5.4 Test API Endpoints

Test the new API endpoints to see events:

```bash
# Get latest events
curl http://localhost:8000/api/stats/events | jq

# Get events summary
curl http://localhost:8000/api/stats/events/summary?hours=24 | jq
```

---

## ✅ Summary - What You Configured

| Component | What It Does | Configuration |
|-----------|--------------|---------------|
| **Host** | Represents your server | `flight-monitor-backend` with Agent interface |
| **Item 1** | Monitors active flights | Updates every 40s, tracks flight count |
| **Item 2** | Monitors backend health | Checks every 1min, 1=UP, 0=DOWN |
| **Item 3** | Monitors system events | Counts warning events in last hour |
| **Trigger 1** | High flight volume | Fires when >50 active flights |
| **Trigger 2** | Backend down | Fires when health check fails |
| **Trigger 3** | No flights | Fires when 0 flights detected |
| **Media Type** | Webhook sender | Sends HTTP POST to backend API |
| **Action** | Alert router | Sends all Warning+ alerts to webhook |

---

## 🎯 Next Steps

1. **Add More Items** (Optional):
   - Total flights in database
   - Average altitude
   - System events by other severities (error, critical)

2. **Frontend Integration**:
   - Use the React components in `frontend-components/`
   - Connect to WebSocket for real-time alerts
   - Display events timeline

3. **Screenshots for Presentation**:
   - Zabbix Latest Data page (showing all items with values)
   - Zabbix Triggers page (showing all configured triggers)
   - Zabbix Problems page (showing active alert)
   - Backend logs showing webhook received
   - Frontend showing alert banner

---

## 🐛 Troubleshooting

### Items Not Collecting Data

```bash
# Test script manually
docker exec flight-monitor-zabbix-agent /usr/local/bin/custom_scripts/check_active_flights_api.sh

# Check Zabbix agent logs
docker logs flight-monitor-zabbix-agent

# Verify backend is accessible from agent
docker exec flight-monitor-zabbix-agent wget -qO- http://backend:8000/api/stats/current
```

### Webhook Not Received

1. Check media type configuration:
   - Verify script has correct IP address
   - Verify token matches `.env` file
2. Check action is enabled
3. Check user has media assigned
4. Check trigger severity is >= Warning

### Agent Not Connecting

```bash
# Check agent status
docker exec flight-monitor-zabbix-agent zabbix_agent2 -t agent.ping

# Check agent config
docker exec flight-monitor-zabbix-agent cat /etc/zabbix/zabbix_agent2.conf | grep Server

# Verify network
docker exec flight-monitor-zabbix-agent ping corriditos.zabbix.cloud
```

---

## 📚 Additional Resources

- [Zabbix Official Documentation](https://www.zabbix.com/documentation/current/)
- [Zabbix Agent Items](https://www.zabbix.com/documentation/current/en/manual/config/items/itemtypes/zabbix_agent)
- [Zabbix Triggers](https://www.zabbix.com/documentation/current/en/manual/config/triggers)
- [Zabbix Webhooks](https://www.zabbix.com/documentation/current/en/manual/config/notifications/media/webhook)

---

**Document Version**: 1.0
**Last Updated**: November 2025
**Author**: Flight Monitor Team
