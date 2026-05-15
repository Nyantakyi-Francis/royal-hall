import Link from "next/link";
import { requireUser } from "@/lib/require-user";

export const dynamic = "force-dynamic";

export default async function StudentHomePage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, level, hall, room_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const assignedRoomId = profile?.room_id ?? null;
  const { data: assignedRoom } = assignedRoomId
    ? await supabase.from("rooms").select("code, blog").eq("id", assignedRoomId).maybeSingle()
    : { data: null as { code: string; blog: string } | null };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Student dashboard</h1>
            <p className="mt-2 text-sm text-black/80">
              {profile?.full_name ?? "Student"} • {(profile?.level ?? "LEVEL_100").replace("_", " ")} •{" "}
              {(profile?.hall ?? "HALL_1").replace("_", " ")}
            </p>
            <p className="mt-2 text-sm text-black/80">Signed in as {user.email}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/student/rooms"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700"
            >
              {assignedRoom ? "View rooms" : "Select room"}
            </Link>
          </div>
        </div>

        {assignedRoom && (
          <div className="mt-5 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 text-sm text-black backdrop-blur">
            Your room is approved: <span className="font-medium">{assignedRoom.code}</span>{" "}
            <span className="text-black/70">({assignedRoom.blog.replaceAll("_", " ")})</span>
          </div>
        )}
      </div>
    </div>
  );
}

