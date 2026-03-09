import { useEffect, useState } from "react";
import type { ParkingSlot, ParkingSlotFormValues } from "../types/parking";
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

interface SlotEditModalProps {
  open: boolean;
  initialData?: ParkingSlot | null;
  onClose: () => void;
  onSubmit: (values: ParkingSlotFormValues) => Promise<void>;
}

export default function SlotEditModal({
  open,
  initialData,
  onClose,
  onSubmit,
}: SlotEditModalProps) {
  const [label, setLabel] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [occupied, setOccupied] = useState<boolean | null>(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setIsAvailable(initialData.isAvailable);
      setOccupied(initialData.occupied);
      setConfidence(initialData.confidence);
      setX(initialData.x);
      setY(initialData.y);
      setW(initialData.w);
      setH(initialData.h);
    }
  }, [initialData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      await onSubmit({
        label,
        isAvailable,
        occupied,
        confidence,
        x,
        y,
        w,
        h,
      });
      onClose();
    } catch (error: any) {
      alert(error?.message || "Failed to update slot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Update Slot</DialogTitle>
        </DialogHeader>

        {initialData && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>X</Label>
                <Input
                  type="number"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Y</Label>
                <Input
                  type="number"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>W</Label>
                <Input
                  type="number"
                  value={w}
                  onChange={(e) => setW(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>H</Label>
                <Input
                  type="number"
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Availability</Label>
                <select
                  value={String(isAvailable)}
                  onChange={(e) => setIsAvailable(e.target.value === "true")}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Occupied</Label>
                <select
                  value={occupied === null ? "null" : String(occupied)}
                  onChange={(e) => {
                    if (e.target.value === "null") setOccupied(null);
                    else setOccupied(e.target.value === "true");
                  }}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="null">Null</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Confidence</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={confidence ?? ""}
                  onChange={(e) =>
                    setConfidence(e.target.value === "" ? null : Number(e.target.value))
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Loading..." : "Update Slot"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}