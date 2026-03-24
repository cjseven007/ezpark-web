import type { ParkingSlot } from "../../types/parking";

interface SlotCanvasPreviewProps {
  slots: ParkingSlot[];
  imageWidth: number;
  imageHeight: number;
  className?: string;
}

function getSlotStroke(slot: ParkingSlot) {
  if (slot.occupied === true) return "#ef4444";
  if (slot.isAvailable === true) return "#22c55e";
  return "#f59e0b";
}

function getSlotFill(slot: ParkingSlot) {
  if (slot.occupied === true) return "rgba(239, 68, 68, 0.20)";
  if (slot.isAvailable === true) return "rgba(34, 197, 94, 0.20)";
  return "rgba(245, 158, 11, 0.18)";
}

function getSlotPolygonPoints(slot: ParkingSlot): Array<{ x: number; y: number }> {
  if (slot.points && slot.points.length >= 4) {
    return slot.points;
  }

  return [
    { x: slot.x, y: slot.y },
    { x: slot.x + slot.w, y: slot.y },
    { x: slot.x + slot.w, y: slot.y + slot.h },
    { x: slot.x, y: slot.y + slot.h },
  ];
}

function getCanvasBounds(
  slots: ParkingSlot[],
  imageWidth: number,
  imageHeight: number,
  padding = 40
) {
  if (slots.length === 0) {
    return {
      minX: 0,
      minY: 0,
      viewWidth: imageWidth,
      viewHeight: imageHeight,
    };
  }

  const allPoints = slots.flatMap(getSlotPolygonPoints);

  const rawMinX = Math.min(...allPoints.map((p) => p.x));
  const rawMinY = Math.min(...allPoints.map((p) => p.y));
  const rawMaxX = Math.max(...allPoints.map((p) => p.x));
  const rawMaxY = Math.max(...allPoints.map((p) => p.y));

  const minX = Math.max(0, rawMinX - padding);
  const minY = Math.max(0, rawMinY - padding);
  const maxX = Math.min(imageWidth, rawMaxX + padding);
  const maxY = Math.min(imageHeight, rawMaxY + padding);

  return {
    minX,
    minY,
    viewWidth: Math.max(1, maxX - minX),
    viewHeight: Math.max(1, maxY - minY),
  };
}

export default function SlotCanvasPreview({
  slots,
  imageWidth,
  imageHeight,
  className = "",
}: SlotCanvasPreviewProps) {
  const { minX, minY, viewWidth, viewHeight } = getCanvasBounds(
    slots,
    imageWidth,
    imageHeight,
    60
  );

  return (
    <div className={`overflow-hidden rounded-2xl border bg-slate-950 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Slot Visualizer</p>
          <p className="text-xs text-slate-400">
            Green = available, red = occupied, yellow = unknown
          </p>
        </div>
        <div className="text-xs text-slate-400">
          {Math.round(viewWidth)} × {Math.round(viewHeight)}
        </div>
      </div>

      <div className="relative aspect-video w-full bg-[radial-gradient(circle_at_center,_#1e293b,_#020617)]">
        <svg
          viewBox={`${minX} ${minY} ${viewWidth} ${viewHeight}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {slots.map((slot) => {
            const polygonPoints = getSlotPolygonPoints(slot);
            const points = polygonPoints.map((p) => `${p.x},${p.y}`).join(" ");

            const minPointX = Math.min(...polygonPoints.map((p) => p.x));
            const minPointY = Math.min(...polygonPoints.map((p) => p.y));

            const labelX = minPointX + 8;
            const labelY = minPointY + 22;

            return (
              <g key={slot.id}>
                <polygon
                  points={points}
                  fill={getSlotFill(slot)}
                  stroke={getSlotStroke(slot)}
                  strokeWidth={4}
                />
                <text
                  x={labelX}
                  y={labelY}
                  fill="white"
                  fontSize="24"
                  fontWeight="700"
                >
                  {slot.label}
                </text>
              </g>
            );
          })}
        </svg>

        {slots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            No parking slots to display
          </div>
        )}
      </div>
    </div>
  );
}