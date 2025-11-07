import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import { useSocket } from "../hooks/useSocket";

// Coordenadas centradas en CDMX
const CDMX_CENTER = { lat: 19.4326, lng: -99.1332 };

// Ícono minimalista para el avión - más pequeño y simple
const planeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export default function FlightsMap() {
  const [flights, setFlights] = useState([]);

  useSocket({
    onFlightsUpdate: (data) => {
      setFlights(data);
    },
  });

  return (
    <div className="h-full w-full rounded-lg overflow-hidden bg-white">
      <MapContainer
        center={CDMX_CENTER}
        zoom={9}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={false}
      >
        {/* Tile layer minimalista - CartoDB Positron (más limpio) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {flights.map((flight) => (
          <Marker
            key={flight.icao24}
            position={[flight.latitude, flight.longitude]}
            icon={planeIcon}
          >
            <Popup className="custom-popup" maxWidth={200}>
              <div className="p-2">
                <strong className="text-sm text-gray-800">
                  {flight.callsign || "Sin ID"}
                </strong>
                <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                  <p>{flight.origin_country || "Desconocido"}</p>
                  {flight.altitude && (
                    <p>Alt: {flight.altitude?.toFixed(0)} m</p>
                  )}
                  {flight.velocity && (
                    <p>Vel: {(flight.velocity * 3.6).toFixed(0)} km/h</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
