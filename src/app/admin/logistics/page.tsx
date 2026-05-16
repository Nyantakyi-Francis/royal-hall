import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import LogisticsClient from "./ui/logistics-client";

export const dynamic = "force-dynamic";

export default async function LogisticsPage() {
  const { supabase, role } = await requireAdmin();

  const [memberRes, itemsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("logistics_items")
      .select("id, item_description, quantity, good_condition, poor_condition, items_in_store, items_in_use")
      .order("item_description", { ascending: true }),
  ]);

  const memberCount = memberRes.count ?? 0;
  const items = itemsRes.data ?? [];
  const errorMessage = memberRes.error?.message ?? itemsRes.error?.message ?? null;

  const itemsInStore = items.reduce((sum, i) => sum + (i.items_in_store ?? 0), 0);
  const itemsInUse = items.reduce((sum, i) => sum + (i.items_in_use ?? 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <Link href="/admin" className="text-sm font-medium text-emerald-800 hover:underline">
          â† Back to admin dashboard
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Hall logistics</h1>
        <p className="mt-2 text-sm text-black/80">Totals and inventory (Hall Masters + Hall Presidents).</p>
      </div>

      {errorMessage && (
        <div className="glass rounded-3xl border border-emerald-900/10 bg-white/70 p-4 text-sm text-black backdrop-blur">
          Unable to load logistics: <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-soft rounded-3xl p-6">
          <div className="text-xs text-black/70">Total hall members</div>
          <div className="mt-2 text-2xl font-semibold">{memberCount}</div>
        </div>
        <div className="glass-soft rounded-3xl p-6">
          <div className="text-xs text-black/70">Items in store</div>
          <div className="mt-2 text-2xl font-semibold">{itemsInStore}</div>
        </div>
        <div className="glass-soft rounded-3xl p-6">
          <div className="text-xs text-black/70">Items in use</div>
          <div className="mt-2 text-2xl font-semibold">{itemsInUse}</div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-sm font-medium">Inventory</div>
          <div className="text-xs text-black/70">
            {role === "HALL_PRESIDENT" ? "Hall President" : "Hall Master"} â€¢ Update items below
          </div>
        </div>
        <LogisticsClient canEdit={true} items={items as any} />
      </div>
    </div>
  );
}

