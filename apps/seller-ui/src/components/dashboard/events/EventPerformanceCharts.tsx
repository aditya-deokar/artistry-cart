'use client';

import { useEventAnalytics } from '@/hooks/useEvents';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface EventPerformanceChartsProps {
  eventId: string;
}

export default function EventPerformanceCharts({
  eventId,
}: EventPerformanceChartsProps) {
  const { data, isLoading } = useEventAnalytics(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-3">
      {(data?.viewsTimeline ?? []).slice(0, 6).map((point) => (
        <div key={point.date} className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{point.date}</span>
            <span className="font-medium">{point.count} views</span>
          </div>
        </div>
      ))}
    </div>
  );
}
