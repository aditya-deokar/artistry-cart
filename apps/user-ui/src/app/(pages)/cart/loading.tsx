import { Bounded } from "@/components/common/Bounded";


const CartItemSkeleton = () => (
    <div className="flex items-start gap-4 p-4 border-b border-border">
        {/* Image Placeholder */}
        <div className="w-24 h-24 flex-shrink-0 rounded-md bg-muted"></div>
        
        {/* Details Placeholder */}
        <div className="flex-grow flex flex-col justify-between h-24">
            <div>
                <div className="h-5 w-3/4 bg-muted rounded-md"></div>
                <div className="h-4 w-1/2 bg-muted rounded-md mt-2"></div>
            </div>
            <div className="h-6 w-20 bg-muted rounded-md"></div>
        </div>

        {/* Price & Quantity Placeholder */}
        <div className="flex flex-col items-end justify-between h-24">
            <div className="h-6 w-24 bg-muted rounded-md"></div>
            <div className="h-8 w-28 bg-muted rounded-md"></div>
        </div>
    </div>
);


export default function Loading() {
  return (
    <Bounded className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto animate-pulse">
        {/* --- Header Skeleton --- */}
        <div className="text-center mb-12">
            <div className="h-10 md:h-12 w-1/2 mx-auto bg-muted rounded-lg"></div>
            <div className="h-5 w-3/4 md:w-1/2 mx-auto bg-muted rounded-lg mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* --- Cart Items List Skeleton --- */}
            <div className="lg:col-span-2 bg-card border border-border rounded-lg">
                <CartItemSkeleton />
                <CartItemSkeleton />
                <CartItemSkeleton />
            </div>

            {/* --- Order Summary Skeleton --- */}
            <div className="lg:col-span-1 rounded-lg border border-border bg-card p-6 lg:p-8 space-y-6">
                <div className="h-8 w-3/4 bg-muted rounded-md"></div>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <div className="h-5 w-20 bg-muted rounded-md"></div>
                        <div className="h-5 w-24 bg-muted rounded-md"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-5 w-24 bg-muted rounded-md"></div>
                        <div className="h-5 w-32 bg-muted rounded-md"></div>
                    </div>
                </div>
                <div className="w-full h-px bg-border"></div>
                <div className="flex justify-between">
                    <div className="h-6 w-16 bg-muted rounded-md"></div>
                    <div className="h-6 w-28 bg-muted rounded-md"></div>
                </div>
                <div className="h-12 w-full bg-muted rounded-lg"></div>
            </div>
        </div>
      </div>
    </Bounded>
  );
}