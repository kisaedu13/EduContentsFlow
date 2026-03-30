import { Header } from "@/components/layout/header";

export default function ProjectDetailLoading() {
  return (
    <>
      <Header title="" />
      <main className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2 border-b pb-2">
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          </div>
          <div className="rounded-lg border">
            <div className="border-b bg-muted/50 p-3">
              <div className="flex gap-4">
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3 border-b last:border-0">
                <div className="h-5 w-48 rounded bg-muted animate-pulse" />
                <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                <div className="h-5 w-20 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
