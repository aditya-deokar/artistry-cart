// app/(dashboard)/seller/discounts/[discountId]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DiscountDetailsView from '@/components/dashboard/discounts/DiscountDetailsView';
import DiscountActionButtons from '@/components/dashboard/discounts/DiscountActionButtons';
import DiscountQuickStats from '@/components/dashboard/discounts/DiscountQuickStats';
import DiscountUsageChart from '@/components/dashboard/discounts/DiscountUsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DiscountPageProps {
  params: { discountId: string };
}

export async function generateMetadata({ params }: DiscountPageProps): Promise<Metadata> {
  return {
    title: `Discount Details - Seller Dashboard`,
    description: 'View and manage discount code details',
  };
}

export default function DiscountDetailsPage({ params }: DiscountPageProps) {
  const { discountId } = params;

  if (!discountId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/discounts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discounts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ticket className="h-8 w-8" />
              Discount Details
            </h1>
            <p className="text-muted-foreground">
              Manage your discount code and view usage statistics
            </p>
          </div>
        </div>
        <DiscountActionButtons discountId={discountId} />
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <DiscountQuickStats discountId={discountId} />
      </Suspense>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Discount Details</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <DiscountDetailsView discountId={discountId} />
            </Suspense>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <DiscountUsageChart discountId={discountId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <div>Performance analytics will be shown here</div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
