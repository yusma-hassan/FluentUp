/**
 * Next.js loading UI for the /dashboard route.
 * Shown while the Server Component is streaming data from Supabase.
 */
export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14 flex flex-col gap-8">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2">
          <div className="fu-shimmer h-4 w-28 rounded-full" />
          <div className="fu-shimmer h-9 w-48 rounded-[var(--radius-sm)]" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="fu-shimmer rounded-[var(--radius-md)] border-[2.5px] border-[var(--grey-200)] h-28"
            />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="fu-shimmer rounded-[var(--radius-md)] border-[2.5px] border-[var(--grey-200)] h-40" />

        {/* Strengths/weaknesses skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="fu-shimmer rounded-[var(--radius-md)] border-[2.5px] border-[var(--grey-200)] h-48" />
          <div className="fu-shimmer rounded-[var(--radius-md)] border-[2.5px] border-[var(--grey-200)] h-48" />
        </div>

        {/* Recent challenges skeleton */}
        <div className="fu-shimmer rounded-[var(--radius-md)] border-[2.5px] border-[var(--grey-200)] h-64" />
      </div>
    </main>
  );
}
