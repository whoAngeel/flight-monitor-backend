export function FlightCard({ flight }) {
  return (
    <div className="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors border-l-2 border-blue-500">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {flight.callsign || "Sin ID"}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          {flight.origin_country || "Desconocido"}
        </p>
        
        {/* Detalles en una fila para ahorrar espacio */}
        <div className="flex items-center gap-2 mt-1.5">
          {flight.altitude && (
            <p className="text-xs text-gray-500">
              Alt: {flight.altitude?.toFixed(0)} m
            </p>
          )}
          {flight.velocity && (
            <p className="text-xs text-gray-500">
              {/* CORRECCIÓN: Decía 'Alt:' en tu código original */}
              Vel: {(flight.velocity * 3.6).toFixed(1)} km/h
            </p>
          )}
        </div>
      </div>
    </div>
  );
}