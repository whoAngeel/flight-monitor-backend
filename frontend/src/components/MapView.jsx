import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Icono personalizado para los aviones
const airplaneIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/189/189001.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Función para rotar el ícono según el heading
function RotatedMarker({ position, heading, children }) {
  const markerRef = L.marker(position, {
    icon: airplaneIcon,
    rotationAngle: heading,
    rotationOrigin: 'center',
  });

  useEffect(() => {
    markerRef.setRotationAngle?.(heading);
  }, [heading]);

  return (
    <Marker position={position} icon={airplaneIcon} rotationAngle={heading}>
      {children}
    </Marker>
  );
}

export default function MapView({ flights }) {
  const CDMX_CENTER = { lat: 19.4326, lng: -99.1332 };

  return (
    <div className="h-[600px] rounded-2xl overflow-hidden shadow">
      <MapContainer
        center={CDMX_CENTER}
        zoom={9}
        className="h-full w-full"
        maxBounds={[
          [19.0, -99.4], // sudoeste
          [19.6, -98.9], // noreste
        ]}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {flights.map((flight) => (
          <Marker
            key={flight.icao24}
            position={[flight.latitude, flight.longitude]}
            icon={airplaneIcon}
          >
            <Popup>
              ✈️ <strong>{flight.callsign || 'N/A'}</strong>
              <br />
              País: {flight.origin_country}
              <br />
              Altitud: {flight.altitude?.toFixed(0)} m
              <br />
              Velocidad: {(flight.velocity * 3.6).toFixed(1)} km/h
              <br />
              Dirección: {flight.heading.toFixed(0)}°
              <br />
              Último contacto:{' '}
              {new Date(flight.last_contact).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
