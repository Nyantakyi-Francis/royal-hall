export default function PageLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="glass flex w-full max-w-md items-center gap-3 rounded-3xl p-6">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent"
          aria-hidden="true"
        />
        <div className="text-sm text-black">{label}</div>
      </div>
    </div>
  );
}

