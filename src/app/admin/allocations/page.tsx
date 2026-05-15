import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import AdminAllocationsClient from "./ui/admin-allocations-client";

export const dynamic = "force-dynamic";

type Room = {
  id: string;
  code: string;
  blog: string;
  capacity: number;
  occupied_count: number;
};

type RequestRow = {
  id: string;
  created_at: string;
  status: string;
  admin_feedback: string | null;
  student: { user_id: string; full_name: string; level: string; room_id: string | null };
  requested_room: { id: string; code: string; blog: string; capacity: number };
};

export default async function AllocationsPage() {
  const { supabase, role } = await requireAdmin();

  const { data: requests } = await supabase
    .from("room_requests")
    .select(
      `
      id,
      created_at,
      status,
      admin_feedback,
      student:profiles!room_requests_student_user_id_fkey(user_id, full_name, level, room_id),
      requested_room:rooms!room_requests_requested_room_id_fkey(id, code, blog, capacity)
    `,
    )
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  const { data: rooms } = await supabase
    .from("rooms_with_occupancy")
    .select("id, code, blog, capacity, occupied_count")
    .order("blog", { ascending: true })
    .order("code", { ascending: true });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <Link href="/admin" className="text-sm font-medium text-emerald-800 hover:underline">
          ← Back to admin dashboard
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Room allocations</h1>
        <p className="mt-2 text-sm text-black/80">
          Hall Presidents can approve/reject and assign rooms. Hall Masters can view.
        </p>
      </div>

      <AdminAllocationsClient
        canDecide={role === "HALL_PRESIDENT"}
        requests={(requests ?? []) as unknown as RequestRow[]}
        rooms={(rooms ?? []) as unknown as Room[]}
      />
    </div>
  );
}

