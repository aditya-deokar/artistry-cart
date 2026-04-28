'use client';

import { useEventAnalytics } from '@/hooks/useEvents';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface EventInsightsProps {
  eventId: string;
}

export default function EventInsights({ eventId }: EventInsightsProps) {
  const { data, isLoading } = useEventAnalytics(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  const conversionRate = data?.performance.conversionRate ?? 0;
  const revenue = data?.performance.revenue ?? 0;

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg border p-3">
        Conversion rate is currently <span className="font-medium">{conversionRate.toFixed(1)}%</span>.
      </div>
      <div className="rounded-lg border p-3">
        Total attributed revenue is <span className="font-medium">{revenue.toFixed(2)}</span>.
      </div>
      <div className="rounded-lg border p-3">
        Top-performing products will appear here as more event traffic comes in.
      </div>
    </div>
  );
}
