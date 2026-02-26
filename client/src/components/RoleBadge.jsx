export default function RoleBadge({ role }) {
  return (
    <div className={`badge ${role}`}>
      {role === "tracker" ? "📡 Broadcasting" : "👀 Syncing"}
    </div>
  );
}