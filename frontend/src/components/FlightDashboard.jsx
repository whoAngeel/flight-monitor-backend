import React, { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import FlightsMap from "./FlightsMap";

export default function FlightsDashboard() {
  const [flights, setFlights] = useState([]);
  const [stats, setStats] = useState(null);

  // Hook con callbacks para actualizar estado
  useSocket({
    onFlightsUpdate: (data) => {
      console.log("✈️ flights_update recibido:", data);
      setFlights(data);
    },
    onStatsUpdate: (data) => {
      console.log("📊 stats_update recibido:", data);
      setStats(data);
    },
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🛰️ Monitoreo de vuelos</h2>

      <div>
        <FlightsMap />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Panel de estadísticas */}
        <div className="bg-gray-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Estadísticas</h3>
          {stats ? (
            <ul>
              <li>Vuelos totales: {stats.total_flights}</li>
              <li>Promedio velocidad: {stats.avg_speed?.toFixed(1)} km/h</li>
              <li>Altitud media: {stats.avg_altitude?.toFixed(1)} m</li>
            </ul>
          ) : (
            <p>Esperando datos...</p>
          )}
        </div>

        {/* Lista de vuelos */}
        <div className="bg-gray-100 p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Vuelos activos</h3>
          {flights.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {flights.map((f, i) => (
                <li key={i} className="border-b border-gray-300 py-1">
                  {f.callsign || "Sin ID"} — {f.origin_country}
                </li>
              ))}
            </ul>
          ) : (
            <p>Esperando actualización de vuelos...</p>
          )}
        </div>
      </div>
    </div>
  );
}
