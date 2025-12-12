
import { Bounded } from "@/components/common/Bounded";

export default function Loading() {
  return (
    <Bounded>
      <div className="py-12 md:py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* --- Sidebar Skeleton --- */}
          <aside className="lg:col-span-1">
            <div className="p-6 bg-card border border-border rounded-lg h-fit">
              <div className="flex items-center gap-4 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-muted"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-3/4 rounded bg-muted"></div>
                  <div className="h-3 w-1/2 rounded bg-muted/50"></div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 w-full rounded-md bg-muted/50"></div>
                ))}
              </div>
            </div>
          </aside>

          {/* --- Content Area Skeleton --- */}
          <main className="lg:col-span-3 space-y-8">
            <div className="space-y-3">
              <div className="h-10 w-1/3 rounded-lg bg-muted"></div>
              <div className="h-5 w-2/3 rounded-lg bg-muted/60"></div>
            </div>

            {/* Simulated Card for Avatar Section */}
            <div className="flex items-center gap-6 p-6 border border-border rounded-xl bg-card/30">
              <div className="w-24 h-24 rounded-full bg-muted"></div>
              <div className="space-y-3 flex-1">
                <div className="h-5 w-40 rounded bg-muted"></div>
                <div className="h-4 w-64 rounded bg-muted/60"></div>
                <div className="h-10 w-32 rounded-lg bg-muted mt-2"></div>
              </div>
            </div>

            {/* Simulated Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted/70 rounded"></div>
                  <div className="h-12 w-full bg-muted/40 rounded-xl border border-border/50"></div>
                </div>
              ))}
            </div>
          </main>

        </div>
      </div>
    </Bounded>
  );
}