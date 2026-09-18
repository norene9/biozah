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

export { cloudName, apiKey };
