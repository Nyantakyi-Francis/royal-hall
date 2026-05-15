import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import RolesClient from "./ui/roles-client";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const { role } = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <Link href="/admin" className="text-sm font-medium text-emerald-800 hover:underline">
          ← Back to admin dashboard
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Admin roles</h1>
        <p className="mt-2 text-sm text-black/80">Hall Presidents can promote/demote admins. Hall Masters can view.</p>
      </div>
      <RolesClient canManage={role === "HALL_PRESIDENT"} />
    </div>
  );
}

