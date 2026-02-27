import { useState } from "react";

export default function SessionJoin({ onJoin, errorMessage, joining }) {
  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState("tracker");

  return (
    <div className="join-container">
      <h1>🌍 Geo Sync</h1>

      <input
        placeholder="Enter Session ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="tracker">Tracker</option>
        <option value="tracked">Tracked</option>
      </select>

      <button onClick={() => onJoin(roomId, role)} disabled={joining}>
        {joining ? "Joining..." : "Join Session"}
      </button>

      {errorMessage && <p>{errorMessage}</p>}

      <p className="author">Made by Aman Kumar Singh</p>
    </div>
  );
}