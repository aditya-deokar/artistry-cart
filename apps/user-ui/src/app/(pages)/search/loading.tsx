import { Loader2 } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-6 w-96 bg-muted rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-9 w-full bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </aside>

        {/* Results Skeleton */}
        <section className="lg:col-span-3">
          {/* Loading Indicator */}
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Searching products...</p>
            <p className="text-sm text-muted-foreground mt-1">This will only take a moment</p>
          </div>

          {/* Alternative: Grid Skeleton (uncomment if preferred) */}
          {/* <div className="space-y-6">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/3] w-full rounded-xl bg-muted animate-pulse" />
                  <div className="h-5 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div> */}
        </section>
      </div>
    </div>
  );
}