import { useEffect } from "react";

const ALERT_TEMPLATES = [
  {
    trigger_name: "Database cleanup executed",
    severity: "info",
    message: "Automatic cleanup removed 127 old flight records",
  },
  {
    trigger_name: "API response time high",
    severity: "warning",
    message: "OpenSky API response time: 4.2s (threshold: 3s)",
  },
  {
    trigger_name: "High flight volume",
    severity: "warning",
    message: "Flight count exceeded threshold - cleanup initiated",
  },
  {
    trigger_name: "System resources normal",
    severity: "info",
    message: "CPU: 45%, Memory: 62%, Disk: 35%",
  },
  {
    trigger_name: "Peak traffic detected",
    severity: "info",
    message: "Traffic spike detected - 23 flights in last 5 minutes",
  },
];

export function useRandomAlerts(intervalSeconds = 30) {
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAlert =
        ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];

      const alert = {
        ...randomAlert,
        status: "PROBLEM",
        item_value: Math.floor(Math.random() * 100).toString(),
        timestamp: new Date().toISOString(),
      };

      window.dispatchEvent(
        new CustomEvent("zabbix_alert_simulated", { detail: alert })
      );
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [intervalSeconds]);
}
