// app/(dashboard)/seller/products/[productId]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailsView from '@/components/dashboard/products/ProductDetailsView';
import ProductActionButtons from '@/components/dashboard/products/ProductActionButtons';
import ProductQuickStats from '@/components/dashboard/products/ProductQuickStats';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductPageProps {
  params: { productId: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  return {
    title: `Product Details - Seller Dashboard`,
    description: 'View and manage product details',
  };
}

export default function ProductDetailsPage({ params }: ProductPageProps) {
  const { productId } = params;

  if (!productId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Details</h1>
            <p className="text-muted-foreground">
              View and manage your product information
            </p>
          </div>
        </div>
        <ProductActionButtons productId={productId} />
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <ProductQuickStats productId={productId} />
      </Suspense>

      <Card>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ProductDetailsView productId={productId} />
        </Suspense>
      </Card>
    </div>
  );
}
