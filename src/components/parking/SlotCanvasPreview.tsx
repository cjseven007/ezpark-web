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

export default function SlotCanvasPreview({
  slots,
  imageWidth,
  imageHeight,
  className = "",
}: SlotCanvasPreviewProps) {
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
          {imageWidth} × {imageHeight}
        </div>
      </div>

      <div className="relative aspect-video w-full bg-[radial-gradient(circle_at_center,_#1e293b,_#020617)]">
        <svg
          viewBox={`0 0 ${imageWidth} ${imageHeight}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {slots.map((slot) => {
            const points =
              slot.points && slot.points.length >= 4
                ? slot.points.map((p) => `${p.x},${p.y}`).join(" ")
                : `${slot.x},${slot.y} ${slot.x + slot.w},${slot.y} ${slot.x + slot.w},${slot.y + slot.h} ${slot.x},${slot.y + slot.h}`;

            const labelX = slot.x + 8;
            const labelY = slot.y + 22;

            return (
              <g key={slot.id}>
                <polygon
                  points={points}
                  fill={getSlotFill(slot)}
                  stroke={getSlotStroke(slot)}
                  strokeWidth={4}
                  rx={8}
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