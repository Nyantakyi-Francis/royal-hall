"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RoomRow = {
  id: string;
  code: string;
  blog: string;
  capacity: number;
  occupied_count: number;
};

type AssignedRoom = { code: string; blog: string } | null;
type PendingRequest = { code: string; blog: string } | null;

const BLOG_LABEL: Record<string, string> = {
  MAIN_BLOG: "Main Blog",
  ANNEX_BLOG: "Annex Blog",
  TRASSACO_BLOG: "Trassaco Blog",
  EAST_LEGON_BLOG: "East Legon Blog",
};

function friendlyRequestError(insertError: { code?: string | null; message: string }) {
  const message = insertError.message ?? "Request failed";
  if (insertError.code === "23505" || message.includes("room_requests_one_pending_per_student")) {
    return "Already have a room request pending.";
  }
  return message;
}

export default function RoomSelectionClient({
  rooms,
  assignedRoom,
  pendingRequest,
}: {
  rooms: RoomRow[];
  assignedRoom: AssignedRoom;
  pendingRequest: PendingRequest;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blog, setBlog] = useState<string>(rooms[0]?.blog ?? "MAIN_BLOG");

  async function requestRoom(roomId: string) {
    setError(null);
    setStatus(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setError("Please log in again.");
      return;
    }

    const { error: insertError } = await supabase.from("room_requests").insert({
      student_user_id: data.user.id,
      requested_room_id: roomId,
      status: "PENDING",
    });

    if (insertError) {
      setError(friendlyRequestError(insertError));
      return;
    }
    setStatus("Request submitted. Waiting for admin feedback.");
  }

  const blogs = Array.from(new Set(rooms.map((r) => r.blog)));
  const filtered = rooms.filter((r) => r.blog === blog);

  return (
    <div className="glass rounded-3xl p-6">
      {assignedRoom && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          Already have a room: <span className="font-medium">{assignedRoom.code}</span>{" "}
          <span className="text-black/70">({BLOG_LABEL[assignedRoom.blog] ?? assignedRoom.blog})</span>
        </div>
      )}
      {!assignedRoom && pendingRequest && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          Request pending: <span className="font-medium">{pendingRequest.code}</span>{" "}
          <span className="text-black/70">({BLOG_LABEL[pendingRequest.blog] ?? pendingRequest.blog})</span>
        </div>
      )}
      {status && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          {status}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-white px-3 py-2 text-sm text-black">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {blogs.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBlog(b)}
            className={
              b === blog
                ? "rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-900/10"
                : "rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60"
            }
          >
            {BLOG_LABEL[b] ?? b}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const full = r.occupied_count >= r.capacity;
          const disabled = !!assignedRoom || !!pendingRequest;
          return (
            <button
              key={r.id}
              onClick={() => requestRoom(r.id)}
              className="glass-soft rounded-2xl p-4 text-left hover:bg-emerald-50/60 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              <div className="text-sm font-semibold">{r.code}</div>
              <div className="mt-1 text-xs text-black/80">{BLOG_LABEL[r.blog] ?? r.blog}</div>
              <div className="mt-3 text-xs text-black/80">
                {r.occupied_count}/{r.capacity}{" "}
                <span className={full ? "text-black" : "text-emerald-700"}>
                  {full ? "Full" : "Vacant"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
