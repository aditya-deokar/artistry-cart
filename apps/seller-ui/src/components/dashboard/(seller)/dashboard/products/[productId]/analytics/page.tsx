// app/(dashboard)/seller/products/[productId]/analytics/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductAnalytics from '@/components/dashboard/products/ProductAnalytics';
import ProductPerformanceCharts from '@/components/dashboard/products/ProductPerformanceCharts';
import ProductInsights from '@/components/dashboard/products/ProductInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsPageProps {
  params: { productId: string };
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  return {
    title: `Product Analytics - Seller Dashboard`,
    description: 'View detailed product performance analytics',
  };
}

export default function ProductAnalyticsPage({ params }: AnalyticsPageProps) {
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
          <h1 className="text-3xl font-bold">Product Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your product performance
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <ProductAnalytics productId={productId} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <ProductPerformanceCharts productId={productId} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <ProductInsights productId={productId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
