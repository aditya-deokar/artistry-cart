'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { EventType, EventsResponse } from '@/types/events';
import { Bounded } from '@/components/common/Bounded';
import { EventCard } from '@/components/events/EventCard';
import { EventFilter } from '@/components/events/EventFilter';
import { Calendar, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const limit = 12;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch active events
  const { data, isLoading, isError } = useQuery<EventsResponse>({
    queryKey: ['events', selectedType, searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        is_active: 'true',
      });

      if (selectedType !== 'all') {
        params.append('event_type', selectedType);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await axiosInstance.get(`/product/api/events?${params.toString()}`);
      console.log('Active Events API Response:', res.data);
      
      // Handle different response structures
      if (res.data.data) {
        // If response has a 'data' wrapper
        return {
          events: res.data.data.events || res.data.data || [],
          pagination: res.data.data.pagination || res.data.pagination || {
            total: res.data.data.events?.length || res.data.data?.length || 0,
            page: page,
            limit: limit,
            totalPages: Math.ceil((res.data.data.events?.length || res.data.data?.length || 0) / limit),
          },
        };
      }
      
      // If response is direct
      return {
        events: res.data.events || res.data || [],
        pagination: res.data.pagination || {
          total: res.data.events?.length || res.data?.length || 0,
          page: page,
          limit: limit,
          totalPages: Math.ceil((res.data.events?.length || res.data?.length || 0) / limit),
        },
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch upcoming events (not yet started)
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery<EventsResponse>({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/events?limit=6`);
      console.log('Upcoming Events API Response:', res.data);
      
      // Handle different response structures
      let allEvents = [];
      if (res.data.data) {
        allEvents = res.data.data.events || res.data.data || [];
      } else {
        allEvents = res.data.events || res.data || [];
      }
      
      // Filter for events that haven't started yet
      const now = new Date();
      const upcoming = allEvents.filter((event: any) => {
        const startDate = new Date(event.starting_date);
        return startDate > now;
      });
      
      console.log('Filtered Upcoming Events:', upcoming);
      
      return {
        events: upcoming,
        pagination: {
          total: upcoming.length,
          page: 1,
          limit: 6,
          totalPages: 1,
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const events = data?.events || [];
  const pagination = data?.pagination;
  const upcomingEvents = upcomingData?.events || [];

  console.log('Final Events:', events);
  console.log('Final Upcoming Events:', upcomingEvents);
  console.log('Pagination:', pagination);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Bold & Modern */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-b">
        <Bounded className="py-16 md:py-24">
          <div className={`max-w-4xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Live Events</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Discover Amazing
                <br />
                <span className="text-primary">Events & Deals</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Explore exclusive sales, seasonal offers, and limited-time deals from your favorite sellers
              </p>

              {pagination && pagination.total > 0 && (
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-2xl">{pagination.total}</span>
                    <span className="text-muted-foreground">Active Events</span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Up to 70% savings</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Bounded>
      </div>

      <Bounded className="py-12 md:py-16">
        {/* Filters and Search */}
        <div className={`space-y-6 mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Browse Events</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:w-auto w-full">
              {/* Search */}
              <div className="relative sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-11"
                />
              </div>

              {/* Event Type Filter */}
              <div className="sm:min-w-[180px]">
                <EventFilter selectedType={selectedType} onTypeChange={setSelectedType} />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[16/9] w-full rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted/80" />
                  <div className="h-4 w-2/3 rounded bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Events</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Something went wrong while fetching events. Please try again.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && events.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {searchQuery ? 'No Results Found' : 'No Active Events'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No events found matching "${searchQuery}". Try adjusting your search.`
                : 'There are no active events at the moment. Check back soon!'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Events Grid - Larger Cards */}
        {!isLoading && !isError && events.length > 0 && (
          <div className="space-y-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="transition-opacity duration-500"
                  style={{
                    animation: 'fadeInUp 0.5s ease-out forwards',
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                  }}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-8 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        return (
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - page) <= 1
                        );
                      })
                      .map((p, i, arr) => {
                        const prevPage = arr[i - 1];
                        const showEllipsis = prevPage && p - prevPage > 1;

                        return (
                          <div key={p} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={p === page ? 'default' : 'ghost'}
                              size="default"
                              onClick={() => setPage(p)}
                              className="h-10 w-10"
                            >
                              {p}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="default"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>

                {/* Results Count */}
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)} of {pagination.total} events
                </p>
              </div>
            )}
          </div>
        )}
      </Bounded>

      {/* Upcoming Events Section - Moved to Bottom */}
      {upcomingEvents.length > 0 && (
        <div className="bg-muted/30 border-t">
          <Bounded className="py-12 md:py-16">
            <div className={`space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Section Header */}
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background mb-4">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Upcoming Events</h2>
                <p className="text-muted-foreground">
                  Don't miss out on these exciting events launching soon
                </p>
              </div>

              {/* Upcoming Events Grid */}
              {upcomingLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="h-96 rounded-xl bg-background animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.slice(0, 6).map((event, index) => (
                    <div
                      key={event.id}
                      className="opacity-0 animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      <EventCard event={event} upcoming={true} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Bounded>
        </div>
      )}
    </div>
  );
}
