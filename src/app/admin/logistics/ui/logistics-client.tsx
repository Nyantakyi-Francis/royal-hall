"use client";

import { useMemo, useState } from "react";

type ItemRow = {
  id: string;
  item_description: string;
  quantity: number;
  good_condition: number | null;
  poor_condition: number | null;
  items_in_store: number | null;
  items_in_use: number | null;
};

function toInt(value: string) {
  const v = value.trim();
  if (!v) return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function toNullableInt(value: string) {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export default function LogisticsClient({
  canEdit,
  items: initialItems,
}: {
  canEdit: boolean;
  items: ItemRow[];
}) {
  const [items, setItems] = useState<ItemRow[]>(initialItems);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    item_description: "",
    quantity: "0",
    good_condition: "",
    poor_condition: "",
    items_in_store: "",
    items_in_use: "",
  });

  const totals = useMemo(() => {
    const itemsInStore = items.reduce((sum, i) => sum + (i.items_in_store ?? 0), 0);
    const itemsInUse = items.reduce((sum, i) => sum + (i.items_in_use ?? 0), 0);
    return { itemsInStore, itemsInUse };
  }, [items]);

  async function save(item: ItemRow) {
    setError(null);
    setStatus(null);
    setSavingId(item.id);
    try {
      const res = await fetch("/api/admin/logistics/item", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Request failed");
      setStatus("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  async function create() {
    setError(null);
    setStatus(null);
    const description = newItem.item_description.trim();
    if (!description) {
      setError("Enter an item description.");
      return;
    }
    setSavingId("NEW");
    try {
      const res = await fetch("/api/admin/logistics/item", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          item_description: description,
          quantity: toInt(newItem.quantity),
          good_condition: toNullableInt(newItem.good_condition),
          poor_condition: toNullableInt(newItem.poor_condition),
          items_in_store: toNullableInt(newItem.items_in_store),
          items_in_use: toNullableInt(newItem.items_in_use),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Request failed");
      setStatus("Created. Refreshing...");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
      setSavingId(null);
    }
  }

  return (
    <div className="glass rounded-3xl p-6">
      {!canEdit && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          View only (Hall Master/President required to edit).
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

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-900/10 bg-white/60 px-4 py-3 text-sm backdrop-blur">
          <div className="text-xs text-black/70">Items in store</div>
          <div className="mt-1 text-lg font-semibold">{totals.itemsInStore}</div>
        </div>
        <div className="rounded-2xl border border-emerald-900/10 bg-white/60 px-4 py-3 text-sm backdrop-blur">
          <div className="text-xs text-black/70">Items in use</div>
          <div className="mt-1 text-lg font-semibold">{totals.itemsInUse}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs text-black/70">
              <th className="border-b border-black/10 pb-2 pr-4">Item</th>
              <th className="border-b border-black/10 pb-2 pr-4">Quantity</th>
              <th className="border-b border-black/10 pb-2 pr-4">Good</th>
              <th className="border-b border-black/10 pb-2 pr-4">Poor</th>
              <th className="border-b border-black/10 pb-2 pr-4">In store</th>
              <th className="border-b border-black/10 pb-2 pr-4">In use</th>
              <th className="border-b border-black/10 pb-2">Save</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const disabled = !canEdit || savingId === i.id;
              return (
                <tr key={i.id} className="text-sm">
                  <td className="border-b border-black/10 py-3 pr-4 font-medium">{i.item_description}</td>
                  <td className="border-b border-black/10 py-3 pr-4">
                    <input
                      className="w-28 rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      value={String(i.quantity)}
                      inputMode="numeric"
                      disabled={disabled}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) => (row.id === i.id ? { ...row, quantity: toInt(e.target.value) } : row)),
                        )
                      }
                    />
                  </td>
                  <td className="border-b border-black/10 py-3 pr-4">
                    <input
                      className="w-28 rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      value={i.good_condition ?? ""}
                      inputMode="numeric"
                      disabled={disabled}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === i.id ? { ...row, good_condition: toNullableInt(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="border-b border-black/10 py-3 pr-4">
                    <input
                      className="w-28 rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      value={i.poor_condition ?? ""}
                      inputMode="numeric"
                      disabled={disabled}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === i.id ? { ...row, poor_condition: toNullableInt(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="border-b border-black/10 py-3 pr-4">
                    <input
                      className="w-28 rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      value={i.items_in_store ?? ""}
                      inputMode="numeric"
                      disabled={disabled}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === i.id ? { ...row, items_in_store: toNullableInt(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="border-b border-black/10 py-3 pr-4">
                    <input
                      className="w-28 rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      value={i.items_in_use ?? ""}
                      inputMode="numeric"
                      disabled={disabled}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === i.id ? { ...row, items_in_use: toNullableInt(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="border-b border-black/10 py-3">
                    <button
                      type="button"
                      disabled={!canEdit || savingId === i.id}
                      onClick={() => save(i)}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {savingId === i.id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-sm text-black/80">
                  No items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
        <div className="mb-3 text-sm font-medium">Add item</div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-3">
            <span className="text-xs text-black/70">Item description</span>
            <input
              value={newItem.item_description}
              onChange={(e) => setNewItem((p) => ({ ...p, item_description: e.target.value }))}
              disabled={!canEdit || savingId === "NEW"}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              placeholder="e.g. Mattresses"
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/70">Quantity</span>
            <input
              value={newItem.quantity}
              onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
              disabled={!canEdit || savingId === "NEW"}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/70">In store</span>
            <input
              value={newItem.items_in_store}
              onChange={(e) => setNewItem((p) => ({ ...p, items_in_store: e.target.value }))}
              disabled={!canEdit || savingId === "NEW"}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/70">In use</span>
            <input
              value={newItem.items_in_use}
              onChange={(e) => setNewItem((p) => ({ ...p, items_in_use: e.target.value }))}
              disabled={!canEdit || savingId === "NEW"}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/70">Good</span>
            <input
              value={newItem.good_condition}
              onChange={(e) => setNewItem((p) => ({ ...p, good_condition: e.target.value }))}
              disabled={!canEdit || savingId === "NEW"}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/70">Poor</span>
            <input
              value={newItem.poor_condition}
              onChange={(e) => setNewItem((p) => ({ ...p, poor_condition: e.target.value }))}
              disabled={!canEdit || savingId === "NEW"}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={create}
          disabled={!canEdit || savingId === "NEW"}
          className="mt-4 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {savingId === "NEW" ? "Creating..." : "Add item"}
        </button>
      </div>
    </div>
  );
}

