import { createHash } from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export function isCloudinaryConfigured() { return Boolean(cloudName && apiKey && apiSecret); }

export function cloudinarySignature(parameters: Record<string, string | number>) {
  if (!apiSecret) throw new Error("Cloudinary is not configured.");
  const value = Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${key}=${item}`).join("&");
  return createHash("sha1").update(`${value}${apiSecret}`).digest("hex");
}

export function optimizedCloudinaryUrl(publicId: string) {
  if (!cloudName) return "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1200,c_limit/${publicId}`;
}

export async function destroyCloudinaryImage(publicId: string) {
  if (!apiSecret || !cloudName || !apiKey) throw new Error("Cloudinary is not configured.");
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: apiKey, signature: cloudinarySignature({ public_id: publicId, timestamp }) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("Unable to delete the Cloudinary image.");
}

export { cloudName, apiKey };
