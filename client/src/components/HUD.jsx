export default function HUD({ lat, lng, zoom, status }) {
  return (
    <div className="hud">
      <p><b>Lat:</b> {lat?.toFixed(5)}</p>
      <p><b>Lng:</b> {lng?.toFixed(5)}</p>
      <p><b>Zoom:</b> {zoom}</p>
      <p><b>Status:</b> {status}</p>
    </div>
  );
}