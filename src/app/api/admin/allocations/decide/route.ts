import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT", "ASSIGN"]),
  roomId: z.string().uuid().optional(),
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

  const { data: reqRow, error: reqErr } = await supabase
    .from("room_requests")
    .select("id, student_user_id, requested_room_id, status")
    .eq("id", parsed.data.requestId)
    .maybeSingle();
  if (reqErr || !reqRow) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (reqRow.status !== "PENDING")
    return NextResponse.json({ error: "Only pending requests can be decided" }, { status: 409 });

  if (parsed.data.action === "REJECT") {
    const { error } = await supabase
      .from("room_requests")
      .update({
        status: "REJECTED",
        decided_at: new Date().toISOString(),
        decided_by: auth.user.id,
      })
      .eq("id", reqRow.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const targetRoomId =
    parsed.data.action === "ASSIGN" ? parsed.data.roomId ?? reqRow.requested_room_id : reqRow.requested_room_id;

  const { data: studentProfile, error: profErr } = await supabase
    .from("profiles")
    .select("user_id, room_id")
    .eq("user_id", reqRow.student_user_id)
    .maybeSingle();
  if (profErr || !studentProfile) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  const { data: room, error: roomErr } = await supabase
    .from("rooms_with_occupancy")
    .select("id, capacity, occupied_count")
    .eq("id", targetRoomId)
    .maybeSingle();
  if (roomErr || !room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const movingRooms = studentProfile.room_id !== targetRoomId;
  if (movingRooms && room.occupied_count >= room.capacity) {
    return NextResponse.json({ error: "Room is full (capacity reached)" }, { status: 400 });
  }

  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({ room_id: targetRoomId })
    .eq("user_id", reqRow.student_user_id);
  if (updateProfileError) return NextResponse.json({ error: updateProfileError.message }, { status: 400 });

  const { error: updateReqError } = await supabase
    .from("room_requests")
    .update({
      status: "APPROVED",
      decided_at: new Date().toISOString(),
      decided_by: auth.user.id,
    })
    .eq("id", reqRow.id);
  if (updateReqError) return NextResponse.json({ error: updateReqError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
