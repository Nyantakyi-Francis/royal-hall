import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import ConfirmUserClient from "./ui/confirm-user-client";

export const dynamic = "force-dynamic";

export default async function AdminConfirmUserPage() {
  const { role } = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Confirm user email</h1>
            <p className="mt-2 text-sm text-black/80">
              Use this if users are stuck on “Email not confirmed” and you can’t send verification emails.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-emerald-700 hover:underline">
            Back
          </Link>
        </div>
      </div>

      <ConfirmUserClient enabled={role === "HALL_PRESIDENT"} />
    </div>
  );
}

