import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket({ onFlightsUpdate, onStatsUpdate } = {}) {
  const socketRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const socket = io(apiUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Conectado al WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Desconectado del WebSocket");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Error de conexión WS:", err.message);
    });

    // === Listeners personalizados ===
    if (onFlightsUpdate) {
      socket.on("flights_update", onFlightsUpdate);
    }

    if (onStatsUpdate) {
      socket.on("stats_update", onStatsUpdate);
    }

    return () => {
      socket.disconnect();
    };
  }, [onFlightsUpdate, onStatsUpdate]);

  return socketRef;
}
