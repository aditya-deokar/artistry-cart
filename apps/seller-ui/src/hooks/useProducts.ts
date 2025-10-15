'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosinstance';
import { Product } from '@/types';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  status?: 'active' | 'draft' | 'out_of_stock' | 'all' | 'deleted';
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popularity' | 'rating';
  price_range?: { min?: number; max?: number };
  shop_id?: string;
}

// Get seller products with enhanced filtering options
export const useSellerProducts = (params?: ProductsParams) => {
  return useQuery<ProductsResponse, Error>({
    queryKey: ['seller-products', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/product/api/seller/products', { params });
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get product details
export const useProductDetails = (productId: string) => {
  return useQuery<Product, Error>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/api/product/${productId}`);
      // API returns { product: {...} } not { data: {...} }
      return data.product || data.data || data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update product status (active/draft)
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, { productId: string; status: string }>({
    mutationFn: async ({ productId, status }) => {
      const { data } = await axiosInstance.patch(`/product/api/products/${productId}/status`, { status });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Product status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product status');
    },
  });
};

// Update product stock
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, { productId: string; stock: number }>({
    mutationFn: async ({ productId, stock }) => {
      const { data } = await axiosInstance.patch(`/product/api/products/${productId}/stock`, { stock });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast.success('Product stock updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product stock');
    },
  });
};

// Delete product
export const useDeleteProduct = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (productId) => {
      await axiosInstance.delete(`/product/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Product deleted successfully');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });
};

// Restore deleted product
export const useRestoreProduct = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, string>({
    mutationFn: async (productId) => {
      const { data } = await axiosInstance.put(`/product/api/products/${productId}/restore`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Product restored successfully');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore product');
    },
  });
};

// Get product analytics
export const useProductAnalytics = (productId: string) => {
  return useQuery<any, Error>({
    queryKey: ['product-analytics', productId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/api/products/${productId}/analytics`);
      return data.data;
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get product categories
export const useProductCategories = () => {
  return useQuery<string[], Error>({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/product/api/categories');
      return data.data.categories;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Get seller products summary/statistics
export const useSellerProductsSummary = () => {
  return useQuery<{
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    deletedProducts: number;
  }, Error>({
    queryKey: ['seller-products-summary'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/product/api/seller/products/summary');
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
