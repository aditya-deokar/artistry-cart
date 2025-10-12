// app/(dashboard)/seller/offers/seasonal/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import SeasonalHeader from '@/components/dashboard/offers/seasonal/SeasonalHeader';
import SeasonalCalendar from '@/components/dashboard/offers/seasonal/SeasonalCalendar';
import HolidayOffers from '@/components/dashboard/offers/seasonal/HolidayOffers';
import SeasonalTemplates from '@/components/dashboard/offers/seasonal/SeasonalTemplates';
import SeasonalAnalytics from '@/components/dashboard/offers/seasonal/SeasonalAnalytics';
import UpcomingSeason from '@/components/dashboard/offers/seasonal/UpcomingSeason';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Seasonal Offers - Seller Dashboard',
  description: 'Manage seasonal promotions, holiday sales, and time-based offers',
};

export default function SeasonalOffersPage() {
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
            <Calendar className="h-8 w-8" />
            Seasonal Offers
          </h1>
          <p className="text-muted-foreground">
            Create and manage seasonal promotions, holiday sales, and special events
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <SeasonalHeader />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Seasons</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UpcomingSeason />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="active">Active Offers</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <SeasonalCalendar />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Holiday Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <HolidayOffers />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <SeasonalTemplates />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <SeasonalAnalytics />
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
