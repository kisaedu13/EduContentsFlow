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
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, col) => (
            <div
              key={col}
              className="flex flex-col rounded-xl border border-border bg-secondary/50 dark:bg-card/50 min-h-[400px]"
            >
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
                <div className="size-2.5 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                <div className="size-6 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="flex flex-col gap-3 p-3">
                {Array.from({ length: col === 0 ? 2 : col === 1 ? 3 : 1 }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-card p-4 shadow-[var(--shadow-card)] border-l-[3px] border-l-muted space-y-2.5"
                    >
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-full rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
