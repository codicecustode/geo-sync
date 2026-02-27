//

import { useState } from "react";
import SessionJoin from "../components/SessionJoin";
import MapView from "../components/MapView";
import HUD from "../components/HUD";
import RoleBadge from "../components/RoleBadge";
import useMapSync from "../hooks/useMapSync";

export default function Session() {
  const [joined, setJoined] = useState(false);
  const [role, setRole] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [map, setMap] = useState(null);

  const [hud, setHud] = useState({
    lat: 22.5937,
    lng: 78.9629,
    zoom: 4,
    status: "Searching",
  });

  const joinSession = (room, r) => {
    setRoomId(room);
    setRole(r);
    setJoined(true);
  };

  useMapSync(map, role, roomId, setHud);

  if (!joined) return <SessionJoin onJoin={joinSession} />;

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

      {/* FLOATING OVERLAY */}
      <HUD {...hud} />
      <RoleBadge role={role} />
    </div>
  );
}
