// lib/api/events.ts
import axiosInstance from '@/utils/axiosinstance';
import { Event, EventFormData, EventFilters } from '@/types/event';

export interface GetEventsParams extends EventFilters {
  search?: string;
  page?: number;
  limit?: number;
  shopId?: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get seller events
export const getSellerEvents = async (params: GetEventsParams): Promise<EventsResponse> => {
  const { data } = await axiosInstance.get('/api/events/seller/events', { params });
  return data.data;
};

// Get all events (public)
export const getAllEvents = async (params: GetEventsParams): Promise<EventsResponse> => {
  const { data } = await axiosInstance.get('/api/events', { params });
  return data.data;
};

// Get single event
export const getEventById = async (id: string): Promise<Event> => {
  const { data } = await axiosInstance.get(`/api/events/${id}`);
  return data.data;
};

// Create event
export const createEvent = async (eventData: EventFormData): Promise<Event> => {
  const { data } = await axiosInstance.post('/api/events', eventData);
  return data.data;
};

// Create event with products
export const createEventWithProducts = async (eventData: any): Promise<Event> => {
  const { data } = await axiosInstance.post('/api/events/with-products', eventData);
  return data.data;
};

// Update event
export const updateEvent = async (id: string, eventData: EventFormData): Promise<Event> => {
  const { data } = await axiosInstance.put(`/api/events/${id}`, eventData);
  return data.data;
};

// Delete event
export const deleteEvent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/events/${id}`);
};

// Get seller products for event
export const getSellerProductsForEvent = async (): Promise<any[]> => {
  const { data } = await axiosInstance.get('/api/events/seller/products');
  return data.data;
};

// Update event products
export const updateEventProducts = async (eventId: string, productIds: string[]): Promise<void> => {
  await axiosInstance.put(`/api/events/${eventId}/products`, { productIds });
};

// Event analytics
export const getEventAnalytics = async (eventId: string): Promise<any> => {
  const { data } = await axiosInstance.get(`/api/events/${eventId}/analytics`);
  return data.data;
};

// Bulk operations
export const bulkUpdateEvents = async (ids: string[], updates: Partial<Event>): Promise<void> => {
  await axiosInstance.put('/api/events/bulk-update', { ids, updates });
};

export const bulkDeleteEvents = async (ids: string[]): Promise<void> => {
  await axiosInstance.delete('/api/events/bulk-delete', { data: { ids } });
};
