// store/products/productStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Product, ProductFilters } from '@/types/product';

interface ProductStore {
  // State
  products: Product[];
  selectedProducts: string[];
  searchQuery: string;
  filters: ProductFilters;
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  view: 'table' | 'grid';

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setSelectedProducts: (ids: string[]) => void;
  toggleProductSelection: (id: string) => void;
  selectAllProducts: () => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setView: (view: 'table' | 'grid') => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;

  // Computed
  selectedCount: number;
  hasSelection: boolean;
  filteredProducts: Product[];
}

export const useProductStore = create<ProductStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: [],
        selectedProducts: [],
        searchQuery: '',
        filters: {
          category: '',
          status: '',
          priceRange: [0, 10000],
          inStock: false,
          onSale: false,
        },
        page: 1,
        limit: 20,
        total: 0,
        isLoading: false,
        view: 'table',

        // Actions
        setProducts: (products) => set({ products }),

        addProduct: (product) =>
          set((state) => ({
            products: [product, ...state.products],
            total: state.total + 1,
          })),

        updateProduct: (id, updates) =>
          set((state) => ({
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...updates } : product
            ),
          })),

        removeProduct: (id) =>
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            selectedProducts: state.selectedProducts.filter((pid) => pid !== id),
            total: Math.max(0, state.total - 1),
          })),

        setSelectedProducts: (ids) => set({ selectedProducts: ids }),

        toggleProductSelection: (id) =>
          set((state) => ({
            selectedProducts: state.selectedProducts.includes(id)
              ? state.selectedProducts.filter((pid) => pid !== id)
              : [...state.selectedProducts, id],
          })),

        selectAllProducts: () =>
          set((state) => ({
            selectedProducts: state.products.map((product) => product.id),
          })),

        clearSelection: () => set({ selectedProducts: [] }),

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
              category: '',
              status: '',
              priceRange: [0, 10000],
              inStock: false,
              onSale: false,
            },
            searchQuery: '',
            page: 1,
          }),

        setLoading: (isLoading) => set({ isLoading }),

        // Computed
        get selectedCount() {
          return get().selectedProducts.length;
        },

        get hasSelection() {
          return get().selectedProducts.length > 0;
        },

        get filteredProducts() {
          const { products, searchQuery, filters } = get();
          return products.filter((product) => {
            // Search filter
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              if (
                !product.title.toLowerCase().includes(query) &&
                !product.description.toLowerCase().includes(query) &&
                !product.category.toLowerCase().includes(query) &&
                !product.tags.some((tag) => tag.toLowerCase().includes(query))
              ) {
                return false;
              }
            }

            // Category filter
            if (filters.category && product.category !== filters.category) {
              return false;
            }

            // Status filter
            if (filters.status && product.status !== filters.status) {
              return false;
            }

            // Price range filter
            if (
              filters.priceRange &&
              (product.current_price < filters.priceRange[0] ||
                product.current_price > filters.priceRange[1])
            ) {
              return false;
            }

            // Stock filter
            if (filters.inStock && product.stock === 0) {
              return false;
            }

            // Sale filter
            if (filters.onSale && !product.is_on_discount) {
              return false;
            }

            return true;
          });
        },
      }),
      {
        name: 'product-store',
        partialize: (state) => ({
          view: state.view,
          filters: state.filters,
          limit: state.limit,
        }),
      }
    ),
    { name: 'product-store' }
  )
);
