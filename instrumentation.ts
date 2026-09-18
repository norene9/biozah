import { ensureDefaultAdmin } from "@/lib/firebase/admin";

export async function register() {
  try {
    const result = await ensureDefaultAdmin();
    if (result.status !== "skipped") console.info(`[firebase] default admin: ${result.status}`);
  } catch (error) {
    console.error("[firebase] unable to ensure default admin", error);
  }
}