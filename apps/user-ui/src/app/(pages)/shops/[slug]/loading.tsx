import { Bounded } from "@/components/common/Bounded";

export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <header className="relative h-[40vh] min-h-[300px] bg-neutral-900">
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-neutral-800 flex-shrink-0"></div>
            <div className="space-y-3">
              <div className="h-10 w-64 rounded-lg bg-neutral-800"></div>
              <div className="h-6 w-40 rounded-lg bg-neutral-800"></div>
            </div>
          </div>
        </div>
      </header>

      <Bounded>
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="h-6 w-1/2 rounded bg-neutral-800"></div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-neutral-800"></div>
              <div className="h-4 w-full rounded bg-neutral-800"></div>
              <div className="h-4 w-3/4 rounded bg-neutral-800"></div>
            </div>
          </aside>

          {/* Content Skeleton */}
          <section className="lg:col-span-3">
            <div className="h-8 w-1/3 mb-6 rounded bg-neutral-800"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-square w-full rounded-lg bg-neutral-800"></div>
                  <div className="h-5 w-3/4 mt-4 rounded bg-neutral-800"></div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </Bounded>
    </div>
  );
}