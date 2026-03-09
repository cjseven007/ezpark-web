import { useEffect, useState } from "react";
import geohash from "ngeohash";
import MapPicker from "./MapPicker";
import type { ParkingArea, ParkingAreaFormValues } from "../types/parking";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

interface ParkingAreaModalProps {
  open: boolean;
  initialData?: ParkingArea | null;
  onClose: () => void;
  onSubmit: (values: ParkingAreaFormValues) => Promise<void>;
}

export default function ParkingAreaModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: ParkingAreaModalProps) {
  const [name, setName] = useState("");
  const [imageWidth, setImageWidth] = useState(1920);
  const [imageHeight, setImageHeight] = useState(1080);
  const [position, setPosition] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setImageWidth(initialData.imageWidth);
      setImageHeight(initialData.imageHeight);
      setPosition({
        lat: initialData.latitude,
        lng: initialData.longitude,
      });
    } else {
      setName("");
      setImageWidth(1920);
      setImageHeight(1080);
      setPosition(undefined);
    }
  }, [initialData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!position) {
      alert("Please select a location on the map");
      return;
    }

    setLoading(true);
    try {
      const computedGeohash = geohash.encode(position.lat, position.lng);

      await onSubmit({
        name,
        latitude: position.lat,
        longitude: position.lng,
        geohash: computedGeohash,
        imageWidth,
        imageHeight,
      });

      onClose();
    } catch (error: any) {
      alert(error?.message || "Failed to save parking area");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Parking Area" : "Create Parking Area"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Area Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Image Width</Label>
              <Input
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(Number(e.target.value))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Image Height</Label>
              <Input
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight(Number(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>

          <MapPicker value={position} onChange={setPosition} />

          {position && (
            <Card className="grid gap-4 bg-slate-50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Latitude</p>
                <p className="text-sm font-medium text-slate-900">{position.lat}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Longitude</p>
                <p className="text-sm font-medium text-slate-900">{position.lng}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Geohash</p>
                <p className="text-sm font-medium text-slate-900">
                  {geohash.encode(position.lat, position.lng)}
                </p>
              </div>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Loading..."
                : initialData
                ? "Update Parking Area"
                : "Create Parking Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}