import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [flights, setFlights] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const socketRef = useRef(null);

  // Listener para alertas simuladas
  useEffect(() => {
    const handleSimulatedAlert = (event) => {
      const alert = event.detail;
      console.log("🚨 Zabbix alert simulated:", alert);
      setAlerts((prev) => [alert, ...prev].slice(0, 10));
    };

    window.addEventListener("zabbix_alert_simulated", handleSimulatedAlert);
    return () => window.removeEventListener("zabbix_alert_simulated", handleSimulatedAlert);
  }, []);

  const socket = useSocket({
    onFlightsUpdate: (data) => {
      console.log("✈️ flights_update recibido:", data);
      setFlights(data);
    },
    onStatsUpdate: (data) => {
      console.log("📊 stats_update recibido:", data);
      setStats(data);

      const timestamp = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setChartData((prev) => {
        const updated = [
          ...prev,
          {
            time: timestamp,
            active: data.active_flights || 0,
            avg_altitude: data.avg_altitude || 0,
            avg_speed: data.avg_velocity || 0,
          },
        ];
        return updated.slice(-30);
      });
    },
    onZabbixAlert: (alert) => {
      console.log("🚨 zabbix_alert recibido:", alert);
      setAlerts((prev) => [alert, ...prev].slice(0, 10));
    },
  });

  // Guardar la referencia del socket
  useEffect(() => {
    socketRef.current = socket.current;
  }, [socket]);

  // Función para actualizar manualmente los vuelos
  const refreshFlights = () => {
    const socketInstance = socketRef.current;
    if (socketInstance && socketInstance.connected) {
      console.log("🔄 Solicitando actualización manual de vuelos...");
      socketInstance.emit("request_flights_update");
    } else {
      console.warn("⚠️ Socket no conectado, no se puede solicitar actualización");
    }
  };

  return (
    <SocketContext.Provider value={{ flights, stats, alerts, chartData, refreshFlights }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useFlightData() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useFlightData must be used within SocketProvider");
  }
  return context;
}