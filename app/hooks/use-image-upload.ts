
"use client";

import { useState } from "react";
import { uploadToCloudinary, type UploadedImage } from "@/lib/cloudinary-upload";

export function useImageUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File, folder?: string): Promise<UploadedImage | null> {
    setBusy(true);
    setError("");

    try {
      const result = await uploadToCloudinary(file, folder);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to upload image.";
      setError(message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  return { upload, busy, error, setError };
}