import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  action: z.enum(["SET", "REMOVE"]),
  email: z.string().email(),
  role: z.enum(["HALL_MASTER", "HALL_PRESIDENT"]).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("app_role").eq("user_id", auth.user.id).maybeSingle();
  if (me?.app_role !== "HALL_PRESIDENT")
    return NextResponse.json({ error: "Hall President required" }, { status: 403 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", parsed.data.email)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "User not found (no profile for this email)" }, { status: 404 });

  if (parsed.data.action === "REMOVE") {
    const { error } = await supabase.from("profiles").update({ app_role: "STUDENT" }).eq("user_id", profile.user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const role = parsed.data.role ?? "HALL_MASTER";
  const { error } = await supabase.from("profiles").update({ app_role: role }).eq("user_id", profile.user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
