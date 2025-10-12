// store/discounts/discountStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DiscountCode, DiscountFilters } from '@/types/discount';

interface DiscountStore {
  // State
  discounts: DiscountCode[];
  selectedDiscounts: string[];
  searchQuery: string;
  filters: DiscountFilters;
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  view: 'table' | 'grid';

  // Actions
  setDiscounts: (discounts: DiscountCode[]) => void;
  addDiscount: (discount: DiscountCode) => void;
  updateDiscount: (id: string, updates: Partial<DiscountCode>) => void;
  removeDiscount: (id: string) => void;
  setSelectedDiscounts: (ids: string[]) => void;
  toggleDiscountSelection: (id: string) => void;
  selectAllDiscounts: () => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<DiscountFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setView: (view: 'table' | 'grid') => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;

  // Computed
  selectedCount: number;
  hasSelection: boolean;
  activeDiscounts: DiscountCode[];
  expiredDiscounts: DiscountCode[];
  inactiveDiscounts: DiscountCode[];
}

export const useDiscountStore = create<DiscountStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        discounts: [],
        selectedDiscounts: [],
        searchQuery: '',
        filters: {
          discountType: '',
          status: '',
          dateRange: null,
        },
        page: 1,
        limit: 20,
        total: 0,
        isLoading: false,
        view: 'grid',

        // Actions
        setDiscounts: (discounts) => set({ discounts }),

        addDiscount: (discount) =>
          set((state) => ({
            discounts: [discount, ...state.discounts],
            total: state.total + 1,
          })),

        updateDiscount: (id, updates) =>
          set((state) => ({
            discounts: state.discounts.map((discount) =>
              discount.id === id ? { ...discount, ...updates } : discount
            ),
          })),

        removeDiscount: (id) =>
          set((state) => ({
            discounts: state.discounts.filter((discount) => discount.id !== id),
            selectedDiscounts: state.selectedDiscounts.filter((did) => did !== id),
            total: Math.max(0, state.total - 1),
          })),

        setSelectedDiscounts: (ids) => set({ selectedDiscounts: ids }),

        toggleDiscountSelection: (id) =>
          set((state) => ({
            selectedDiscounts: state.selectedDiscounts.includes(id)
              ? state.selectedDiscounts.filter((did) => did !== id)
              : [...state.selectedDiscounts, id],
          })),

        selectAllDiscounts: () =>
          set((state) => ({
            selectedDiscounts: state.discounts.map((discount) => discount.id),
          })),

        clearSelection: () => set({ selectedDiscounts: [] }),

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
              discountType: '',
              status: '',
              dateRange: null,
            },
            searchQuery: '',
            page: 1,
          }),

        setLoading: (isLoading) => set({ isLoading }),

        // Computed
        get selectedCount() {
          return get().selectedDiscounts.length;
        },

        get hasSelection() {
          return get().selectedDiscounts.length > 0;
        },

        get activeDiscounts() {
          const now = new Date();
          return get().discounts.filter(discount => 
            discount.isActive && 
            (!discount.validUntil || new Date(discount.validUntil) > now)
          );
        },

        get expiredDiscounts() {
          const now = new Date();
          return get().discounts.filter(discount => 
            discount.validUntil && new Date(discount.validUntil) < now
          );
        },

        get inactiveDiscounts() {
          return get().discounts.filter(discount => !discount.isActive);
        },
      }),
      {
        name: 'discount-store',
        partialize: (state) => ({
          view: state.view,
          filters: state.filters,
          limit: state.limit,
        }),
      }
    ),
    { name: 'discount-store' }
  )
);
