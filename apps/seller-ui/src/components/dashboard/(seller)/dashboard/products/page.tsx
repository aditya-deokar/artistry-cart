// app/(dashboard)/seller/products/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductsHeader from '@/components/dashboard/products/ProductsHeader';
import ProductsTable from '@/components/dashboard/products/ProductsTable';
import ProductsFilters from '@/components/dashboard/products/ProductsFilters';
import ProductsStats from '@/components/dashboard/products/ProductsStats';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Products - Seller Dashboard',
  description: 'Manage your products, inventory, and pricing',
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductsHeader />
      
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <ProductsStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductsFilters />
          </Suspense>
        </Card>

        <div className="lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductsTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
