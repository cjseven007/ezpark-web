import {
  GeoPoint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import geohash from "ngeohash";
import { db } from "./firebase";
import type{
  ParkingArea,
  ParkingAreaFormValues,
  ParkingSlot,
  ParkingSlotFormValues,
} from "../types/parking";

const PARKING_AREAS = "parking_areas";
const SLOTS = "slots";

function rectanglePointsFromBBox(x: number, y: number, w: number, h: number) {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

export async function listParkingAreas(): Promise<ParkingArea[]> {
  const q = query(collection(db, PARKING_AREAS), orderBy("name"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    const gp = data?.geo?.geopoint;

    return {
      id: d.id,
      name: data?.name ?? d.id,
      latitude: gp?.latitude ?? 0,
      longitude: gp?.longitude ?? 0,
      geohash: data?.geo?.geohash ?? null,
      capacity: data?.capacity ?? 0,
      availableCount: data?.availableCount ?? 0,
      imageWidth: data?.layout?.imageWidth ?? 1920,
      imageHeight: data?.layout?.imageHeight ?? 1080,
    };
  });
}

export async function getParkingArea(areaId: string): Promise<ParkingArea | null> {
  const ref = doc(db, PARKING_AREAS, areaId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data() as any;
  const gp = data?.geo?.geopoint;

  return {
    id: snap.id,
    name: data?.name ?? snap.id,
    latitude: gp?.latitude ?? 0,
    longitude: gp?.longitude ?? 0,
    geohash: data?.geo?.geohash ?? null,
    capacity: data?.capacity ?? 0,
    availableCount: data?.availableCount ?? 0,
    imageWidth: data?.layout?.imageWidth ?? 1920,
    imageHeight: data?.layout?.imageHeight ?? 1080,
  };
}

export async function createParkingArea(values: ParkingAreaFormValues) {
  await addDoc(collection(db, PARKING_AREAS), {
    name: values.name,
    geo: {
      geopoint: new GeoPoint(values.latitude, values.longitude),
      geohash: values.geohash || geohash.encode(values.latitude, values.longitude),
    },
    capacity: 0,
    availableCount: 0,
    layout: {
      imageWidth: values.imageWidth,
      imageHeight: values.imageHeight,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateParkingArea(areaId: string, values: ParkingAreaFormValues) {
  const ref = doc(db, PARKING_AREAS, areaId);

  await updateDoc(ref, {
    name: values.name,
    geo: {
      geopoint: new GeoPoint(values.latitude, values.longitude),
      geohash: values.geohash || geohash.encode(values.latitude, values.longitude),
    },
    layout: {
      imageWidth: values.imageWidth,
      imageHeight: values.imageHeight,
    },
    updatedAt: serverTimestamp(),
  });
}

export async function deleteParkingArea(areaId: string) {
  const slotsRef = collection(db, PARKING_AREAS, areaId, SLOTS);
  const slotsSnap = await getDocs(slotsRef);

  for (const slotDoc of slotsSnap.docs) {
    await deleteDoc(slotDoc.ref);
  }

  await deleteDoc(doc(db, PARKING_AREAS, areaId));
}

export async function listSlots(areaId: string): Promise<ParkingSlot[]> {
  const q = query(collection(db, PARKING_AREAS, areaId, SLOTS), orderBy("label"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    const bbox = data?.bbox ?? {};

    return {
      id: d.id,
      label: data?.label ?? d.id,
      isAvailable: data?.isAvailable ?? false,
      occupied: data?.occupied ?? null,
      confidence: data?.confidence ?? null,
      x: Number(bbox?.x ?? 0),
      y: Number(bbox?.y ?? 0),
      w: Number(bbox?.w ?? 0),
      h: Number(bbox?.h ?? 0),
      points: Array.isArray(data?.points) ? data.points : [],
    };
  });
}

export async function updateSlot(
  areaId: string,
  slotId: string,
  values: ParkingSlotFormValues
) {
  const ref = doc(db, PARKING_AREAS, areaId, SLOTS, slotId);

  await updateDoc(ref, {
    label: values.label,
    isAvailable: values.isAvailable,
    occupied: values.occupied,
    confidence: values.confidence,
    bbox: {
      x: values.x,
      y: values.y,
      w: values.w,
      h: values.h,
    },
    points: rectanglePointsFromBBox(values.x, values.y, values.w, values.h),
    updatedAt: serverTimestamp(),
  });

  await recalculateAreaCounts(areaId);
}

export async function deleteSlot(areaId: string, slotId: string) {
  await deleteDoc(doc(db, PARKING_AREAS, areaId, SLOTS, slotId));
  await recalculateAreaCounts(areaId);
}

export async function recalculateAreaCounts(areaId: string) {
  const slots = await listSlots(areaId);
  const capacity = slots.length;
  const availableCount = slots.filter((slot) => slot.isAvailable).length;

  await updateDoc(doc(db, PARKING_AREAS, areaId), {
    capacity,
    availableCount,
    updatedAt: serverTimestamp(),
  });
}

export async function createOrReplaceSlotDirectly(
  areaId: string,
  slotId: string,
  values: ParkingSlotFormValues
) {
  const ref = doc(db, PARKING_AREAS, areaId, SLOTS, slotId);

  await setDoc(
    ref,
    {
      label: values.label,
      isAvailable: values.isAvailable,
      occupied: values.occupied,
      confidence: values.confidence,
      lastFrameIndex: null,
      bbox: {
        x: values.x,
        y: values.y,
        w: values.w,
        h: values.h,
      },
      points: rectanglePointsFromBBox(values.x, values.y, values.w, values.h),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await recalculateAreaCounts(areaId);
}