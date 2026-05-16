import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import RoomSelectionClient from "./ui/room-selection-client";

export const dynamic = "force-dynamic";

export default async function StudentRoomsPage() {
  const { supabase, user } = await requireUser();

  let { data: profile } = await supabase.from("profiles").select("room_id").eq("user_id", user.id).maybeSingle();

  if (!profile) {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName = (meta.full_name ?? meta.fullName) as string | undefined;
    const level = meta.level as "LEVEL_100" | "LEVEL_200" | "LEVEL_300" | undefined;
    const hall = (meta.hall as string | undefined) ?? "HALL_1";
    if (fullName && level) {
      await supabase.from("profiles").insert({ user_id: user.id, full_name: fullName, level, hall });
      const res = await supabase.from("profiles").select("room_id").eq("user_id", user.id).maybeSingle();
      profile = res.data ?? null;
    }
  }

  const [{ data: pending }, { data: rooms }] = await Promise.all([
    supabase
      .from("room_requests")
      .select("requested_room:rooms(code, blog)")
      .eq("student_user_id", user.id)
      .eq("status", "PENDING")
      .maybeSingle(),
    supabase
      .from("rooms_with_occupancy")
      .select("id, code, blog, capacity, occupied_count")
      .order("blog", { ascending: true })
      .order("code", { ascending: true }),
  ]);

  const assignedRoomId = profile?.room_id ?? null;
  const { data: assignedRoom } = assignedRoomId
    ? await supabase.from("rooms").select("code, blog").eq("id", assignedRoomId).maybeSingle()
    : { data: null as { code: string; blog: string } | null };

  const requestedRoomUnknown = pending?.requested_room as unknown;
  const pendingRequest = Array.isArray(requestedRoomUnknown)
    ? ((requestedRoomUnknown[0] as { code: string; blog: string } | undefined) ?? null)
    : ((requestedRoomUnknown as { code: string; blog: string } | null) ?? null);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <Link href="/student" className="text-sm font-medium text-emerald-800 hover:underline">
          ← Back to student dashboard
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Select a room</h1>
        <p className="mt-2 text-sm text-black/80">Your selection goes to admin for feedback.</p>
      </div>

      <RoomSelectionClient rooms={rooms ?? []} assignedRoom={assignedRoom ?? null} pendingRequest={pendingRequest} />
    </div>
  );
}
