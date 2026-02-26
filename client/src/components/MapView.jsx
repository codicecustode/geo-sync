import { MAP_PROVIDER } from "../maps/providerConfig";
import { getMapProvider } from "../maps/providers";

export default function MapView({ onReady, hud, role }) {
  const ProviderMapView = getMapProvider(MAP_PROVIDER);
  return <ProviderMapView onReady={onReady} hud={hud} role={role} />;
}