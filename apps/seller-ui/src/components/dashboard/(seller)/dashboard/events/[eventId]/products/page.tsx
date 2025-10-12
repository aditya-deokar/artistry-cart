// app/(dashboard)/seller/events/[eventId]/products/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventProductManager from '@/components/dashboard/events/EventProductManager';
import EventProductDiscounts from '@/components/dashboard/events/EventProductDiscounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventProductsPageProps {
  params: { eventId: string };
}

export async function generateMetadata({ params }: EventProductsPageProps): Promise<Metadata> {
  return {
    title: `Event Products - Seller Dashboard`,
    description: 'Manage products and discounts for this event',
  };
}

export default function EventProductsPage({ params }: EventProductsPageProps) {
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
            <Package className="h-8 w-8" />
            Event Products
          </h1>
          <p className="text-muted-foreground">
            Manage products and their discounts for this event
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Product Selection</TabsTrigger>
          <TabsTrigger value="discounts">Product Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Select Products for Event</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <EventProductManager eventId={eventId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <CardTitle>Product-Specific Discounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <EventProductDiscounts eventId={eventId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
