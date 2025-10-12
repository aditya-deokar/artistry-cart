// app/(dashboard)/seller/products/[productId]/pricing/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPricingHistory from '@/components/dashboard/products/ProductPricingHistory';
import PricingAnalytics from '@/components/dashboard/products/PricingAnalytics';
import UpdatePricingForm from '@/components/dashboard/products/UpdatePricingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PricingPageProps {
  params: { productId: string };
}

export async function generateMetadata({ params }: PricingPageProps): Promise<Metadata> {
  return {
    title: `Pricing History - Seller Dashboard`,
    description: 'View pricing history and analytics',
  };
}

export default function PricingPage({ params }: PricingPageProps) {
  const { productId } = params;

  if (!productId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/seller/products/${productId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">
            View pricing history and update current pricing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing History</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <ProductPricingHistory productId={productId} />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <PricingAnalytics productId={productId} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Update Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UpdatePricingForm productId={productId} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
