const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://parking-management-api-148285109899.europe-west1.run.app";

export async function uploadSlotsJson(areaId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/parking-areas/${areaId}/slots/upload-json`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to upload JSON");
  }

  return res.json();
}

export async function inferFromVideo(areaId: string, frameIndex: number, video: File) {
  const formData = new FormData();
  formData.append("frameIndex", String(frameIndex));
  formData.append("video", video);

  const res = await fetch(`${API_BASE_URL}/parking-areas/${areaId}/infer-from-video`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to run inference");
  }

  return res.json();
}