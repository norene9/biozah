import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return <main><section className="admin-login"><p className="eyebrow">Private studio</p><h1>Admin sign in.</h1><p>Manage the biozah catalogue and incoming orders.</p><LoginForm /></section></main>;
}
