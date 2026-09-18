import { cookies } from "next/headers";
import { getAdminUserFromCookie } from "./admin";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  return getAdminUserFromCookie(cookieStore.get("biozah-admin-session")?.value);
}
