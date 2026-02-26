import { useEffect } from "react";
import debounce from "lodash/debounce";
import { useSocket } from "../context/SocketContext";

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
      sendMove = debounce(() => {
        const center = mapAdapter.getCenter();
        let lng = center.lng;
        lng = ((lng + 180) % 360 + 360) % 360 - 180;

        const data = {
          lat: center.lat,
          lng,
          zoom: mapAdapter.getZoom(),
        };

        socket.emit("map_move", data);
        setHud({ ...data, status: "Connected" });
      }, 40);

      mapAdapter.onMove(sendMove);
    }

    const handleSync = (data) => {
      if (role === "tracked") {
        mapAdapter.setView(data.lat, data.lng, data.zoom);
        setHud({ ...data, status: "Connected" });
      }
    };

    socket.on("sync_map", handleSync);

    const handleDisconnect = () => {
      setHud((p) => ({ ...p, status: "Tracker Left" }));
    };

    socket.on("tracker_disconnected", handleDisconnect);

    return () => {
      socket.off("sync_map", handleSync);
      socket.off("tracker_disconnected", handleDisconnect);

      if (sendMove) {
        mapAdapter.offMove(sendMove);
        sendMove.cancel?.();
      }
    };
  }, [socket, mapAdapter, role, roomId, setHud]);
}