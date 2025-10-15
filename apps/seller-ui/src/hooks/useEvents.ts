'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosinstance';
import { Event, EventFormData, PaginationData } from '@/types';

export interface EventsResponse {
  events: Event[];
  pagination: PaginationData;
  analytics?: {
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
  };
}

export interface EventsParams {
  page?: number;
  limit?: number;
  event_type?: string;
  shop_id?: string;
  category?: string;
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'newest' | 'popularity' | 'conversion_rate' | 'revenue';
  include_analytics?: boolean;
}

interface EventAnalytics {
  viewsTimeline: { date: string; count: number }[];
  clicksTimeline: { date: string; count: number }[];
  topProducts: { id: string; title: string; views: number; conversions: number }[];
  performance: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
}

export interface CreateEventData extends Omit<EventFormData, 'starting_date' | 'ending_date'> {
  starting_date: string;
  ending_date: string;
  product_ids?: string[];
  product_pricing?: Array<{
    productId: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SPECIAL_PRICE';
    discountValue: number;
    maxDiscount?: number;
    specialPrice?: number;
    minQuantity?: number;
    maxQuantity?: number;
  }>;
}

// Utility function for fetching events
const fetchEvents = async (url: string, params?: EventsParams): Promise<EventsResponse> => {
  const formattedParams = params || {};
  
  const { data } = await axiosInstance.get(url, { params: formattedParams });
  return data.data;
};

// Public events with error handling
export const useEvents = (params?: EventsParams) =>
  useQuery<EventsResponse, Error>({
    queryKey: ['events', 'public', params],
    queryFn: () => fetchEvents('/product/api/events', params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

// Seller events (authenticated) with improved caching strategy
export const useSellerEvents = (params?: EventsParams) =>
  useQuery<EventsResponse, Error>({
    queryKey: ['events', 'seller', params],
    queryFn: () => fetchEvents('/product/api/events/seller/events', params),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      // Only retry network errors, not 4xx errors
      const status = (error as any)?.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });

// Single event with detailed data
export const useEvent = (eventId: string, includeAnalytics = false) =>
  useQuery<Event, Error>({
    queryKey: ['events', eventId, { includeAnalytics }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/api/events/${eventId}`, {
        params: { includeAnalytics }
      });
      return data.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });

// Get event analytics
export const useEventAnalytics = (eventId: string, dateRange?: { from: Date; to: Date }) =>
  useQuery<EventAnalytics, Error>({
    queryKey: ['events', eventId, 'analytics', dateRange],
    queryFn: async () => {
      const params = dateRange ? {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
      } : {};
      
      const { data } = await axiosInstance.get(`/product/api/events/${eventId}/analytics`, { 
        params 
      });
      return data.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });

// Create event (basic - without products)
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, CreateEventData>({
    mutationFn: async (eventData) => {
      const { data } = await axiosInstance.post('/product/api/events', eventData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
      throw error;
    },
  });
};

// Create event with products (recommended)
export const useCreateEventWithProducts = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateEventData>({
    mutationFn: async (eventData) => {
      const { data } = await axiosInstance.post('/product/api/events/with-products', eventData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidate products as their pricing may have changed
      toast.success('Event created successfully with products and pricing');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
      throw error;
    },
  });
};

// Update event with optimistic updates
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, { eventId: string; data: Partial<CreateEventData> }, { previousEvent?: Event }>({
    mutationFn: async ({ eventId, data }) => {
      const { data: response } = await axiosInstance.put(`/product/api/events/${eventId}`, data);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: ['events', variables.eventId] });
      
      // Keep previous event data to roll back in case of failure
      const previousEvent = queryClient.getQueryData<Event>(['events', variables.eventId]);
      
      // Optimistically update the event data
      if (previousEvent) {
        queryClient.setQueryData(['events', variables.eventId], {
          ...previousEvent,
          ...variables.data,
        });
      }
      
      return { previousEvent };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidate products as their pricing may have changed
      toast.success('Event updated successfully');
      return data;
    },
    onError: (error: any, variables, context) => {
      // Roll back to previous state on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['events', variables.eventId], context.previousEvent);
      }
      toast.error(error.response?.data?.message || 'Failed to update event');
      throw error;
    },
  });
};

// Delete event with optimistic updates
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousEvents?: EventsResponse }>({
    mutationFn: async (eventId) => {
      await axiosInstance.delete(`/product/api/events/${eventId}`);
    },
    onMutate: async (eventId) => {
      // Cancel outgoing refetches to avoid optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: ['events'] });
      
      // Keep previous events data to roll back in case of failure
      const previousEvents = queryClient.getQueryData<EventsResponse>(['events', 'seller']);
      
      // Optimistically update events list
      if (previousEvents && previousEvents.events) {
        queryClient.setQueryData(['events', 'seller'], {
          ...previousEvents,
          events: previousEvents.events.filter(event => event.id !== eventId),
        });
      }
      
      return { previousEvents };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidate products as their pricing reverts
      toast.success('Event deleted successfully');
    },
    onError: (error: any, eventId, context) => {
      // Roll back to previous state on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['events', 'seller'], context.previousEvents);
      }
      toast.error(error.response?.data?.message || 'Failed to delete event');
      throw error;
    },
  });
};

// Toggle event active state
export const useToggleEventActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Event, Error, { eventId: string; isActive: boolean }>({
    mutationFn: async ({ eventId, isActive }) => {
      // Using the update event endpoint with just the is_active field
      const { data } = await axiosInstance.put(`/product/api/events/${eventId}`, { 
        is_active: isActive 
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      toast.success(`Event ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update event status');
      throw error;
    },
  });
};

// Add function to manage products within an event
export const useUpdateEventProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Event, Error, { eventId: string; productIds: string[]; productPricing?: any[] }>({
    mutationFn: async ({ eventId, productIds, productPricing }) => {
      const { data } = await axiosInstance.put(`/product/api/events/${eventId}/products`, { 
        product_ids: productIds,
        product_pricing: productPricing 
      });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      toast.success('Event products updated successfully');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update event products');
      throw error;
    },
  });
};

// Fetch seller products for event creation (authenticated route - no shopId needed)
export const useSellerProductsForEvent = (params?: { search?: string; category?: string; page?: number; limit?: number }, enabled: boolean = true) => 
  useQuery<any, Error>({
    queryKey: ['events', 'seller-products', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/product/api/events/seller/products', { 
        params 
      });
      return data.data;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
  });
