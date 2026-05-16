import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { user, role } = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">Admin portal</h1>
        <p className="mt-2 text-sm text-black/80">
          Signed in as {user.email} • {role === "HALL_PRESIDENT" ? "Hall President" : "Hall Master"}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/allocations"
            className="glass-soft rounded-2xl p-5 hover:bg-emerald-50/60"
          >
            <div className="text-sm font-semibold">Room allocations</div>
            <div className="mt-1 text-xs text-black/70">Approve, reject, or assign rooms.</div>
          </Link>
          <Link href="/admin/logistics" className="glass-soft rounded-2xl p-5 hover:bg-emerald-50/60">
            <div className="text-sm font-semibold">Hall logistics</div>
            <div className="mt-1 text-xs text-black/70">Inventory totals and items list.</div>
          </Link>
          <Link href="/admin/roles" className="glass-soft rounded-2xl p-5 hover:bg-emerald-50/60">
            <div className="text-sm font-semibold">Admin roles</div>
            <div className="mt-1 text-xs text-black/70">Promote or demote admins.</div>
          </Link>
          <Link href="/admin/password-reset" className="glass-soft rounded-2xl p-5 hover:bg-emerald-50/60">
            <div className="text-sm font-semibold">Reset passwords</div>
            <div className="mt-1 text-xs text-black/70">Generate a password reset link.</div>
          </Link>
          <Link href="/admin/confirm-user" className="glass-soft rounded-2xl p-5 hover:bg-emerald-50/60">
            <div className="text-sm font-semibold">Confirm user email</div>
            <div className="mt-1 text-xs text-black/70">Manually confirm pending users.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
