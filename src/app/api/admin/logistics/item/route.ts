import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.string().uuid().optional(),
  item_description: z.string().min(2).optional(),
  quantity: z.number().int().min(0).optional(),
  good_condition: z.number().int().min(0).nullable().optional(),
  poor_condition: z.number().int().min(0).nullable().optional(),
  items_in_store: z.number().int().min(0).nullable().optional(),
  items_in_use: z.number().int().min(0).nullable().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("app_role").eq("user_id", auth.user.id).maybeSingle();
  const role = me?.app_role;
  if (role !== "HALL_MASTER" && role !== "HALL_PRESIDENT") {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const values = parsed.data;
  const payload = {
    ...(values.item_description !== undefined ? { item_description: values.item_description.trim() } : null),
    ...(values.quantity !== undefined ? { quantity: values.quantity } : null),
    ...(values.good_condition !== undefined ? { good_condition: values.good_condition } : null),
    ...(values.poor_condition !== undefined ? { poor_condition: values.poor_condition } : null),
    ...(values.items_in_store !== undefined ? { items_in_store: values.items_in_store } : null),
    ...(values.items_in_use !== undefined ? { items_in_use: values.items_in_use } : null),
  } as Record<string, unknown>;

  if (values.id) {
    const { error } = await supabase.from("logistics_items").update(payload).eq("id", values.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (!values.item_description) {
    return NextResponse.json({ error: "item_description is required" }, { status: 400 });
  }

  const { error } = await supabase.from("logistics_items").insert({
    item_description: values.item_description.trim(),
    quantity: values.quantity ?? 0,
    good_condition: values.good_condition ?? null,
    poor_condition: values.poor_condition ?? null,
    items_in_store: values.items_in_store ?? null,
    items_in_use: values.items_in_use ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

