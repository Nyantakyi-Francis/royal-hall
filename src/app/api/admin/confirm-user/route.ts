import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/env";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const env = getEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY env var (required for admin user updates)" },
      { status: 500 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("app_role").eq("user_id", auth.user.id).maybeSingle();
  if (me?.app_role !== "HALL_PRESIDENT")
    return NextResponse.json({ error: "Hall President required" }, { status: 403 });

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = parsed.data.email.toLowerCase();
  let page = 1;
  const perPage = 200;
  let userId: string | null = null;
  let alreadyConfirmed = false;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const match = (data.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);
    if (match) {
      userId = match.id;
      alreadyConfirmed = Boolean((match as any).email_confirmed_at);
      break;
    }

    if (!data.users || data.users.length < perPage) break;
    page += 1;
  }

  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (alreadyConfirmed) return NextResponse.json({ ok: true, userId, alreadyConfirmed: true });

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true, userId, alreadyConfirmed: false });
}

