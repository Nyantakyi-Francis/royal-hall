export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        {children}
      </div>
    </div>
  );
}
