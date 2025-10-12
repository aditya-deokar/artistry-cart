// app/(dashboard)/seller/offers/flash-sales/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import FlashSalesHeader from '@/components/dashboard/offers/flash-sales/FlashSalesHeader';
import ActiveFlashSales from '@/components/dashboard/offers/flash-sales/ActiveFlashSales';
import FlashSaleCreator from '@/components/dashboard/offers/flash-sales/FlashSaleCreator';
import FlashSaleTemplates from '@/components/dashboard/offers/flash-sales/FlashSaleTemplates';
import FlashSaleAnalytics from '@/components/dashboard/offers/flash-sales/FlashSaleAnalytics';
import FlashSaleScheduler from '@/components/dashboard/offers/flash-sales/FlashSaleScheduler';
import UpcomingFlashSales from '@/components/dashboard/offers/flash-sales/UpcomingFlashSales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Flash Sales - Seller Dashboard',
  description: 'Create and manage flash sales, lightning deals, and time-sensitive offers',
};

export default function FlashSalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/offers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Offers
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Flash Sales Management
          </h1>
          <p className="text-muted-foreground">
            Create urgency with time-limited flash sales and lightning deals
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <FlashSalesHeader />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <FlashSaleCreator />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Flash Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UpcomingFlashSales />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Sales</TabsTrigger>
              <TabsTrigger value="scheduler">Schedule New</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Flash Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <ActiveFlashSales />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scheduler">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Flash Sale</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <FlashSaleScheduler />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Flash Sale Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <FlashSaleTemplates />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Flash Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <FlashSaleAnalytics />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
