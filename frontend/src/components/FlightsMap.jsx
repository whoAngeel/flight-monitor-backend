import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useSocket } from "../hooks/useSocket";

const CDMX_CENTER = { lat: 19.4326, lng: -99.1332 };

const planeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

function AnimatedMarker({ flight }) {
  const markerRef = useRef(null);
  const lat = useMotionValue(flight.latitude);
  const lng = useMotionValue(flight.longitude);

  useEffect(() => {
    // Interpolación suave de latitud y longitud
    const controls = [
      animate(lat, flight.latitude, { duration: 2, ease: "easeInOut" }),
      animate(lng, flight.longitude, { duration: 2, ease: "easeInOut" }),
    ];

    return () => controls.forEach((c) => c.stop());
  }, [flight.latitude, flight.longitude]);

  useEffect(() => {
    const unsubscribeLat = lat.on("change", (val) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([val, lng.get()]);
      }
    });
    const unsubscribeLng = lng.on("change", (val) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat.get(), val]);
      }
    });

    return () => {
      unsubscribeLat();
      unsubscribeLng();
    };
  }, []);

  return (
    <Marker
      ref={markerRef}
      position={[lat.get(), lng.get()]}
      icon={planeIcon}
    >
      <Popup>
        <strong>{flight.callsign || "Sin ID"}</strong>
        <div>{flight.origin_country || "Desconocido"}</div>
        <div>Alt: {flight.altitude?.toFixed(0)} m</div>
        <div>Vel: {(flight.velocity * 3.6).toFixed(0)} km/h</div>
      </Popup>
    </Marker>
  );
}

export default function FlightsMap() {
  const [flights, setFlights] = useState([]);
  const { socket } = useSocket({
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
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {flights.map((f) => (
          <AnimatedMarker key={f.icao24} flight={f} />
        ))}
      </MapContainer>
    </div>
  );
}
