import { compressImage } from "./compress-image"; // Your canvas compression helper

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function uploadToCloudinary(
  file: File,
  folder: string = "biozah/products"
): Promise<UploadedImage> {
  // 1. Compress raw image on the client side
  const fileToUpload = await compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
  });

  // 2. Fetch signature from API endpoint
  const signatureResponse = await fetch("/api/admin/cloudinary/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  const signatureData = await signatureResponse.json();

  if (!signatureResponse.ok) {
    throw new Error(signatureData.error || "Failed to generate upload signature.");
  }

  // 3. Build multipart form data with the compressed file
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("api_key", signatureData.apiKey);
  formData.append("timestamp", String(signatureData.timestamp));
  formData.append("folder", signatureData.folder);
  formData.append("signature", signatureData.signature);

  if (signatureData.transformation) {
    formData.append("transformation", signatureData.transformation);
  }

  // 4. Upload to Cloudinary
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const uploadResult = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(uploadResult.error?.message || "Cloudinary upload failed.");
  }

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };
}