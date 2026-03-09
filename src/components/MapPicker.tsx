import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ChangeView({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);

  return null;
}

function ClickHandler({
  onSelect,
}: {
  onSelect: (value: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: any) => {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onSelect]);

  return null;
}

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (value: { lat: number; lng: number }) => void;
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const [searchText, setSearchText] = useState("");
  const [center, setCenter] = useState<LatLngExpression>(
    value ? [value.lat, value.lng] : [4.2105, 101.9758]
  );

  useEffect(() => {
    if (value) {
      setCenter([value.lat, value.lng]);
    }
  }, [value]);

  const markerPosition = useMemo<LatLngExpression | null>(() => {
    if (!value) return null;
    return [value.lat, value.lng];
  }, [value]);

  async function searchLocation() {
    if (!searchText.trim()) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchText
      )}`
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const lat = Number(first.lat);
      const lng = Number(first.lon);

      setCenter([lat, lng]);
      onChange({ lat, lng });
    } else {
      alert("Location not found");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              searchLocation();
            }
          }}
          placeholder="Search location"
        />
        <Button type="button" onClick={searchLocation}>
          Search
        </Button>
      </div>

      <div className="h-[320px] overflow-hidden rounded-2xl border sm:h-[400px]">
        <MapContainer center={center} zoom={16} className="h-full w-full">
          <ChangeView center={center} zoom={16} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={onChange} />
          {markerPosition && <Marker position={markerPosition} icon={markerIcon} />}
        </MapContainer>
      </div>
    </div>
  );
}