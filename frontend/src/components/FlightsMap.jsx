import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useMotionValue, animate } from "framer-motion";
import { useFlightData } from "../context/socketContext";
import "leaflet-rotatedmarker";

const CDMX_CENTER = { lat: 19.4326, lng: -99.1332 };

const planeIcon = new L.Icon({
  iconUrl:
    "https://images.vexels.com/media/users/3/153005/isolated/preview/b3c3b1a530afa43f61cf4207c75cc6e0-icono-de-trazo-de-color-de-avion.png",
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5],
});

// 🔹 Hook auxiliar para centrar mapa y abrir popup
function FlyToAndOpenPopup({ selectedFlight, markersRef }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFlight && markersRef.current[selectedFlight.icao24]) {
      const marker = markersRef.current[selectedFlight.icao24];
      const position = [selectedFlight.latitude, selectedFlight.longitude];
      map.flyTo(position, 9, { duration: 1.5 });
      marker.openPopup();
    }
  }, [selectedFlight, map, markersRef]);

  return null;
}

function AnimatedMarker({ flight, markersRef }) {
  const markerRef = useRef(null);
  const lat = useMotionValue(flight.latitude);
  const lng = useMotionValue(flight.longitude);
  const heading = useMotionValue(flight.heading || 0);

  // Guardamos la referencia del marcador
  useEffect(() => {
    if (markerRef.current) {
      markersRef.current[flight.icao24] = markerRef.current;
    }
  }, [flight.icao24, markersRef]);

  useEffect(() => {
    if (markerRef.current) {
      const controls = [
        animate(lat, flight.latitude, { duration: 2 }),
        animate(lng, flight.longitude, { duration: 2 }),
        animate(heading, flight.heading || 0, { duration: 2 }),
      ];
      return () => controls.forEach((c) => c.stop());
    }
  }, [flight.latitude, flight.longitude, flight.heading]);

  useEffect(() => {
    const updateMarker = () => {
      const marker = markerRef.current;
      if (marker) {
        marker.setLatLng([lat.get(), lng.get()]);
        marker.setRotationAngle((heading.get() || 0) + 45);
      }
    };
    const unsubLat = lat.on("change", updateMarker);
    const unsubLng = lng.on("change", updateMarker);
    const unsubHead = heading.on("change", updateMarker);
    return () => {
      unsubLat();
      unsubLng();
      unsubHead();
    };
  }, [lat, lng, heading]);

  return (
    <Marker
      ref={markerRef}
      position={[flight.latitude, flight.longitude]}
      icon={planeIcon}
    >
      <Popup>
        <div className="text-sm space-y-1">
          <div className="font-bold text-lg border-b pb-1 mb-2">
            ✈️ {flight.callsign || "Sin ID"}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="text-gray-600">País:</div>
            <div className="font-semibold">
              {flight.origin_country || "Desconocido"}
            </div>

            <div className="text-gray-600">ICAO24:</div>
            <div className="font-mono text-xs">{flight.icao24}</div>

            <div className="text-gray-600">Altitud:</div>
            <div className="font-semibold">{flight.altitude?.toFixed(0)} m</div>

            <div className="text-gray-600">Velocidad:</div>
            <div className="font-semibold">
              {(flight.velocity * 3.6).toFixed(0)} km/h
            </div>

            <div className="text-gray-600">Rumbo:</div>
            <div className="font-semibold">{flight.heading?.toFixed(1)}°</div>

            <div className="text-gray-600">Vel. Vertical:</div>
            <div className="font-semibold">
              {flight.vertical_rate?.toFixed(2)} m/s
              {flight.vertical_rate > 0
                ? " ⬆️"
                : flight.vertical_rate < 0
                ? " ⬇️"
                : " ➡️"}
            </div>

            <div className="text-gray-600">Estado:</div>
            <div className="font-semibold">
              {flight.on_ground ? "🛬 En tierra" : "🛫 En vuelo"}
            </div>

            <div className="text-gray-600">Último contacto:</div>
            <div className="text-xs">
              {new Date(flight.last_contact).toLocaleTimeString("es-MX")}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function FlightsMap({ selectedFlight }) {
  const { flights } = useFlightData();
  const markersRef = useRef({});

  return (
    <div className="h-full w-full rounded-lg overflow-hidden bg-white">
      <MapContainer
        center={CDMX_CENTER}
        zoom={9}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {flights.map((f) => (
          <AnimatedMarker key={f.icao24} flight={f} markersRef={markersRef} />
        ))}

        <FlyToAndOpenPopup
          selectedFlight={selectedFlight}
          markersRef={markersRef}
        />
      </MapContainer>
    </div>
  );
}
