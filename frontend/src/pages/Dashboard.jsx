import React, { useState } from "react";
import { useFlightData } from "../context/socketContext";
import FlightsMap from "../components/FlightsMap";
import FlightsChart from "../components/FlightsChart";
import StatsPanel from "../components/StatsPanel";
import FlightsList from "../components/FlightsList";

export default function Dashboard() {
  const { flights, stats, refreshFlights } = useFlightData();
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshFlights();
    // Resetear el estado de carga después de un breve delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="h-full p-4 flex flex-col gap-3 overflow-hidden">
      {/* Botón de actualización manual */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? "Actualizando..." : "Actualizar vuelos"}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        <div className="lg:col-span-2 min-h-0 flex flex-col">
          <FlightsMap selectedFlight={selectedFlight} />
        </div>

        <div className="flex flex-col gap-3 min-h-0">
          <StatsPanel stats={stats} />
          <FlightsList flights={flights} onSelectFlight={setSelectedFlight} />
        </div>
      </div>

      <div className="flex-shrink-0" style={{ height: "200px" }}>
        <FlightsChart />
      </div>
    </div>
  );
}