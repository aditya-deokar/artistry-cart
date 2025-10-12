// app/(dashboard)/seller/offers/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import OffersHeader from '@/components/dashboard/offers/OffersHeader';
import OffersStats from '@/components/dashboard/offers/OffersStats';
import OffersOverview from '@/components/dashboard/offers/OffersOverview';
import QuickActions from '@/components/dashboard/offers/QuickActions';
import ActiveOffers from '@/components/dashboard/offers/ActiveOffers';
import OfferPerformance from '@/components/dashboard/offers/OfferPerformance';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Offers Management - Seller Dashboard',
  description: 'Manage all your promotional offers, pricing strategies, and sales campaigns',
};

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <OffersHeader />
      
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <OffersStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <QuickActions />
          </Suspense>
        </Card>

        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="active">Active Offers</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <OffersOverview />
              </Suspense>
            </TabsContent>

            <TabsContent value="active">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <ActiveOffers />
              </Suspense>
            </TabsContent>

            <TabsContent value="performance">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <OfferPerformance />
              </Suspense>
            </TabsContent>

            <TabsContent value="scheduled">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Scheduled offers will be displayed here</p>
                </div>
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
