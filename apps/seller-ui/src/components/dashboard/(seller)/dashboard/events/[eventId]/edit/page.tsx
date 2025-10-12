// app/(dashboard)/seller/events/[eventId]/edit/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventForm from '@/components/dashboard/events/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EditEventPageProps {
  params: { eventId: string };
}

export async function generateMetadata({ params }: EditEventPageProps): Promise<Metadata> {
  return {
    title: `Edit Event - Seller Dashboard`,
    description: 'Edit event details and settings',
  };
}

export default function EditEventPage({ params }: EditEventPageProps) {
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
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">
            Update your event information and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <EventForm mode="edit" eventId={eventId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
