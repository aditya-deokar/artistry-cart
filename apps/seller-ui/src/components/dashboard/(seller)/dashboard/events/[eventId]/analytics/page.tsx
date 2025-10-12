// app/(dashboard)/seller/events/[eventId]/analytics/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventAnalytics from '@/components/dashboard/events/EventAnalytics';
import EventPerformanceCharts from '@/components/dashboard/events/EventPerformanceCharts';
import EventInsights from '@/components/dashboard/events/EventInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EventAnalyticsPageProps {
  params: { eventId: string };
}

export async function generateMetadata({ params }: EventAnalyticsPageProps): Promise<Metadata> {
  return {
    title: `Event Analytics - Seller Dashboard`,
    description: 'View detailed event performance analytics',
  };
}

export default function EventAnalyticsPage({ params }: EventAnalyticsPageProps) {
  const { eventId } = params;

  if (!eventId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/seller/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Event Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed insights into your event performance
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <EventAnalytics eventId={eventId} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EventPerformanceCharts eventId={eventId} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EventInsights eventId={eventId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
