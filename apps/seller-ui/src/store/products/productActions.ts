// store/products/productActions.ts
import { useProductStore } from './productStore';
import { Product, ProductFormData, BulkUpdateData } from './productTypes';
import { 
  getSellerProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkUpdateProducts,
  bulkDeleteProducts 
} from '@/lib/api/products';
import { toast } from 'sonner';

export const productActions = {
  // Fetch products
  async fetchProducts() {
    const { setLoading, setProducts, searchQuery, filters, page, limit } = useProductStore.getState();
    
    try {
      setLoading(true);
      const response = await getSellerProducts({
        search: searchQuery,
        ...filters,
        page,
        limit
      });
      
      setProducts(response.products);
      return response;
    } catch (error) {
      toast.error('Failed to fetch products');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Create product
  async createProduct(data: ProductFormData) {
    const { addProduct, setLoading } = useProductStore.getState();
    
    try {
      setLoading(true);
      const product = await createProduct(data);
      addProduct(product);
      toast.success('Product created successfully');
      return product;
    } catch (error) {
      toast.error('Failed to create product');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Update product
  async updateProduct(id: string, data: ProductFormData) {
    const { updateProduct: updateInStore, setLoading } = useProductStore.getState();
    
    try {
      setLoading(true);
      const product = await updateProduct(id, data);
      updateInStore(id, product);
      toast.success('Product updated successfully');
      return product;
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Delete product
  async deleteProduct(id: string) {
    const { removeProduct, setLoading } = useProductStore.getState();
    
    try {
      setLoading(true);
      await deleteProduct(id);
      removeProduct(id);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Bulk operations
  async bulkUpdateProducts(data: BulkUpdateData) {
    const { setLoading, selectedProducts, clearSelection } = useProductStore.getState();
    
    try {
      setLoading(true);
      await bulkUpdateProducts(data.ids, data.updates);
      
      // Update products in store
      data.ids.forEach(id => {
        useProductStore.getState().updateProduct(id, data.updates);
      });
      
      clearSelection();
      toast.success(`${data.ids.length} products updated successfully`);
    } catch (error) {
      toast.error('Failed to update products');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  async bulkDeleteProducts() {
    const { setLoading, selectedProducts, clearSelection } = useProductStore.getState();
    
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    
    try {
      setLoading(true);
      await bulkDeleteProducts(selectedProducts);
      
      // Remove products from store
      selectedProducts.forEach(id => {
        useProductStore.getState().removeProduct(id);
      });
      
      clearSelection();
      toast.success(`${selectedProducts.length} products deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete products');
      throw error;
    } finally {
      setLoading(false);
    }
  },

  // Selection actions
  selectAll() {
    useProductStore.getState().selectAllProducts();
    toast.info('All products selected');
  },

  clearSelection() {
    useProductStore.getState().clearSelection();
    toast.info('Selection cleared');
  },

  // Filter actions
  applyFilters(filters: any) {
    const { setFilters } = useProductStore.getState();
    setFilters(filters);
    this.fetchProducts();
  },

  clearFilters() {
    useProductStore.getState().clearFilters();
    this.fetchProducts();
    toast.info('Filters cleared');
  },

  // Search actions
  search(query: string) {
    const { setSearchQuery } = useProductStore.getState();
    setSearchQuery(query);
    
    // Debounce search
    setTimeout(() => {
      if (useProductStore.getState().searchQuery === query) {
        this.fetchProducts();
      }
    }, 300);
  },

  // Pagination actions
  changePage(page: number) {
    const { setPage } = useProductStore.getState();
    setPage(page);
    this.fetchProducts();
  },

  changeLimit(limit: number) {
    const { setLimit } = useProductStore.getState();
    setLimit(limit);
    this.fetchProducts();
  },

  // View actions
  toggleView() {
    const { view, setView } = useProductStore.getState();
    setView(view === 'table' ? 'grid' : 'table');
  },
};

// Export actions for use in components
export const useProductActions = () => productActions;
