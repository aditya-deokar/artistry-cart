'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { Event, CreateEventData, PaginationData } from '@/types';

interface EventsResponse {
  events: Event[];
  pagination: PaginationData;
}

interface EventsParams {
  page?: number;
  limit?: number;
  event_type?: string;
  shop_id?: string;
  category?: string;
  search?: string;
  status?: string;
}

// Utility function for fetching events
const fetchEvents = async (url: string, params?: EventsParams): Promise<EventsResponse> => {
  const { data } = await axiosInstance.get(url, { params });
  return data.data;
};

// Public events
export const useEvents = (params?: EventsParams) =>
  useQuery<EventsResponse>({
    queryKey: ['events', 'public', params],
    queryFn: () => fetchEvents('/product/api/events/all', params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

// Seller events (require shop_id)
export const useSellerEvents = (params: EventsParams & { shop_id: string }) =>
  useQuery<EventsResponse>({
    queryKey: ['events', 'seller', params],
    queryFn: () => fetchEvents('/product/api/events/seller', params),
    staleTime: 2 * 60 * 1000,
  });

// Single event
export const useEvent = (eventId: string) =>
  useQuery<Event>({
    queryKey: ['events', eventId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/api/events/${eventId}`);
      return data.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });

// Create event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<Event, unknown, CreateEventData>({
    mutationFn: async (eventData) => {
      const { data } = await axiosInstance.post('/product/api/events/create', eventData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<Event, unknown, { eventId: string; data: Partial<CreateEventData> }>({
    mutationFn: async ({ eventId, data }) => {
      const { data: response } = await axiosInstance.put(`/product/api/events/update/${eventId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
    },
  });
};

// Delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: async (eventId) => {
      await axiosInstance.delete(`/product/api/events/delete/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
