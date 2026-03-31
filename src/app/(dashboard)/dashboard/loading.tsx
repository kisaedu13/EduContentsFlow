import { Header } from "@/components/layout/header";

export default function DashboardLoading() {
  return (
    <>
      <Header title="대시보드" />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <div className="h-8 w-56 rounded bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-8 w-12 rounded bg-muted animate-pulse mt-3" />
            </div>
          ))}
        </div>
        <div>
          <div className="h-5 w-32 rounded bg-muted animate-pulse mb-3" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-l-[3px] p-6 space-y-3">
                <div className="h-5 w-36 rounded bg-muted animate-pulse" />
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
