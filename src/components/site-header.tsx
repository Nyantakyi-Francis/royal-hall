import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

type AppRole = "STUDENT" | "HALL_MASTER" | "HALL_PRESIDENT";

function roleLabel(role: AppRole) {
  if (role === "HALL_PRESIDENT") return "Hall President";
  if (role === "HALL_MASTER") return "Hall Master";
  return "Student";
}

export default async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;

  let appRole: AppRole = "STUDENT";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("app_role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.app_role === "HALL_MASTER" || profile?.app_role === "HALL_PRESIDENT") appRole = profile.app_role;
  }

  const isAdmin = appRole === "HALL_MASTER" || appRole === "HALL_PRESIDENT";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-emerald-700">Royal Hall</span>
          <span className="text-sm text-black/90">Hall 1</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <Link
                href="/student"
                className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60"
              >
                Student
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60"
                >
                  Admin
                </Link>
              )}
              <span className="hidden rounded-full border border-emerald-900/10 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-900 backdrop-blur md:inline">
                {roleLabel(appRole)}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60"
              >
                Log in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

