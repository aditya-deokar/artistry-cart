'use client';

import { useState, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, Search, Calendar, DollarSign, Percent, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from "react-day-picker";
import { useDebounce } from '@/hooks/useDebounce';
import { useSellerEvents } from '@/hooks/useEvents';
import EventsTable from '@/components/events/eventsTable';
import EventsTableSkeleton from '@/components/events/EventsTableSkeleton';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

function EventsContent() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [eventType, setEventType] = useState('ALL');
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>(); 
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  // Format date range for API if present
  const apiDateParams = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return {};
    
    return {
      start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    };
  }, [dateRange]);

  const { data, isLoading, error } = useSellerEvents({
    page,
    limit: 10,
    status: status !== 'all' ? status : undefined,
    event_type: eventType === 'ALL' ? undefined : eventType,
    search: debouncedSearch || undefined,
    ...apiDateParams
  });

  // Calculate analytics from events data
  const analytics = useMemo(() => {
    if (!data?.events) return {
      activeEvents: 0,
      upcomingEvents: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalViews: 0,
      averageConversion: 0
    };

    const now = new Date();
    const events = data.events;
    
    const active = events.filter(e => 
      new Date(e.starting_date) <= now && 
      new Date(e.ending_date) >= now && 
      e.is_active
    ).length;
    
    const upcoming = events.filter(e => new Date(e.starting_date) > now).length;
    
    // Calculate revenue from event data
    const revenue = events.reduce((acc, event) => acc + ((event as any).totalRevenue || 0), 0);
    
    // Calculate total products in events
    const products = events.reduce((acc, event) => {
      // Use _count from the API if available, otherwise use products length
      const productCount = (event as any)._count?.products || event.products?.length || 0;
      return acc + productCount;
    }, 0);
    
    // Get view and conversion metrics
    const views = events.reduce((acc, event) => acc + (event.views || 0), 0);
    const conversions = events.reduce((acc, event) => acc + ((event as any).conversions || 0), 0);
    
    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

    return {
      activeEvents: active,
      upcomingEvents: upcoming,
      totalRevenue: revenue,
      totalProducts: products,
      totalViews: views,
      averageConversion: conversionRate
    };
  }, [data?.events]);

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
        <Button onClick={() => router.push('/dashboard/events/create')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Events</p>
              <h2 className="text-3xl font-bold">{analytics.activeEvents}</h2>
              <p className="text-xs text-muted-foreground">
                {analytics.upcomingEvents} upcoming
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h2 className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</h2>
              <p className="text-xs text-muted-foreground">
                From all promotional events
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Views</p>
              <h2 className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</h2>
              <p className="text-xs text-muted-foreground">
                {analytics.totalProducts} products in events
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <h2 className="text-3xl font-bold">{analytics.averageConversion.toFixed(1)}%</h2>
              <p className="text-xs text-muted-foreground">
                Avg. across all events
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Percent className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>
            Manage your promotional events and track their performance
          </CardDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-[140px]">
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

              <DatePickerWithRange
                value={dateRange as DateRange}
                onChange={(range) => setDateRange(range as any)}
              />
            </div>
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
