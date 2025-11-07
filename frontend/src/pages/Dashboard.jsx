import React from "react";
import { useFlightData } from "../context/socketContext";
import FlightsMap from "../components/FlightsMap";
import FlightsChart from "../components/FlightsChart";
import StatsPanel from "../components/StatsPanel";
import FlightsList from "../components/FlightsList";
import { useState } from "react";

export default function Dashboard() {
  const { flights, stats } = useFlightData();
    const [selectedFlight, setSelectedFlight] = useState(null);


  return (
    <div className="h-full p-4 flex flex-col gap-3 overflow-hidden">
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