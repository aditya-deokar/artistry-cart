// app/(dashboard)/seller/events/[eventId]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailsView from '@/components/dashboard/events/EventDetailsView';
import EventActionButtons from '@/components/dashboard/events/EventActionButtons';
import EventQuickStats from '@/components/dashboard/events/EventQuickStats';
import EventProductsList from '@/components/dashboard/events/EventProductsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventPageProps {
  params: { eventId: string };
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  return {
    title: `Event Details - Seller Dashboard`,
    description: 'View and manage event details',
  };
}

export default function EventDetailsPage({ params }: EventPageProps) {
  const { eventId } = params;

  if (!eventId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Event Details
            </h1>
            <p className="text-muted-foreground">
              Manage your promotional event
            </p>
          </div>
        </div>
        <EventActionButtons eventId={eventId} />
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <EventQuickStats eventId={eventId} />
      </Suspense>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <EventDetailsView eventId={eventId} />
            </Suspense>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Event Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <EventProductsList eventId={eventId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <div>Performance analytics will be shown here</div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
