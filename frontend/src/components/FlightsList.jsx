import React from "react";
import { FlightCard } from "./FlightCard";



export default function FlightsList({ flights, onSelectFlight }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 h-full flex flex-col min-h-0">
      <h3 className="text-sm font-semibold mb-2 text-gray-800 flex items-center gap-1.5">
        <span className="text-lg">✈️</span>
        Vuelos activos
        {flights.length > 0 && (
          <span className="ml-auto text-xs font-normal bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
            {flights.length}
          </span>
        )}
      </h3>

      {flights.length > 0 ? (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
          {flights.map((flight, i) => (
            <div
              key={flight.icao24 || i}
              onClick={() => onSelectFlight?.(flight)}
              className="cursor-pointer hover:bg-blue-50 transition rounded-lg"
            >
              <FlightCard flight={flight} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xs animate-pulse">
            Esperando vuelos...
          </p>
        </div>
      )}
    </div>
  );
}
