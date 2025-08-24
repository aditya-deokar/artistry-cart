import { Bounded } from "@/components/common/Bounded";

const CarouselSkeleton = () => (
    <div>
        <div className="h-8 w-1/3 mb-8 rounded-lg bg-neutral-800"></div>
        <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-1/4">
                    <div className="aspect-[4/5] w-full rounded-lg bg-neutral-800"></div>
                    <div className="h-5 w-3/4 mt-4 rounded bg-neutral-800"></div>
                </div>
            ))}
        </div>
    </div>
);

export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Banner Skeleton */}
      <div className="w-full h-[50vh] bg-neutral-800"></div>
      
      <Bounded>
        <div className="space-y-16 py-16">
            <CarouselSkeleton />
            
            <div>
                <div className="h-8 w-1/3 mb-8 rounded-lg bg-neutral-800"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-32 w-full rounded-lg bg-neutral-800"></div>
                    <div className="h-32 w-full rounded-lg bg-neutral-800"></div>
                    <div className="h-32 w-full rounded-lg bg-neutral-800"></div>
                </div>
            </div>

             <CarouselSkeleton />
        </div>
      </Bounded>
    </div>
  );
}