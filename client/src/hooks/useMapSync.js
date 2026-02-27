import { useEffect } from "react";
import throttle from "lodash/throttle";
import { useSocket } from "../context/SocketContext";

const EMIT_INTERVAL_MS = 60;
const MIN_LAT_LNG_DELTA = 0.000001;
const MIN_ZOOM_DELTA = 0.01;
const COORD_PRECISION = 7;
const ZOOM_PRECISION = 4;

export default function useMapSync(mapAdapter, role, roomId, setHud) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !role || !roomId) return;
    socket.emit("join_session", { roomId, role });
  }, [socket, role, roomId]);

  useEffect(() => {
    if (!socket || !mapAdapter || !role || !roomId) return;

    let sendMove;

    if (role === "tracker") {
      let lastEmitted = null;

      sendMove = throttle(() => {
        const center = mapAdapter.getCenter();

        const data = {
          lat: Number(center.lat.toFixed(COORD_PRECISION)),
          lng: Number(center.lng.toFixed(COORD_PRECISION)),
          zoom: Number(mapAdapter.getZoom().toFixed(ZOOM_PRECISION)),
        };

        setHud({ ...data, status: "Connected" });

        const shouldEmit =
          !lastEmitted ||
          Math.abs(data.lat - lastEmitted.lat) >= MIN_LAT_LNG_DELTA ||
          Math.abs(data.lng - lastEmitted.lng) >= MIN_LAT_LNG_DELTA ||
          Math.abs(data.zoom - lastEmitted.zoom) >= MIN_ZOOM_DELTA;

        if (shouldEmit) {
          socket.volatile.emit("map_move", data);
          lastEmitted = data;
        }
      }, EMIT_INTERVAL_MS, { leading: true, trailing: true });

      mapAdapter.onMove(sendMove);
    }

    const handleSync = (data) => {
      if (role === "tracked") {
        mapAdapter.setView(data.lat, data.lng, data.zoom);
        setHud({ ...data, status: "Connected" });
      }
    };

    socket.on("sync_map", handleSync);

    const handleConnectionStatus = (status) => {
      setHud((p) => ({ ...p, status: status || "Connected" }));
    };

    socket.on("connection_status", handleConnectionStatus);

    const handleDisconnect = () => {
      setHud((p) => ({ ...p, status: "Tracker Left" }));
    };

    socket.on("tracker_disconnected", handleDisconnect);

    return () => {
      socket.off("sync_map", handleSync);
      socket.off("connection_status", handleConnectionStatus);
      socket.off("tracker_disconnected", handleDisconnect);

      if (sendMove) {
        mapAdapter.offMove(sendMove);
        sendMove.cancel?.();
      }
    };
  }, [socket, mapAdapter, role, roomId, setHud]);
}