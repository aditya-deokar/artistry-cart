'use client';

import { useState, Suspense } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useSellerEvents } from '@/hooks/useEvents';
import EventsTable from '@/components/events/eventsTable';
import EventsTableSkeleton from '@/components/events/EventsTableSkeleton';
import CreateEventDialog from '@/components/events/createEventDialog';
import useSeller from '@/hooks/useSeller';

function EventsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [eventType, setEventType] = useState('ALL'); 
  const [page, setPage] = useState(1);

  const { seller, isLoading: isSellerLoading } = useSeller();

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error } = useSellerEvents({
    page,
    limit: 10,
    status,
    shop_id: seller?.id || '', 
    event_type: eventType === 'ALL' ? undefined : eventType,  // Send undefined if "ALL"
    search: debouncedSearch || undefined,
  });

   if (isSellerLoading) {
    return <div>Loading seller data...</div>;
  }

  if (!seller?.id) {
    return <div className="text-red-500">Unable to fetch seller details.</div>;
  }

  if (error) {
    throw error; 
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage promotional events for your products
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
           <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                <SelectItem value="SEASONAL">Seasonal</SelectItem>
                <SelectItem value="CLEARANCE">Clearance</SelectItem>
                <SelectItem value="NEW_ARRIVAL">New Arrival</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={status} onValueChange={setStatus} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value={status} className="mt-6">
              {isLoading ? (
                <EventsTableSkeleton />
              ) : (
                <EventsTable
                  data={data?.events || []}
                  pagination={data?.pagination}
                  onPageChange={setPage}
                  currentPage={page}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateEventDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsTableSkeleton />}>
      <EventsContent />
    </Suspense>
  );
}
