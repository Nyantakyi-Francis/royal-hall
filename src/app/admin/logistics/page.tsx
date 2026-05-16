import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function LogisticsPage() {
  const { supabase } = await requireAdmin();

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id ?? null;

  const [{ data: myProfile }, { data: myAdminRole }, isMasterRes, isPresidentRes] = await Promise.all([
    userId
      ? supabase.from("profiles").select("user_id, app_role").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? supabase.from("admin_roles").select("role").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    // RLS may return empty rows with no error; explicitly check the helper function.
    supabase.rpc("is_admin", { role_to_check: "HALL_MASTER" }),
    supabase.rpc("is_admin", { role_to_check: "HALL_PRESIDENT" }),
  ]);

  const [memberRes, itemsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("logistics_items")
      .select("id, item_description, quantity, good_condition, poor_condition, items_in_store, items_in_use")
      .order("item_description", { ascending: true }),
  ]);

  const memberCount = memberRes.count ?? 0;
  const items = itemsRes.data ?? null;
  const errorMessage = memberRes.error?.message ?? itemsRes.error?.message ?? null;

  const isMaster = Boolean(isMasterRes.data);
  const isPresident = Boolean(isPresidentRes.data);

  const itemsInStore = (items ?? []).reduce((sum, i) => sum + (i.items_in_store ?? 0), 0);
  const itemsInUse = (items ?? []).reduce((sum, i) => sum + (i.items_in_use ?? 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <Link href="/admin" className="text-sm font-medium text-emerald-800 hover:underline">
          ← Back to admin dashboard
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Hall logistics</h1>
        <p className="mt-2 text-sm text-black/80">Totals and inventory (Hall Masters + Hall Presidents).</p>
      </div>

      {errorMessage && (
        <div className="glass rounded-3xl border border-emerald-900/10 bg-white/70 p-4 text-sm text-black backdrop-blur">
          Unable to load logistics: <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="glass rounded-3xl p-6">
        <div className="mb-2 text-sm font-medium">Diagnostics</div>
        <div className="text-xs text-black/80">
          <div>
            User: <span className="font-mono">{userId ?? "unknown"}</span>
          </div>
          <div>
            `profiles.app_role`: <span className="font-mono">{(myProfile as any)?.app_role ?? "unknown"}</span>
          </div>
          <div>
            `admin_roles.role`: <span className="font-mono">{(myAdminRole as any)?.role ?? "none"}</span>
          </div>
          <div>
            `is_admin(HALL_MASTER)`: <span className="font-mono">{String(isMaster)}</span>
          </div>
          <div>
            `is_admin(HALL_PRESIDENT)`: <span className="font-mono">{String(isPresident)}</span>
          </div>
        </div>
        {!isMaster && !isPresident && (
          <div className="mt-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 px-3 py-2 text-sm text-black backdrop-blur">
            RLS doesnâ€™t think youâ€™re an admin, so `logistics_items` will appear empty. Make sure your DB has the
            latest migrations (especially the `is_admin()` update) and that your user has `profiles.app_role =
            HALL_MASTER` or `HALL_PRESIDENT`.
          </div>
        )}
      </div>

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
        <div className="mb-4 text-sm font-medium">Inventory</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-black/70">
                <th className="border-b border-black/10 pb-2 pr-4">Item</th>
                <th className="border-b border-black/10 pb-2 pr-4">Quantity</th>
                <th className="border-b border-black/10 pb-2 pr-4">Good</th>
                <th className="border-b border-black/10 pb-2 pr-4">Poor</th>
                <th className="border-b border-black/10 pb-2 pr-4">In store</th>
                <th className="border-b border-black/10 pb-2">In use</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((i) => (
                <tr key={i.id} className="text-sm">
                  <td className="border-b border-black/10 py-3 pr-4 font-medium">{i.item_description}</td>
                  <td className="border-b border-black/10 py-3 pr-4">{i.quantity}</td>
                  <td className="border-b border-black/10 py-3 pr-4">{i.good_condition ?? "—"}</td>
                  <td className="border-b border-black/10 py-3 pr-4">{i.poor_condition ?? "—"}</td>
                  <td className="border-b border-black/10 py-3 pr-4">{i.items_in_store ?? "—"}</td>
                  <td className="border-b border-black/10 py-3">{i.items_in_use ?? "—"}</td>
                </tr>
              ))}
              {(!items || items.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-6 text-sm text-black/80">
                    No items yet. If you already added items in the database, make sure you are signed in as a Hall
                    Master/President and your RLS admin role is active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
