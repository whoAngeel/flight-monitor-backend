import React, { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import FlightsMap from "./FlightsMap";
import FlightsChart from "./FlightsChart";
import StatsPanel from "./StatsPanel";
import FlightsList from "./FlightsList";

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
    <div className="h-full p-3 flex flex-col gap-3 overflow-hidden">
      {/* Layout principal: Mapa a la izquierda, paneles a la derecha */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Mapa - Ocupa 2 columnas en desktop */}
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          <FlightsMap />
        </div>

        {/* Paneles laterales - 1 columna en desktop */}
        <div className="flex flex-col gap-3 min-h-0">
          <StatsPanel stats={stats} />
          <FlightsList flights={flights} />
        </div>
      </div>

      {/* Gráfico - Parte inferior */}
      <div className="flex-shrink-0" style={{ height: '200px' }}>
        <FlightsChart />
      </div>
    </div>
  );
}
