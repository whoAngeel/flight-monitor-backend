import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

// Coordenadas centradas en CDMX
const CDMX_CENTER = { lat: 19.4326, lng: -99.1332 };

// Ícono personalizado para el avión
const planeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function FlightsMap() {
  const [flights, setFlights] = useState([]);

  useSocket({
    onFlightsUpdate: (data) => {
      setFlights(data);
    },
  });

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={CDMX_CENTER}
        zoom={9}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {flights.map((flight) => (
          <Marker
            key={flight.icao24}
            position={[flight.latitude, flight.longitude]}
            icon={planeIcon}
          >
            <Popup>
              <strong>{flight.callsign || "Sin ID"}</strong>
              <br />
              País: {flight.origin_country}
              <br />
              Altitud: {flight.altitude?.toFixed(0)} m
              <br />
              Velocidad: {(flight.velocity * 3.6).toFixed(1)} km/h
              <br />
              Rumbo: {flight.heading?.toFixed(0)}°
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
