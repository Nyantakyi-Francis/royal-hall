"use client";

import { useMemo, useState, useTransition } from "react";

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

const BLOG_LABEL: Record<string, string> = {
  MAIN_BLOG: "Main Blog",
  ANNEX_BLOG: "Annex Blog",
  TRASSACO_BLOG: "Trassaco Blog",
  EAST_LEGON_BLOG: "East Legon Blog",
};

export default function AdminAllocationsClient({
  canDecide,
  requests,
  rooms,
}: {
  canDecide: boolean;
  requests: RequestRow[];
  rooms: Room[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const roomsById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  async function decide(payload: unknown) {
    setError(null);
    setStatus(null);
    setSaving(true);
    const res = await fetch("/api/admin/allocations/decide", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json?.error ?? "Request failed");
      setSaving(false);
      return;
    }
    setStatus("Saved. Refreshing…");
    startTransition(() => window.location.reload());
  }

  return (
    <div className="glass rounded-3xl p-6">
      {!canDecide && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          View only (Hall President required to approve/assign).
        </div>
      )}
      {status && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          {status}
        </div>
      )}
      {saving && !status && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          Saving...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-white px-3 py-2 text-sm text-black">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs text-black/70">
              <th className="border-b border-black/10 pb-2 pr-4">Student</th>
              <th className="border-b border-black/10 pb-2 pr-4">Level</th>
              <th className="border-b border-black/10 pb-2 pr-4">Requested</th>
              <th className="border-b border-black/10 pb-2 pr-4">Capacity</th>
              <th className="border-b border-black/10 pb-2 pr-4">Assign room</th>
              <th className="border-b border-black/10 pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-sm text-black">
                  No pending requests. If you expect requests here, make sure you’re signed in as a Hall President and
                  the student has submitted a room request.
                </td>
              </tr>
            ) : (
              requests.map((r) => {
                const requested = roomsById.get(r.requested_room.id);
                const occupancy = requested
                  ? `${requested.occupied_count}/${requested.capacity}`
                  : `?/ ${r.requested_room.capacity}`;
                const isFull = requested ? requested.occupied_count >= requested.capacity : false;
                return (
                  <tr key={r.id} className="text-sm">
                    <td className="border-b border-black/10 py-3 pr-4">
                      <div className="font-medium">{r.student.full_name}</div>
                      <div className="text-xs text-black">{r.student.user_id}</div>
                    </td>
                    <td className="border-b border-black/10 py-3 pr-4">{r.student.level}</td>
                    <td className="border-b border-black/10 py-3 pr-4">
                      <div className="font-medium">{r.requested_room.code}</div>
                      <div className="text-xs text-black">
                        {BLOG_LABEL[r.requested_room.blog] ?? r.requested_room.blog}
                      </div>
                    </td>
                    <td className="border-b border-black/10 py-3 pr-4">
                      <span className={isFull ? "text-black" : "text-emerald-700"}>{occupancy}</span>
                    </td>
                    <td className="border-b border-black/10 py-3 pr-4">
                      <select
                        className="w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
                        defaultValue={r.requested_room.id}
                        disabled={!canDecide || isPending || saving}
                        onChange={(e) =>
                          decide({
                            requestId: r.id,
                            action: "ASSIGN",
                            roomId: e.target.value,
                          })
                        }
                      >
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.code} ({(BLOG_LABEL[room.blog] ?? room.blog).replaceAll("_", " ")}) —{" "}
                            {room.occupied_count}/{room.capacity}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-black/10 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!canDecide || isPending || saving}
                          onClick={() =>
                            decide({
                              requestId: r.id,
                              action: "APPROVE",
                            })
                          }
                          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Approve requested
                        </button>
                        <button
                          type="button"
                          disabled={!canDecide || isPending || saving}
                          onClick={() =>
                            decide({
                              requestId: r.id,
                              action: "REJECT",
                            })
                          }
                          className="rounded-full border border-black/20 bg-white px-4 py-2 text-xs font-medium hover:bg-emerald-50 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
