import { Header } from "@/components/layout/header";

export default function TemplatesLoading() {
  return (
    <>
      <Header title="워크플로우 템플릿" />
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-4 w-72 rounded bg-muted animate-pulse" />
          <div className="h-9 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <div className="h-5 w-36 rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
