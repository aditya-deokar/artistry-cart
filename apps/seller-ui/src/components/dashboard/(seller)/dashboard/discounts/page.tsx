// app/(dashboard)/seller/discounts/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import DiscountsHeader from '@/components/dashboard/discounts/DiscountsHeader';
import DiscountsTable from '@/components/dashboard/discounts/DiscountsTable';
import DiscountsFilters from '@/components/dashboard/discounts/DiscountsFilters';
import DiscountsStats from '@/components/dashboard/discounts/DiscountsStats';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Discount Codes - Seller Dashboard',
  description: 'Manage your discount codes and promotional offers',
};

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <DiscountsHeader />
      
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <DiscountsStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <DiscountsFilters />
          </Suspense>
        </Card>

        <div className="lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <DiscountsTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
