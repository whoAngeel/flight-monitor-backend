import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket(onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Conecta al backend
    const socket = io("http://localhost:8000", {
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

    // Listener personalizado (si lo necesitas)
    if (onMessage) {
      socket.on("message", onMessage);
    }

    // Limpieza al desmontar
    return () => {
      socket.disconnect();
    };
  }, [onMessage]);

  return socketRef;
}
