export interface ParkingArea {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  geohash: string | null;
  capacity: number;
  availableCount: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ParkingSlot {
  id: string;
  label: string;
  isAvailable: boolean;
  occupied: boolean | null;
  confidence: number | null;
  x: number;
  y: number;
  w: number;
  h: number;
  points?: Array<{ x: number; y: number }>;
}

export interface ParkingAreaFormValues {
  name: string;
  latitude: number;
  longitude: number;
  geohash: string;
  imageWidth: number;
  imageHeight: number;
}

export interface ParkingSlotFormValues {
  label: string;
  isAvailable: boolean;
  occupied: boolean | null;
  confidence: number | null;
  x: number;
  y: number;
  w: number;
  h: number;
}