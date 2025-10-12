// app/(dashboard)/seller/events/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import EventsHeader from '@/components/dashboard/events/EventsHeader';
import EventsTable from '@/components/dashboard/events/EventsTable';
import EventsFilters from '@/components/dashboard/events/EventsFilters';
import EventsStats from '@/components/dashboard/events/EventsStats';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Events - Seller Dashboard',
  description: 'Manage your promotional events and sales campaigns',
};

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <EventsHeader />
      
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <EventsStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <EventsFilters />
          </Suspense>
        </Card>

        <div className="lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <EventsTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
