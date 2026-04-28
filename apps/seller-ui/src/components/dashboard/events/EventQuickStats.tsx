'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEventAnalytics } from '@/hooks/useEvents';
import { formatCurrency } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface EventQuickStatsProps {
  eventId: string;
}

export default function EventQuickStats({ eventId }: EventQuickStatsProps) {
  const { data, isLoading } = useEventAnalytics(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  const stats = [
    { label: 'Views', value: data?.performance.views ?? 0 },
    { label: 'Clicks', value: data?.performance.clicks ?? 0 },
    { label: 'Conversions', value: data?.performance.conversions ?? 0 },
    { label: 'Revenue', value: formatCurrency(data?.performance.revenue ?? 0) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
