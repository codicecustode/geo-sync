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
  const isTrackedWithoutTracker =
    role === "tracked" && hud?.status === "Tracker Left";

  const [smoothPos, setSmoothPos] = useState(() =>
    hud?.lat == null || hud?.lng == null ? null : [hud.lat, hud.lng]
  );
  const animationRef = useRef(null);
  const smoothPosRef = useRef(
    hud?.lat == null || hud?.lng == null ? null : [hud.lat, hud.lng]
  );

  const normalizeToReferenceLng = (lng, referenceLng) => {
    let normalized = lng;
    let delta = normalized - referenceLng;

    if (delta > 180) normalized -= 360;
    if (delta < -180) normalized += 360;

    return normalized;
  };

  useEffect(() => {
    if (hud?.lat == null || hud?.lng == null) return;

    const target = [hud.lat, hud.lng];

    if (!smoothPosRef.current) {
      smoothPosRef.current = target;
    }

    const start = smoothPosRef.current;
    const duration = role === "tracker" ? 150 : 250;
    const startTime = performance.now();

    let targetLng = target[1];
    let deltaLng = targetLng - start[1];

    if (deltaLng > 180) targetLng -= 360;
    if (deltaLng < -180) targetLng += 360;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      const lat = start[0] + (target[0] - start[0]) * progress;
      const lng = start[1] + (targetLng - start[1]) * progress;

      const nextPos = [lat, lng];
      smoothPosRef.current = nextPos;

      setSmoothPos(nextPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [hud.lat, hud.lng, role]);

  return (
    <MapContainer
      center={[hud.lat??28.6139, hud.lng??77.209]}
      zoom={hud.zoom??3}
      worldCopyJump={true}
      dragging={!isTrackedWithoutTracker}
      touchZoom={!isTrackedWithoutTracker}
      scrollWheelZoom={!isTrackedWithoutTracker}
      doubleClickZoom={!isTrackedWithoutTracker}
      boxZoom={!isTrackedWithoutTracker}
      keyboard={!isTrackedWithoutTracker}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapReady onReady={onReady} />

      {smoothPos && (
        <Marker
          position={[
            smoothPos[0],
            normalizeToReferenceLng(smoothPos[1], hud?.lng ?? smoothPos[1]),
          ]}
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
