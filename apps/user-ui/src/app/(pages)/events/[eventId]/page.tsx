'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import { Event } from '@/types/events';
import { ArtProduct } from '@/types/products';
import { Bounded } from '@/components/common/Bounded';
import { EventHero } from '@/components/events/EventHero';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  // Fetch event details
  const { data: event, isLoading, isError } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/events/${eventId}`);
      console.log('Event Detail API Response:', res.data);
      
      // Handle response structure - data might be nested
      if (res.data.data) {
        return res.data.data;
      }
      return res.data;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Bounded className="py-12">
          <div className="space-y-12 animate-pulse">
            {/* Back button skeleton */}
            <div className="h-10 w-32 bg-muted rounded-lg" />
            
            {/* Hero skeleton */}
            <div className="space-y-6">
              <div className="h-96 bg-muted rounded-2xl" />
              <div className="space-y-3">
                <div className="h-8 w-2/3 bg-muted rounded" />
                <div className="h-6 w-1/2 bg-muted rounded" />
              </div>
            </div>
            
            {/* Products grid skeleton */}
            <div>
              <div className="h-10 w-64 bg-muted rounded mb-6" />
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-square bg-muted rounded-xl" />
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Bounded>
      </div>
    );
  }

  // Error State
  if (isError || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Bounded className="py-12">
          <div className="text-center py-32">
            <Calendar className="mx-auto h-20 w-20 text-muted-foreground/50 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Not Found</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/events">
              <Button size="lg" className="px-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
        </Bounded>
      </div>
    );
  }

  const products = event.products || [];
  // Handle both Shop (uppercase) and shop (lowercase) from API
  const shop = (event as any).shop || event.Shop;

  return (
    <div className="min-h-screen bg-background">
      <Bounded className="py-8 md:py-12">
        {/* Back Button */}
        <Link href="/events">
          <Button variant="ghost" size="lg" className="mb-8 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        {/* Event Hero */}
        <div className="mb-16">
          <EventHero event={event} />
        </div>

        {/* Products Section */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
            <p className="text-lg text-muted-foreground">
              {products.length} {products.length === 1 ? 'product' : 'products'} in this event
            </p>
          </div>

          {/* Products Grid - Larger Cards */}
          {products.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: ArtProduct) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">
                No products are currently featured in this event.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for exciting deals!
              </p>
            </div>
          )}
        </div>

        {/* Shop CTA - Enhanced */}
        {shop && (
          <div className="mt-16 rounded-2xl border-2 bg-gradient-to-br from-card to-muted/20 p-8 md:p-10 shadow-lg">
            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
              <div className="flex items-center gap-6">
                {shop.avatar?.url || shop.logo?.url ? (
                  <img
                    src={shop.avatar?.url || shop.logo?.url}
                    alt={shop.name}
                    className="h-20 w-20 rounded-full object-cover border-4 border-background shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 shadow-md">
                    <span className="text-3xl font-bold text-primary">
                      {shop.name[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold mb-1">{shop.name}</h3>
                  <p className="text-muted-foreground">
                    {shop.bio || 'Event hosted by this shop'}
                  </p>
                  {shop.ratings !== undefined && shop.ratings > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span className="ml-1 font-semibold">{shop.ratings.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {shop.slug && (
                <Link href={`/shops/${shop.slug}`}>
                  <Button size="lg" className="px-8">
                    Visit Shop
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Bounded>
    </div>
  );
}
