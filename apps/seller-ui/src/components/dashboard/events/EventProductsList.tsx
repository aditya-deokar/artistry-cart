'use client';

import { useEvent } from '@/hooks/useEvents';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface EventProductsListProps {
  eventId: string;
}

export default function EventProductsList({ eventId }: EventProductsListProps) {
  const { data: event, isLoading } = useEvent(eventId, true);

  if (isLoading) {
    return <LoadingState />;
  }

  const products = event?.products ?? [];

  if (products.length === 0) {
    return <div className="py-10 text-sm text-muted-foreground">No products assigned yet.</div>;
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">{product.title}</p>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Stock {product.stock}
          </div>
        </div>
      ))}
    </div>
  );
}
