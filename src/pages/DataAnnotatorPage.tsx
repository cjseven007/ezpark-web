import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  hasExistingSlots,
  listParkingAreas,
  replaceAllSlotsFromAnnotation,
} from "../lib/firestore";
import type { AnnotatedSlotPolygon, ParkingArea } from "../types/parking";

type SourceType = "image" | "video" | null;

export default function DataAnnotatorPage() {
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [frameTime, setFrameTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [drawnPolygons, setDrawnPolygons] = useState<AnnotatedSlotPolygon[]>([]);
  const [draftPoints, setDraftPoints] = useState<Array<{ x: number; y: number }>>([]);

  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [uploading, setUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    async function loadAreas() {
      const data = await listParkingAreas();
      setAreas(data);
    }
    loadAreas();
  }, []);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (capturedImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(capturedImageUrl);
      }
    };
  }, [sourceUrl, capturedImageUrl]);

  function resetWorkspace() {
    setFrameTime(0);
    setVideoDuration(0);
    setCapturedImageUrl(null);
    setDrawnPolygons([]);
    setDraftPoints([]);
    setImageSize({ width: 0, height: 0 });
  }

  function handleFileChange(file: File | null) {
    if (!file) return;

    resetWorkspace();
    setSourceFile(file);

    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    if (file.type.startsWith("image/")) {
      setSourceType("image");
      setCapturedImageUrl(url);
    } else if (file.type.startsWith("video/")) {
      setSourceType("video");
    } else {
      alert("Please upload an image or video file");
    }
  }

  async function captureVideoFrame() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImageUrl(dataUrl);
    setImageSize({ width: canvas.width, height: canvas.height });
    setDrawnPolygons([]);
    setDraftPoints([]);
  }

  function onImageLoaded() {
    const img = imageRef.current;
    if (!img) return;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    setImageSize({ width: naturalWidth, height: naturalHeight });
  }

  function getImageCoordinates(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): { x: number; y: number } | null {
    const img = imageRef.current;
    if (!img) return null;

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX < 0 || clickY < 0 || clickX > rect.width || clickY > rect.height) {
      return null;
    }

    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    return {
      x: Math.round(clickX * scaleX),
      y: Math.round(clickY * scaleY),
    };
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!capturedImageUrl) return;

    const point = getImageCoordinates(e);
    if (!point) return;

    const nextPoints = [...draftPoints, point];

    if (nextPoints.length === 4) {
      const newPolygon: AnnotatedSlotPolygon = {
        id: crypto.randomUUID(),
        points: nextPoints,
      };

      setDrawnPolygons((prev) => [...prev, newPolygon]);
      setDraftPoints([]);
    } else {
      setDraftPoints(nextPoints);
    }
  }

  function removeLastPoint() {
    setDraftPoints((prev) => prev.slice(0, -1));
  }

  function removeLastPolygon() {
    setDrawnPolygons((prev) => prev.slice(0, -1));
  }

  function clearAll() {
    setDrawnPolygons([]);
    setDraftPoints([]);
  }

  const jsonPreview = useMemo(() => {
    return JSON.stringify(
      drawnPolygons.map((polygon) => ({
        points: polygon.points.map((p) => [p.x, p.y]),
      })),
      null,
      2
    );
  }, [drawnPolygons]);

  function downloadJson() {
    if (drawnPolygons.length === 0) {
      alert("No annotated slots to export");
      return;
    }

    const blob = new Blob([jsonPreview], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "boundingbox.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  async function uploadToParkingArea() {
    if (!selectedAreaId) {
      alert("Please select a parking area");
      return;
    }

    if (drawnPolygons.length === 0) {
      alert("No annotated slots to upload");
      return;
    }

    setUploading(true);
    try {
      const exists = await hasExistingSlots(selectedAreaId);

      if (exists) {
        const confirmed = window.confirm(
          "This parking area already has existing slots. Do you want to overwrite them?"
        );
        if (!confirmed) {
          setUploading(false);
          return;
        }
      }

      await replaceAllSlotsFromAnnotation(selectedAreaId, drawnPolygons);
      alert("Slots uploaded successfully");
    } catch (error: any) {
      alert(error?.message || "Failed to upload slots");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Annotator
        </h1>
        <p className="text-sm text-slate-600">
          Upload an image or video, select a frame if needed, then annotate parking slots.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Bounding Box Annotation Workspace</CardTitle>
            <Badge variant="secondary">
              {drawnPolygons.length} slot{drawnPolygons.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Upload Image or Video</Label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Parking Area for Upload</Label>
             <Select
                  value={selectedAreaId}
                  onValueChange={(value) => setSelectedAreaId(value ?? "")}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Choose parking area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sourceType === "video" && sourceUrl && (
            <Card className="rounded-2xl border bg-slate-50">
              <CardContent className="space-y-4 p-4">
                <video
                  ref={videoRef}
                  src={sourceUrl}
                  controls
                  className="max-h-[420px] w-full rounded-xl bg-black"
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    setVideoDuration(video.duration || 0);
                    setFrameTime(0);
                  }}
                />

                <div className="space-y-2">
                  <Label>Select Frame Time (seconds)</Label>
                  <Input
                    type="range"
                    min={0}
                    max={videoDuration || 0}
                    step={0.1}
                    value={frameTime}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setFrameTime(next);
                      if (videoRef.current) {
                        videoRef.current.currentTime = next;
                      }
                    }}
                  />
                  <p className="text-sm text-slate-600">{frameTime.toFixed(1)} s</p>
                </div>

                <Button type="button" onClick={captureVideoFrame}>
                  Convert Selected Frame to Image
                </Button>
              </CardContent>
            </Card>
          )}

          {capturedImageUrl && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={removeLastPoint}>
                  Remove Last Point
                </Button>
                <Button type="button" variant="outline" onClick={removeLastPolygon}>
                  Remove Last Slot
                </Button>
                <Button type="button" variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
                <Button type="button" onClick={downloadJson}>
                  Download JSON
                </Button>
                <Button type="button" onClick={uploadToParkingArea} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload to Firebase"}
                </Button>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Click 4 points in order for each parking slot. After the 4th point, one slot
                is created automatically.
              </div>

              <div
                className="relative inline-block max-w-full cursor-crosshair overflow-auto rounded-2xl border bg-black"
                onClick={handleCanvasClick}
              >
                <img
                  ref={imageRef}
                  src={capturedImageUrl}
                  alt="Annotation source"
                  onLoad={onImageLoaded}
                  className="block max-h-[75vh] max-w-full"
                />

                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                  preserveAspectRatio="none"
                >
                  {drawnPolygons.map((polygon, index) => (
                    <g key={polygon.id}>
                      <polygon
                        points={polygon.points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="rgba(34,197,94,0.18)"
                        stroke="#22c55e"
                        strokeWidth={3}
                      />
                      <text
                        x={polygon.points[0].x + 8}
                        y={polygon.points[0].y + 22}
                        fill="white"
                        fontSize="20"
                        fontWeight="700"
                      >
                        {index + 1}
                      </text>
                    </g>
                  ))}

                  {draftPoints.map((point, index) => (
                    <g key={`draft-${index}`}>
                      <circle cx={point.x} cy={point.y} r={5} fill="#f59e0b" />
                      <text
                        x={point.x + 8}
                        y={point.y - 8}
                        fill="#f59e0b"
                        fontSize="16"
                        fontWeight="700"
                      >
                        {index + 1}
                      </text>
                    </g>
                  ))}

                  {draftPoints.length > 1 && (
                    <polyline
                      points={draftPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                    />
                  )}
                </svg>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>JSON Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                    {jsonPreview}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}