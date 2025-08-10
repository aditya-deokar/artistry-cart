import { Bounded } from "@/components/common/Bounded";


export default function Loading() {
  return (
    <Bounded className="py-10 md:py-16 mt-6">
      <div className="grid grid-cols-1 items-start gap-12 pb-10 lg:grid-cols-2 lg:gap-20 mb-20">
        
        {/* Gallery Skeleton */}
        <div className="flex flex-col gap-4 animate-pulse">
          {/* Main Image Placeholder */}
          <div className="w-full aspect-square bg-neutral-800 rounded-lg"></div>
          {/* Thumbnails Placeholder */}
          <div className="grid grid-cols-5 gap-3">
            <div className="w-full aspect-square bg-neutral-800 rounded-md"></div>
            <div className="w-full aspect-square bg-neutral-800 rounded-md"></div>
            <div className="w-full aspect-square bg-neutral-800 rounded-md"></div>
            <div className="w-full aspect-square bg-neutral-800 rounded-md"></div>
            <div className="w-full aspect-square bg-neutral-800 rounded-md"></div>
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6 animate-pulse">
          {/* Title Placeholder */}
          <div className="h-10 w-4/5 bg-neutral-800 rounded-md"></div>
          {/* Subcategory Placeholder */}
          <div className="h-5 w-1/3 bg-neutral-800 rounded-md"></div>

          {/* Description Placeholder */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full bg-neutral-800 rounded-md"></div>
            <div className="h-4 w-full bg-neutral-800 rounded-md"></div>
            <div className="h-4 w-3/4 bg-neutral-800 rounded-md"></div>
          </div>

          {/* Specifications Placeholder */}
          <div className="space-y-3 pt-4">
            <div className="h-6 w-full bg-neutral-800 rounded-md"></div>
            <div className="h-6 w-full bg-neutral-800 rounded-md"></div>
          </div>
          
          {/* Price Placeholder */}
          <div className="h-10 w-1/2 bg-neutral-800 rounded-md pt-4"></div>

          {/* Button Placeholder */}
          <div className="h-12 w-full bg-neutral-800 rounded-md"></div>
        </div>
      </div>

      {/* "You May Also Like" Skeleton */}
      <div className="animate-pulse">
        <div className="h-9 w-1/4 bg-neutral-800 rounded-md mb-8"></div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="w-full aspect-square bg-neutral-800 rounded-md"></div>
                    <div className="h-6 w-3/4 bg-neutral-800 rounded-md"></div>
                    <div className="h-4 w-1/2 bg-neutral-800 rounded-md"></div>
                </div>
            ))}
        </div>
      </div>
    </Bounded>
  );
}