// store/offers/offerStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  Offer, 
  OfferFilters, 
  OfferStatus, 
  OfferType, 
  SeasonalOffer, 
  FlashSaleOffer, 
  PricingStrategy 
} from './offerTypes';

interface OfferStore {
  // State
  offers: Offer[];
  seasonalOffers: SeasonalOffer[];
  flashSales: FlashSaleOffer[];
  pricingStrategies: PricingStrategy[];
  selectedOfferIds: Set<string>;
  filters: OfferFilters;
  searchQuery: string;
  sortBy: 'title' | 'createdAt' | 'startDate' | 'endDate' | 'performance';
  sortOrder: 'asc' | 'desc';
  view: 'grid' | 'table' | 'calendar';
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  error: string | null;

  // Computed getters
  activeOffers: Offer[];
  scheduledOffers: Offer[];
  expiredOffers: Offer[];
  draftOffers: Offer[];
  filteredOffers: Offer[];
  selectedCount: number;
  hasSelection: boolean;

  // Actions
  setOffers: (offers: Offer[]) => void;
  addOffer: (offer: Offer) => void;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  duplicateOffer: (id: string) => void;
  bulkUpdateOffers: (ids: string[], updates: Partial<Offer>) => void;
  bulkDeleteOffers: (ids: string[]) => void;

  // Selection actions
  selectOffer: (id: string) => void;
  deselectOffer: (id: string) => void;
  toggleOfferSelection: (id: string) => void;
  selectAllOffers: () => void;
  clearSelection: () => void;
  selectOffersByType: (type: OfferType) => void;
  selectOffersByStatus: (status: OfferStatus) => void;

  // Filtering and search
  setFilters: (filters: Partial<OfferFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string, order?: 'asc' | 'desc') => void;
  setView: (view: 'grid' | 'table' | 'calendar') => void;

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetPagination: () => void;

  // Seasonal offers
  addSeasonalOffer: (offer: SeasonalOffer) => void;
  updateSeasonalOffer: (id: string, updates: Partial<SeasonalOffer>) => void;
  deleteSeasonalOffer: (id: string) => void;
  getSeasonalOffersByDate: (date: Date) => SeasonalOffer[];
  getUpcomingSeasons: () => any[];

  // Flash sales
  addFlashSale: (flashSale: FlashSaleOffer) => void;
  updateFlashSale: (id: string, updates: Partial<FlashSaleOffer>) => void;
  deleteFlashSale: (id: string) => void;
  getActiveFlashSales: () => FlashSaleOffer[];
  getEndingSoonFlashSales: () => FlashSaleOffer[];

  // Pricing strategies
  addPricingStrategy: (strategy: PricingStrategy) => void;
  updatePricingStrategy: (id: string, updates: Partial<PricingStrategy>) => void;
  deletePricingStrategy: (id: string) => void;
  getActivePricingStrategies: () => PricingStrategy[];

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Analytics
  getOfferPerformance: (id: string) => any;
  getTopPerformingOffers: (limit?: number) => Offer[];
  getOffersByRevenue: () => Offer[];
  getConversionRates: () => Record<string, number>;
}

