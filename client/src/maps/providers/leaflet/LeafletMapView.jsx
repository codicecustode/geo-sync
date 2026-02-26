import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const trackerIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [40, 40],
});

const trackedIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [40, 40],
});

function createLeafletAdapter(map) {
  return {
    getCenter: () => map.getCenter(),
    getZoom: () => map.getZoom(),
    setView: (lat, lng, zoom) => map.setView([lat, lng], zoom),
    onMove: (handler) => map.on("move", handler),
    offMove: (handler) => map.off("move", handler),
  };
}

function MapReady({ onReady }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    onReady(createLeafletAdapter(map));
  }, [map, onReady]);

  return null;
}

export default function LeafletMapView({ onReady, hud, role }) {
  const [smoothPos, setSmoothPos] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (hud?.lat == null || hud?.lng == null) return;

    const target = [hud.lat, hud.lng];

    if (!smoothPos) {
      setSmoothPos(target);
      return;
    }

    const start = smoothPos;
    const duration = role === "tracker" ? 150 : 250;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const lat = start[0] + (target[0] - start[0]) * progress;
      const lng = start[1] + (target[1] - start[1]) * progress;

      setSmoothPos([lat, lng]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [hud.lat, hud.lng, role, smoothPos]);

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={3}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapReady onReady={onReady} />

      {smoothPos && (
        <Marker
          position={smoothPos}
          icon={role === "tracker" ? trackerIcon : trackedIcon}
        >
          <Popup>
            {role === "tracker"
              ? "📡 Tracker Position"
              : "👀 Tracked Position"}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
