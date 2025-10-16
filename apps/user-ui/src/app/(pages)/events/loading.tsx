import { Bounded } from '@/components/common/Bounded';

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-16">
        <Bounded>
          <div className="text-center space-y-4 animate-pulse">
            <div className="h-12 bg-muted rounded mx-auto w-3/4 max-w-md" />
            <div className="h-6 bg-muted rounded mx-auto w-2/3 max-w-lg" />
          </div>
        </Bounded>
      </div>

      <Bounded className="py-12">
        {/* Filters Skeleton */}
        <div className="space-y-6 mb-12 animate-pulse">
          <div>
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-28 bg-muted rounded-full" />
              ))}
            </div>
          </div>
          <div className="h-10 w-full max-w-md bg-muted rounded" />
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-[16/9] w-full rounded-xl bg-muted" />
              <div className="h-6 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </Bounded>
    </div>
  );
}
