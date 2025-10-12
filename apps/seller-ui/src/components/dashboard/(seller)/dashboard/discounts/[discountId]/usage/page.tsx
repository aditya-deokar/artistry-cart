// app/(dashboard)/seller/discounts/[discountId]/usage/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscountUsagePageProps {
  params: { discountId: string };
}

export async function generateMetadata({ params }: DiscountUsagePageProps): Promise<Metadata> {
  return {
    title: `Usage Statistics - Seller Dashboard`,
    description: 'View detailed usage statistics for this discount code',
  };
}

export default function DiscountUsagePage({ params }: DiscountUsagePageProps) {
  const { discountId } = params;

  if (!discountId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/seller/discounts/${discountId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discount
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Usage Statistics
          </h1>
          <p className="text-muted-foreground">
            Detailed analytics for your discount code performance
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <DiscountUsageAnalytics discountId={discountId} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DiscountUsageCharts discountId={discountId} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <DiscountUsageTable discountId={discountId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
