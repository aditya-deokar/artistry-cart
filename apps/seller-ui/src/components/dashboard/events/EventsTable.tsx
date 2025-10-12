// components/dashboard/events/EventsTable.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useEventStore } from '@/store/events/eventStore';
import { getSellerEvents } from '@/lib/api/events';
import { DataTable } from '@/components/dashboard/shared/DataTable';
import { eventColumns } from './EventColumns';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { EmptyState } from '@/components/dashboard/shared/EmptyState';

export default function EventsTable() {
  const { searchQuery, filters, page, limit } = useEventStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-events', { searchQuery, filters, page, limit }],
    queryFn: () => getSellerEvents({ 
      search: searchQuery,
      ...filters,
      page,
      limit 
    }),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error loading events</div>;
  if (!data?.events?.length) return <EmptyState entity="events" />;

  return (
    <DataTable
      columns={eventColumns}
      data={data.events}
      searchKey="title"
      pagination={{
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }}
    />
  );
}
