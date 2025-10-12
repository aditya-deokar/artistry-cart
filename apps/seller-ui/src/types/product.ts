// lib/api/products.ts
import axiosInstance from '@/utils/axiosinstance';
import { Product, ProductFormData, ProductFilters } from '@/types/product';

export interface GetProductsParams extends ProductFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get seller products
export const getSellerProducts = async (params: GetProductsParams): Promise<ProductsResponse> => {
  const { data } = await axiosInstance.get('/api/seller/products', { params });
  return data.data;
};

// Get single product
export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await axiosInstance.get(`/api/product/${id}`);
  return data.data;
};

// Create product
export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const { data } = await axiosInstance.post('/api/products', productData);
  return data.data;
};

// Update product
export const updateProduct = async (id: string, productData: ProductFormData): Promise<Product> => {
  const { data } = await axiosInstance.put(`/api/products/${id}`, productData);
  return data.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/products/${id}`);
};

// Restore product
export const restoreProduct = async (id: string): Promise<Product> => {
  const { data } = await axiosInstance.put(`/api/products/${id}/restore`);
  return data.data;
};

// Bulk operations
export const bulkUpdateProducts = async (ids: string[], updates: Partial<Product>): Promise<void> => {
  await axiosInstance.put('/api/products/bulk-update', { ids, updates });
};

export const bulkDeleteProducts = async (ids: string[]): Promise<void> => {
  await axiosInstance.delete('/api/products/bulk-delete', { data: { ids } });
};

// Upload product image
export const uploadProductImage = async (file: File): Promise<{ url: string; file_id: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const { data } = await axiosInstance.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// Delete product image
export const deleteProductImage = async (fileId: string): Promise<void> => {
  await axiosInstance.delete('/api/images/delete', { data: { file_id: fileId } });
};

// Get categories
export const getCategories = async (): Promise<{ categories: string[]; subCategories: Record<string, string[]> }> => {
  const { data } = await axiosInstance.get('/api/categories');
  return data.data;
};

// Product analytics
export const getProductAnalytics = async (productId: string): Promise<any> => {
  const { data } = await axiosInstance.get(`/api/products/${productId}/analytics`);
  return data.data;
};

// Pricing history
export const getProductPricingHistory = async (productId: string): Promise<any[]> => {
  const { data } = await axiosInstance.get(`/api/offers/products/${productId}/history`);
  return data.data;
};

// Update pricing
export const updateProductPricing = async (productId: string, pricingData: any): Promise<any> => {
  const { data } = await axiosInstance.post(`/api/offers/products/${productId}/update`, pricingData);
  return data.data;
};