export const useOfferStore = create<OfferStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        offers: [],
        seasonalOffers: [],
        flashSales: [],
        pricingStrategies: [],
        selectedOfferIds: new Set(),
        filters: {
          type: undefined,
          status: undefined,
          discountType: undefined,
          categories: [],
          dateRange: null,
          minDiscount: undefined,
          maxDiscount: undefined,
          priority: undefined,
        },
        searchQuery: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        view: 'grid',
        page: 1,
        limit: 20,
        total: 0,
        isLoading: false,
        error: null,

        // Computed getters
        get activeOffers() {
          const now = new Date();
          return get().offers.filter(offer => 
            offer.status === OfferStatus.ACTIVE && 
            new Date(offer.startDate) <= now &&
            (!offer.endDate || new Date(offer.endDate) >= now)
          );
        },

        get scheduledOffers() {
          const now = new Date();
          return get().offers.filter(offer => 
            offer.status === OfferStatus.SCHEDULED ||
            new Date(offer.startDate) > now
          );
        },

        get expiredOffers() {
          const now = new Date();
          return get().offers.filter(offer => 
            offer.status === OfferStatus.ENDED || 
            (offer.endDate && new Date(offer.endDate) < now)
          );
        },

        get draftOffers() {
          return get().offers.filter(offer => offer.status === OfferStatus.DRAFT);
        },

        get filteredOffers() {
          const { offers, filters, searchQuery } = get();
          
          return offers.filter(offer => {
            // Search query filter
            if (searchQuery && !offer.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !offer.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }

            // Type filter
            if (filters.type && offer.type !== filters.type) {
              return false;
            }

            // Status filter
            if (filters.status && offer.status !== filters.status) {
              return false;
            }

            // Discount type filter
            if (filters.discountType && offer.discountType !== filters.discountType) {
              return false;
            }

            // Categories filter
            if (filters.categories?.length && !filters.categories.some(cat => 
              offer.targetCategories?.includes(cat))) {
              return false;
            }

            // Discount range filter
            if (filters.minDiscount && offer.discountValue < filters.minDiscount) {
              return false;
            }
            if (filters.maxDiscount && offer.discountValue > filters.maxDiscount) {
              return false;
            }

            // Priority filter
            if (filters.priority && offer.priority !== filters.priority) {
              return false;
            }

            // Date range filter
            if (filters.dateRange) {
              const offerStart = new Date(offer.startDate);
              const offerEnd = offer.endDate ? new Date(offer.endDate) : offerStart;
              const filterStart = filters.dateRange.from;
              const filterEnd = filters.dateRange.to;

              if (filterStart && offerEnd < filterStart) return false;
              if (filterEnd && offerStart > filterEnd) return false;
            }

            return true;
          });
        },

        get selectedCount() {
          return get().selectedOfferIds.size;
        },

        get hasSelection() {
          return get().selectedOfferIds.size > 0;
        },

        // Actions
        setOffers: (offers) => set({ offers, total: offers.length }),

        addOffer: (offer) => set((state) => {
          state.offers.unshift(offer);
          state.total += 1;
        }),

        updateOffer: (id, updates) => set((state) => {
          const index = state.offers.findIndex(offer => offer.id === id);
          if (index !== -1) {
            Object.assign(state.offers[index], updates);
          }
        }),

        deleteOffer: (id) => set((state) => {
          state.offers = state.offers.filter(offer => offer.id !== id);
          state.selectedOfferIds.delete(id);
          state.total = Math.max(0, state.total - 1);
        }),

        duplicateOffer: (id) => set((state) => {
          const offer = state.offers.find(o => o.id === id);
          if (offer) {
            const duplicated = {
              ...offer,
              id: `${id}-copy-${Date.now()}`,
              title: `${offer.title} (Copy)`,
              status: OfferStatus.DRAFT,
              createdAt: new Date().toISOString(),
              performance: {
                views: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                customerCount: 0,
                conversionRate: 0,
              }
            };
            state.offers.unshift(duplicated);
            state.total += 1;
          }
        }),

        bulkUpdateOffers: (ids, updates) => set((state) => {
          ids.forEach(id => {
            const index = state.offers.findIndex(offer => offer.id === id);
            if (index !== -1) {
              Object.assign(state.offers[index], updates);
            }
          });
        }),

        bulkDeleteOffers: (ids) => set((state) => {
          state.offers = state.offers.filter(offer => !ids.includes(offer.id));
          ids.forEach(id => state.selectedOfferIds.delete(id));
          state.total = Math.max(0, state.total - ids.length);
        }),

        // Selection actions
        selectOffer: (id) => set((state) => {
          state.selectedOfferIds.add(id);
        }),

        deselectOffer: (id) => set((state) => {
          state.selectedOfferIds.delete(id);
        }),

        toggleOfferSelection: (id) => set((state) => {
          if (state.selectedOfferIds.has(id)) {
            state.selectedOfferIds.delete(id);
          } else {
            state.selectedOfferIds.add(id);
          }
        }),

        selectAllOffers: () => set((state) => {
          state.filteredOffers.forEach(offer => {
            state.selectedOfferIds.add(offer.id);
          });
        }),

        clearSelection: () => set((state) => {
          state.selectedOfferIds.clear();
        }),

        selectOffersByType: (type) => set((state) => {
          state.offers
            .filter(offer => offer.type === type)
            .forEach(offer => state.selectedOfferIds.add(offer.id));
        }),

        selectOffersByStatus: (status) => set((state) => {
          state.offers
            .filter(offer => offer.status === status)
            .forEach(offer => state.selectedOfferIds.add(offer.id));
        }),

        // Filtering and search
        setFilters: (newFilters) => set((state) => {
          Object.assign(state.filters, newFilters);
          state.page = 1; // Reset pagination when filters change
        }),

        clearFilters: () => set((state) => {
          state.filters = {
            type: undefined,
            status: undefined,
            discountType: undefined,
            categories: [],
            dateRange: null,
            minDiscount: undefined,
            maxDiscount: undefined,
            priority: undefined,
          };
          state.searchQuery = '';
          state.page = 1;
        }),

        setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),

        setSortBy: (sortBy, order = 'desc') => set((state) => {
          state.sortBy = sortBy as any;
          state.sortOrder = order;
          
          // Apply sorting
          state.offers.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
              case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
              case 'createdAt':
                aValue = new Date(a.createdAt);
                bValue = new Date(b.createdAt);
                break;
              case 'startDate':
                aValue = new Date(a.startDate);
                bValue = new Date(b.startDate);
                break;
              case 'endDate':
                aValue = a.endDate ? new Date(a.endDate) : new Date(0);
                bValue = b.endDate ? new Date(b.endDate) : new Date(0);
                break;
              case 'performance':
                aValue = a.performance?.revenue || 0;
                bValue = b.performance?.revenue || 0;
                break;
              default:
                return 0;
            }
            
            if (order === 'asc') {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });
        }),

        setView: (view) => set({ view }),

        // Pagination
        setPage: (page) => set({ page }),
        setLimit: (limit) => set({ limit, page: 1 }),
        resetPagination: () => set({ page: 1 }),

        // Seasonal offers
        addSeasonalOffer: (offer) => set((state) => {
          state.seasonalOffers.unshift(offer);
        }),

        updateSeasonalOffer: (id, updates) => set((state) => {
          const index = state.seasonalOffers.findIndex(offer => offer.id === id);
          if (index !== -1) {
            Object.assign(state.seasonalOffers[index], updates);
          }
        }),

        deleteSeasonalOffer: (id) => set((state) => {
          state.seasonalOffers = state.seasonalOffers.filter(offer => offer.id !== id);
        }),

        getSeasonalOffersByDate: (date) => {
          return get().seasonalOffers.filter(offer => {
            const start = new Date(offer.startDate);
            const end = new Date(offer.endDate);
            return date >= start && date <= end;
          });
        },

        getUpcomingSeasons: () => {
          // Implementation for upcoming seasonal opportunities
          return [];
        },

        // Flash sales
        addFlashSale: (flashSale) => set((state) => {
          state.flashSales.unshift(flashSale);
        }),

        updateFlashSale: (id, updates) => set((state) => {
          const index = state.flashSales.findIndex(sale => sale.id === id);
          if (index !== -1) {
            Object.assign(state.flashSales[index], updates);
          }
        }),

        deleteFlashSale: (id) => set((state) => {
          state.flashSales = state.flashSales.filter(sale => sale.id !== id);
        }),

        getActiveFlashSales: () => {
          const now = new Date();
          return get().flashSales.filter(sale => 
            sale.status === OfferStatus.ACTIVE &&
            new Date(sale.startTime) <= now &&
            new Date(sale.endTime) >= now
          );
        },

        getEndingSoonFlashSales: () => {
          const now = new Date();
          const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          
          return get().flashSales.filter(sale => 
            sale.status === OfferStatus.ACTIVE &&
            new Date(sale.endTime) <= twoHoursFromNow &&
            new Date(sale.endTime) >= now
          );
        },

        // Pricing strategies
        addPricingStrategy: (strategy) => set((state) => {
          state.pricingStrategies.unshift(strategy);
        }),

        updatePricingStrategy: (id, updates) => set((state) => {
          const index = state.pricingStrategies.findIndex(strategy => strategy.id === id);
          if (index !== -1) {
            Object.assign(state.pricingStrategies[index], updates);
          }
        }),

        deletePricingStrategy: (id) => set((state) => {
          state.pricingStrategies = state.pricingStrategies.filter(strategy => strategy.id !== id);
        }),

        getActivePricingStrategies: () => {
          return get().pricingStrategies.filter(strategy => strategy.isActive);
        },

        // Loading and error states
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Analytics
        getOfferPerformance: (id) => {
          const offer = get().offers.find(o => o.id === id);
          return offer?.performance || null;
        },

        getTopPerformingOffers: (limit = 5) => {
          return get().offers
            .filter(offer => offer.performance?.revenue > 0)
            .sort((a, b) => (b.performance?.revenue || 0) - (a.performance?.revenue || 0))
            .slice(0, limit);
        },

        getOffersByRevenue: () => {
          return get().offers
            .filter(offer => offer.performance?.revenue > 0)
            .sort((a, b) => (b.performance?.revenue || 0) - (a.performance?.revenue || 0));
        },

        getConversionRates: () => {
          const rates: Record<string, number> = {};
          get().offers.forEach(offer => {
            if (offer.performance) {
              rates[offer.id] = offer.performance.conversionRate;
            }
          });
          return rates;
        },
      })),
      {
        name: 'offer-store',
        partialize: (state) => ({
          filters: state.filters,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          view: state.view,
          limit: state.limit,
        }),
      }
    ),
    { name: 'offer-store' }
  )
);

// Selectors for optimized re-renders
export const useOfferSelectors = {
  offers: () => useOfferStore(state => state.offers),
  activeOffers: () => useOfferStore(state => state.activeOffers),
  filteredOffers: () => useOfferStore(state => state.filteredOffers),
  selectedOffers: () => useOfferStore(state => 
    state.offers.filter(offer => state.selectedOfferIds.has(offer.id))
  ),
  offerById: (id: string) => useOfferStore(state => 
    state.offers.find(offer => offer.id === id)
  ),
  isOfferSelected: (id: string) => useOfferStore(state => 
    state.selectedOfferIds.has(id)
  ),
  offerCount: () => useOfferStore(state => state.offers.length),
  selectedCount: () => useOfferStore(state => state.selectedCount),
  isLoading: () => useOfferStore(state => state.isLoading),
  error: () => useOfferStore(state => state.error),
  filters: () => useOfferStore(state => state.filters),
  searchQuery: () => useOfferStore(state => state.searchQuery),
  view: () => useOfferStore(state => state.view),
  pagination: () => useOfferStore(state => ({
    page: state.page,
    limit: state.limit,
    total: state.total,
  })),
};
