import { Header } from "@/components/layout/header";

export default function ProjectsLoading() {
  return (
    <>
      <Header title="프로젝트" />
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          <div className="h-9 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
