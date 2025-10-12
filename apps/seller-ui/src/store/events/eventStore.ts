// store/events/eventStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Event, EventFilters } from '@/types/event';

interface EventStore {
  // State
  events: Event[];
  selectedEvents: string[];
  searchQuery: string;
  filters: EventFilters;
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  view: 'table' | 'grid';

  // Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  removeEvent: (id: string) => void;
  setSelectedEvents: (ids: string[]) => void;
  toggleEventSelection: (id: string) => void;
  selectAllEvents: () => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setView: (view: 'table' | 'grid') => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;

  // Computed
  selectedCount: number;
  hasSelection: boolean;
  activeEvents: Event[];
  upcomingEvents: Event[];
  endedEvents: Event[];
}

export const useEventStore = create<EventStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        events: [],
        selectedEvents: [],
        searchQuery: '',
        filters: {
          event_type: '',
          status: '',
          dateRange: null,
        },
        page: 1,
        limit: 20,
        total: 0,
        isLoading: false,
        view: 'grid',

        // Actions
        setEvents: (events) => set({ events }),

        addEvent: (event) =>
          set((state) => ({
            events: [event, ...state.events],
            total: state.total + 1,
          })),

        updateEvent: (id, updates) =>
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id ? { ...event, ...updates } : event
            ),
          })),

        removeEvent: (id) =>
          set((state) => ({
            events: state.events.filter((event) => event.id !== id),
            selectedEvents: state.selectedEvents.filter((eid) => eid !== id),
            total: Math.max(0, state.total - 1),
          })),

        setSelectedEvents: (ids) => set({ selectedEvents: ids }),

        toggleEventSelection: (id) =>
          set((state) => ({
            selectedEvents: state.selectedEvents.includes(id)
              ? state.selectedEvents.filter((eid) => eid !== id)
              : [...state.selectedEvents, id],
          })),

        selectAllEvents: () =>
          set((state) => ({
            selectedEvents: state.events.map((event) => event.id),
          })),

        clearSelection: () => set({ selectedEvents: [] }),

        setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            page: 1,
          })),

        setPage: (page) => set({ page }),

        setLimit: (limit) => set({ limit, page: 1 }),

        setView: (view) => set({ view }),

        clearFilters: () =>
          set({
            filters: {
              event_type: '',
              status: '',
              dateRange: null,
            },
            searchQuery: '',
            page: 1,
          }),

        setLoading: (isLoading) => set({ isLoading }),

        // Computed
        get selectedCount() {
          return get().selectedEvents.length;
        },

        get hasSelection() {
          return get().selectedEvents.length > 0;
        },

        get activeEvents() {
          const now = new Date();
          return get().events.filter(event => {
            const start = new Date(event.starting_date);
            const end = new Date(event.ending_date);
            return event.is_active && now >= start && now <= end;
          });
        },

        get upcomingEvents() {
          const now = new Date();
          return get().events.filter(event => {
            const start = new Date(event.starting_date);
            return event.is_active && now < start;
          });
        },

        get endedEvents() {
          const now = new Date();
          return get().events.filter(event => {
            const end = new Date(event.ending_date);
            return now > end;
          });
        },
      }),
      {
        name: 'event-store',
        partialize: (state) => ({
          view: state.view,
          filters: state.filters,
          limit: state.limit,
        }),
      }
    ),
    { name: 'event-store' }
  )
);
