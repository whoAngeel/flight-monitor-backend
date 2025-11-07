import React from "react";

export default function StatsPanel({ stats }) {
    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 h-full flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-2 text-gray-800 flex items-center gap-1.5">
                <span className="text-lg">📊</span>
                Estadísticas
            </h3>
            {stats ? (
                <div className="flex-1 space-y-2 overflow-y-auto">
                    <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Vuelos totales</p>
                        <p className="text-xl font-bold text-indigo-600">
                            {stats.total_flights || 0}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Velocidad promedio</p>
                        <p className="text-lg font-semibold text-blue-600">
                            {stats.avg_speed?.toFixed(1) || "0.0"} km/h
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600 mb-0.5">Altitud media</p>
                        <p className="text-lg font-semibold text-green-600">
                            {stats.avg_altitude?.toFixed(1) || "0.0"} m
                        </p>
                    </div>
                    {stats.active_flights !== undefined && (
                        <div className="bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-600 mb-0.5">Vuelos activos (ultimos 2 min)</p>
                            <p className="text-xl font-bold text-purple-600">
                                {stats.active_flights}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-xs animate-pulse">Esperando datos...</p>
                </div>
            )}
        </div>
    );
}

