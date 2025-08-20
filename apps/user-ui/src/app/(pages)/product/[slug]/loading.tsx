import { Bounded } from '@/components/common/Bounded';

/**
 * This is the loading skeleton component for the single product page.
 * Next.js automatically wraps the page component with <Suspense>
 * and uses this file as the fallback UI.
 */
export default function Loading() {
  return (
    <Bounded className="py-12 md:py-20 mt-4 animate-pulse">
      {/* Skeleton for the optional Event Countdown */}
      <div className="h-28 w-full rounded-lg bg-accent/80 mb-8"></div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        
        {/* Left Column: Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4 items-start">
            <div className="flex md:flex-col gap-3 order-2 md:order-1">
                <div className="aspect-square w-full rounded-md bg-accent"></div>
                <div className="aspect-square w-full rounded-md bg-accent"></div>
                <div className="aspect-square w-full rounded-md bg-accent"></div>
            </div>
            <div className="relative aspect-square w-full rounded-lg bg-accent order-1 md:order-2"></div>
        </div>
        
        {/* Right Column: Info Skeleton */}
        <div className="flex flex-col gap-7">
            {/* Title & Artist */}
            <div className="space-y-3">
                <div className="h-4 w-1/4 rounded bg-accent"></div>
                <div className="h-10 w-full rounded bg-accent"></div>
                <div className="h-6 w-1/3 rounded bg-accent"></div>
                <div className="h-5 w-28 rounded bg-accent"></div>
            </div>

            {/* Price */}
            <div className="h-10 w-1/2 rounded bg-accent"></div>
            
            {/* Short Description */}
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-accent"></div>
                <div className="h-4 w-full rounded bg-accent"></div>
                <div className="h-4 w-5/6 rounded bg-accent"></div>
            </div>

            {/* Size/Color Selectors */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-16 rounded-full bg-accent"></div>
                <div className="h-10 w-16 rounded-full bg-accent"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-accent"></div>
                <div className="h-8 w-8 rounded-full bg-accent"></div>
                <div className="h-8 w-8 rounded-full bg-accent"></div>
              </div>
            </div>

            {/* Add to Cart Form */}
            <div className="h-14 w-full rounded-full bg-accent"></div>

            {/* Meta Info */}
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="h-5 w-full rounded bg-accent"></div>
              <div className="h-5 w-3/4 rounded bg-accent"></div>
            </div>
        </div>
      </div>

      {/* Tabs Section Skeleton */}
      <div className="mt-20">
        <div className="border-b border-neutral-700 h-12">
            <div className="flex gap-8">
                <div className="w-24 h-6 bg-accent rounded"></div>
                <div className="w-32 h-6 bg-accent rounded"></div>
                <div className="w-28 h-6 bg-accent rounded"></div>
            </div>
        </div>
        <div className="py-8 space-y-3">
            <div className="h-4 w-full rounded bg-accent"></div>
            <div className="h-4 w-full rounded bg-accent"></div>
            <div className="h-4 w-2/3 rounded bg-accent"></div>
        </div>
      </div>
    </Bounded>
  );
}