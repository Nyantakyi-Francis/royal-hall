import { redirect } from "next/navigation";
import { requireUser } from "@/lib/require-user";

export type AdminRole = "HALL_MASTER" | "HALL_PRESIDENT";

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = profile?.app_role;
  if (role !== "HALL_MASTER" && role !== "HALL_PRESIDENT") redirect("/student");

  return { supabase, user, role: role as AdminRole };
}
