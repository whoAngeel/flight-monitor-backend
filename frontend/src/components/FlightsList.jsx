import React from "react";

export default function FlightsList({ flights }) {
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
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {flights.map((flight, i) => (
                        <div
                            key={flight.icao24 || i}
                            className="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors border-l-2 border-blue-500"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate">
                                        {flight.callsign || "Sin ID"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {flight.origin_country || "Desconocido"}
                                    </p>
                                    {flight.altitude && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Alt: {flight.altitude?.toFixed(0)} m
                                        </p>
                                    )}
                                </div>
                            </div>
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

