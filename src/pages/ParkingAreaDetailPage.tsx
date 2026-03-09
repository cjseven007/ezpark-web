import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Pencil, Upload, Play, CarFront } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import SlotEditModal from "../components/SlotEditModal";
import StaticMapPreview from "../components/map/StaticMapPreview";
import SlotCanvasPreview from "../components/parking/SlotCanvasPreview";
import { inferFromVideo, uploadSlotsJson } from "../lib/api";
import {
  deleteSlot,
  getParkingArea,
  listSlots,
  recalculateAreaCounts,
  updateSlot,
} from "../lib/firestore";
import type { ParkingArea, ParkingSlot, ParkingSlotFormValues } from "../types/parking";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export default function ParkingAreaDetailPage() {
  const { areaId = "" } = useParams();

  const [area, setArea] = useState<ParkingArea | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<ParkingSlot | null>(null);

  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);

  const [jsonLoading, setJsonLoading] = useState(false);
  const [inferenceLoading, setInferenceLoading] = useState(false);
  const [deleteSlotLoading, setDeleteSlotLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [areaData, slotData] = await Promise.all([
        getParkingArea(areaId),
        listSlots(areaId),
      ]);

      setArea(areaData);
      setSlots(slotData);
    } catch (error: any) {
      alert(error?.message || "Failed to load parking area data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [areaId]);

  async function handleUpdateSlot(values: ParkingSlotFormValues) {
    if (!editingSlot) return;

    try {
      await updateSlot(areaId, editingSlot.id, values);
      await loadData();
    } catch (error: any) {
      throw new Error(error?.message || "Failed to update slot");
    }
  }

  async function handleUploadJson() {
    if (!jsonFile) {
      alert("Please choose a JSON file first");
      return;
    }

    setJsonLoading(true);
    try {
      await uploadSlotsJson(areaId, jsonFile);
      await recalculateAreaCounts(areaId);
      setJsonFile(null);
      await loadData();
    } catch (error: any) {
      alert(error?.message || "Failed to upload JSON");
    } finally {
      setJsonLoading(false);
    }
  }

  async function handleInference() {
    if (!videoFile) {
      alert("Please choose a video file first");
      return;
    }

    setInferenceLoading(true);
    try {
      await inferFromVideo(areaId, frameIndex, videoFile);
      await loadData();
    } catch (error: any) {
      alert(error?.message || "Failed to run inference");
    } finally {
      setInferenceLoading(false);
    }
  }

  async function handleDeleteSlot() {
    if (!deletingSlot) return;

    setDeleteSlotLoading(true);
    try {
      await deleteSlot(areaId, deletingSlot.id);
      setDeletingSlot(null);
      await loadData();
    } catch (error: any) {
      alert(error?.message || "Failed to delete slot");
    } finally {
      setDeleteSlotLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-8 text-center text-sm text-slate-500">
          Loading parking area...
        </CardContent>
      </Card>
    );
  }

  if (!area) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-8 text-center text-sm text-slate-500">
          Parking area not found.
        </CardContent>
      </Card>
    );
  }

  const occupiedCount = slots.filter((slot) => slot.occupied === true).length;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {area.name}
            </h1>
            <p className="text-sm text-slate-600">
              Manage slots, upload JSON layouts, and run video inference.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Capacity: {area.capacity}</Badge>
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              Available: {area.availableCount}
            </Badge>
            <Badge variant="destructive">Occupied: {occupiedCount}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Parking Area Location</CardTitle>
          </CardHeader>
          <CardContent>
            <StaticMapPreview
              latitude={area.latitude}
              longitude={area.longitude}
              heightClassName="h-[320px] sm:h-[420px]"
              zoom={17}
            />

            <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Latitude</p>
                <p className="text-sm font-medium text-slate-900">{area.latitude}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Longitude</p>
                <p className="text-sm font-medium text-slate-900">{area.longitude}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Geohash</p>
                <p className="text-sm font-medium text-slate-900">{area.geohash ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Bounding Box Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SlotCanvasPreview
              slots={slots}
              imageWidth={area.imageWidth}
              imageHeight={area.imageHeight}
              className="min-h-[320px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Parking Slots</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Bounding box coordinates and occupancy status
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CarFront className="h-4 w-4" />
              {slots.length} slots
            </div>
          </CardHeader>

          <CardContent>
            {slots.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                No slots found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>BBox</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">{slot.label}</TableCell>
                        <TableCell>
                          <Badge
                            variant={slot.isAvailable ? "default" : "secondary"}
                            className={
                              slot.isAvailable ? "bg-emerald-600 hover:bg-emerald-600" : ""
                            }
                          >
                            {String(slot.isAvailable)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {slot.occupied === null ? (
                            <Badge variant="secondary">null</Badge>
                          ) : slot.occupied ? (
                            <Badge variant="destructive">true</Badge>
                          ) : (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600">
                              false
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{slot.confidence ?? "-"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          x:{slot.x}, y:{slot.y}, w:{slot.w}, h:{slot.h}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingSlot(slot)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingSlot(slot)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Upload JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Replace slots from your bounding box JSON file.
              </p>

              <Input
                type="file"
                accept=".json"
                disabled={jsonLoading}
                onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
              />

              <Button
                onClick={handleUploadJson}
                disabled={jsonLoading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {jsonLoading ? "Loading..." : "Upload JSON"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Run Video Inference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Extract a frame from video and update slot occupancy.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Frame Index</label>
                <Input
                  type="number"
                  value={frameIndex}
                  disabled={inferenceLoading}
                  onChange={(e) => setFrameIndex(Number(e.target.value))}
                />
              </div>

              <Input
                type="file"
                accept="video/*"
                disabled={inferenceLoading}
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />

              <Button
                onClick={handleInference}
                disabled={inferenceLoading}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                {inferenceLoading ? "Loading..." : "Run Inference"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <SlotEditModal
        open={!!editingSlot}
        initialData={editingSlot}
        onClose={() => setEditingSlot(null)}
        onSubmit={handleUpdateSlot}
      />

      <ConfirmModal
        open={!!deletingSlot}
        title="Delete Slot"
        message={`Are you sure you want to delete "${deletingSlot?.label}"?`}
        confirmText="Delete"
        loading={deleteSlotLoading}
        onCancel={() => {
          if (!deleteSlotLoading) setDeletingSlot(null);
        }}
        onConfirm={handleDeleteSlot}
      />
    </div>
  );
}