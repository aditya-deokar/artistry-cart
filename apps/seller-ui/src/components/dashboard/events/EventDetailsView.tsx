'use client';

import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvent } from '@/hooks/useEvents';
import { formatDate } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface EventDetailsViewProps {
  eventId: string;
}

export default function EventDetailsView({ eventId }: EventDetailsViewProps) {
  const { data: event, isLoading } = useEvent(eventId, true);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!event) {
    return (
      <CardContent className="py-10 text-sm text-muted-foreground">
        Event details are not available.
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{event.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
          <Badge variant={event.is_active ? 'default' : 'secondary'}>
            {event.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Event Type
            </p>
            <p className="mt-1 text-sm">{event.event_type.replaceAll('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Start Date
            </p>
            <p className="mt-1 text-sm">{formatDate(event.starting_date)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              End Date
            </p>
            <p className="mt-1 text-sm">{formatDate(event.ending_date)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Discount Strategy
            </p>
            <p className="mt-1 text-sm">
              {event.discount_type
                ? `${event.discount_type.replaceAll('_', ' ')} (${event.discount_value ?? 0})`
                : event.discount_percent
                  ? `${event.discount_percent}% off`
                  : 'Not configured'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Products
            </p>
            <p className="mt-1 text-sm">{event._count?.products ?? event.products?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Shop
            </p>
            <p className="mt-1 text-sm">{event.shop?.name || event.shopId}</p>
          </div>
        </div>
      </CardContent>
    </>
  );
}
