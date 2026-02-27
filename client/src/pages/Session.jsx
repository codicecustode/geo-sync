//

import { useEffect, useState } from "react";
import SessionJoin from "../components/SessionJoin";
import MapView from "../components/MapView";
import HUD from "../components/HUD";
import RoleBadge from "../components/RoleBadge";
import useMapSync from "../hooks/useMapSync";
import { useSocket } from "../context/SocketContext";

export default function Session() {
  const socket = useSocket();
  const [joined, setJoined] = useState(false);
  const [role, setRole] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [map, setMap] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [hud, setHud] = useState({
    lat: 22.5937,
    lng: 78.9629,
    zoom: 4,
    status: "Searching",
  });

  useEffect(() => {
    if (!socket) return;

    const handleJoinAccepted = ({
      roomId: acceptedRoomId,
      role: acceptedRole,
    }) => {
      setRoomId(acceptedRoomId);
      setRole(acceptedRole);
      setJoined(true);
      setJoining(false);
      setJoinError("");
      setHud((p) => ({ ...p, status: "Connected" }));
    };

    const handleTrackerTaken = () => {
      setJoined(false);
      setJoining(false);
      setJoinError("This room ID already has an active tracker.");
      setHud((p) => ({ ...p, status: "Tracker already exists" }));
    };

    socket.on("join_accepted", handleJoinAccepted);
    socket.on("tracker_taken", handleTrackerTaken);

    return () => {
      socket.off("join_accepted", handleJoinAccepted);
      socket.off("tracker_taken", handleTrackerTaken);
    };
  }, [socket]);

  const joinSession = (room, r) => {
    const nextRoomId = room?.trim();
    if (!nextRoomId || !socket) {
      setJoinError("Enter a valid room ID.");
      return;
    }

    setJoining(true);
    setJoinError("");
    setJoined(false);
    socket.emit("join_session", { roomId: nextRoomId, role: r });
  };

  useMapSync(map, role, roomId, setHud);

  if (!joined) {
    return (
      <SessionJoin
        onJoin={joinSession}
        errorMessage={joinError}
        joining={joining}
      />
    );
  }

  // return (
  //   <>
  //     <MapView onReady={setMap} />
  //     <HUD {...hud} />
  //     <RoleBadge role={role} />
  //   </>
  // );
  return (
    <div className="app-container">
      <MapView onReady={setMap} hud={hud} role={role} />

      <div className="overlay">
        <HUD {...hud} />
        <RoleBadge role={role} />
      </div>
    </div>
  );
}
