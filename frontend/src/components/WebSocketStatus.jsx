import React, { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

export default function WebSocketStatus() {
  const socketRef = useSocket((data) => {
    console.log("📨 Mensaje recibido:", data);
  });

  // Enviar datos al servidor
  const handleSend = () => {
    if (socketRef.current) {
      socketRef.current.emit("message", { content: "Hola desde React" });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Estado del WebSocket</h2>
      <button
        onClick={handleSend}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Enviar mensaje
      </button>
    </div>
  );
}
