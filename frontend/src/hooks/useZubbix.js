import { useEffect } from "react";
import { useFlightData } from "../context/socketContext";

export function useZabbix() {
  const { stats } = useFlightData();

  useEffect(() => {
    if (!stats) return;

    // Trigger 1: High Volume (>15 flights)
    if (stats.active_flights > 15) {
      simulateAlert({
        trigger_name: "High flight volume",
        severity: "warning",
        status: "PROBLEM",
        item_value: stats.active_flights.toString(),
        timestamp: new Date().toISOString(),
        message: `Flights count exceeded 15 (current: ${stats.active_flights}) - cleanup initiated`,
      });
    }

    // Trigger 2: Very High Volume (>25 flights)
    if (stats.active_flights > 25) {
      simulateAlert({
        trigger_name: "Critical flight volume",
        severity: "critical",
        status: "PROBLEM",
        item_value: stats.active_flights.toString(),
        timestamp: new Date().toISOString(),
        message: `CRITICAL: ${stats.active_flights} flights active. Immediate cleanup required!`,
      });
    }

    // Trigger 3: Low Traffic (<3 flights)
    if (stats.active_flights < 3 && stats.active_flights > 0) {
      simulateAlert({
        trigger_name: "Low traffic detected",
        severity: "info",
        status: "OK",
        item_value: stats.active_flights.toString(),
        timestamp: new Date().toISOString(),
        message: `Low traffic period: only ${stats.active_flights} flights active`,
      });
    }

    // Trigger 4: High Altitude Average (>8000m)
    if (stats.avg_altitude > 8000) {
      simulateAlert({
        trigger_name: "High altitude average",
        severity: "info",
        status: "OK",
        item_value: Math.round(stats.avg_altitude).toString(),
        timestamp: new Date().toISOString(),
        message: `Average altitude is high: ${Math.round(
          stats.avg_altitude
        )}m - possible long-distance flights`,
      });
    }
  }, [stats]);
}

function simulateAlert(alert) {
  // Emitir evento personalizado que el Context escuchará
  window.dispatchEvent(
    new CustomEvent("zabbix_alert_simulated", { detail: alert })
  );
}
