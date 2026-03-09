import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface StaticMapPreviewProps {
  latitude: number;
  longitude: number;
  heightClassName?: string;
  zoom?: number;
}

export default function StaticMapPreview({
  latitude,
  longitude,
  heightClassName = "h-48",
  zoom = 16,
}: StaticMapPreviewProps) {
  const center: LatLngExpression = [latitude, longitude];

  return (
    <div className={`relative z-0 overflow-hidden rounded-2xl border ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        zoomControl={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ zIndex: 0 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}