import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Pencil, Trash2, Eye, Plus } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import ParkingAreaModal from "../components/ParkingAreaModal";
import StaticMapPreview from "../components/map/StaticMapPreview";
import {
  createParkingArea,
  deleteParkingArea,
  listParkingAreas,
  updateParkingArea,
} from "../lib/firestore";
import type { ParkingArea, ParkingAreaFormValues } from "../types/parking";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function HomePage() {
  const navigate = useNavigate();

  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const [loading, setLoading] = useState(true);

  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ParkingArea | null>(null);
  const [deletingArea, setDeletingArea] = useState<ParkingArea | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadAreas() {
    setLoading(true);
    try {
      const data = await listParkingAreas();
      setAreas(data);
    } catch (error: any) {
      alert(error?.message || "Failed to load parking areas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAreas();
  }, []);

  async function handleSubmitArea(values: ParkingAreaFormValues) {
    try {
      if (editingArea) {
        await updateParkingArea(editingArea.id, values);
      } else {
        await createParkingArea(values);
      }

      setAreaModalOpen(false);
      setEditingArea(null);
      await loadAreas();
    } catch (error: any) {
      throw new Error(error?.message || "Failed to save parking area");
    }
  }

  async function handleDeleteArea() {
    if (!deletingArea) return;

    setDeleteLoading(true);
    try {
      await deleteParkingArea(deletingArea.id);
      setDeletingArea(null);
      await loadAreas();
    } catch (error: any) {
      alert(error?.message || "Failed to delete parking area");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Parking Areas
          </h1>
          <p className="text-sm text-slate-600">
            Manage parking areas in Firestore. JSON upload and inference use FastAPI.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingArea(null);
            setAreaModalOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Parking Area
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-center text-sm text-slate-500">
            Loading parking areas...
          </CardContent>
        </Card>
      ) : areas.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-center text-sm text-slate-500">
            No parking areas found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {areas.map((area) => (
            <Card key={area.id} className="overflow-hidden rounded-3xl border-0 shadow-sm">
              <div className="p-4">
                <StaticMapPreview
                  latitude={area.latitude}
                  longitude={area.longitude}
                  heightClassName="h-52"
                />
              </div>

              <CardHeader className="pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {area.latitude}, {area.longitude}
                    </div>
                  </div>

                  <Badge variant="secondary">{area.capacity} slots</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Available</p>
                    <p className="font-semibold text-emerald-600">{area.availableCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Layout</p>
                    <p className="font-medium text-slate-900">
                      {area.imageWidth} × {area.imageHeight}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Geohash</p>
                    <p className="truncate font-mono text-xs text-slate-900">
                      {area.geohash ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button onClick={() => navigate(`/areas/${area.id}`)} className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingArea(area);
                      setAreaModalOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setDeletingArea(area)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ParkingAreaModal
        open={areaModalOpen}
        initialData={editingArea}
        onClose={() => {
          setAreaModalOpen(false);
          setEditingArea(null);
        }}
        onSubmit={handleSubmitArea}
      />

      <ConfirmModal
        open={!!deletingArea}
        title="Delete Parking Area"
        message={`Are you sure you want to delete "${deletingArea?.name}" and all its slots?`}
        confirmText="Delete"
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeletingArea(null);
        }}
        onConfirm={handleDeleteArea}
      />
    </div>
  );
}