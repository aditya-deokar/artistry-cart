// lib/api/discounts.ts
import axiosInstance from '@/utils/axiosinstance';
import { DiscountCode, DiscountFormData, DiscountFilters } from '@/types/discount';

export interface GetDiscountsParams extends DiscountFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DiscountsResponse {
  discounts: DiscountCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get seller discount codes
export const getSellerDiscountCodes = async (params: GetDiscountsParams): Promise<DiscountsResponse> => {
  const { data } = await axiosInstance.get('/api/discounts/seller', { params });
  return data.data;
};

// Get single discount code
export const getDiscountById = async (id: string): Promise<DiscountCode> => {
  const { data } = await axiosInstance.get(`/api/discounts/${id}`);
  return data.data;
};

// Create discount code
export const createDiscount = async (discountData: DiscountFormData): Promise<DiscountCode> => {
  const { data } = await axiosInstance.post('/api/discounts', discountData);
  return data.data;
};

// Update discount code
export const updateDiscount = async (id: string, discountData: DiscountFormData): Promise<DiscountCode> => {
  const { data } = await axiosInstance.put(`/api/discounts/${id}`, discountData);
  return data.data;
};

// Delete discount code
export const deleteDiscount = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/discounts/${id}`);
};

// Validate discount code
export const validateDiscountCode = async (code: string): Promise<any> => {
  const { data } = await axiosInstance.post('/api/discounts/validate', { code });
  return data.data;
};

// Apply discount code
export const applyDiscountCode = async (code: string, orderData: any): Promise<any> => {
  const { data } = await axiosInstance.post('/api/discounts/apply', { code, ...orderData });
  return data.data;
};

// Get discount usage statistics
export const getDiscountUsageStats = async (discountId: string): Promise<any> => {
  const { data } = await axiosInstance.get(`/api/discounts/${discountId}/stats`);
  return data.data;
};

// Bulk create discount codes
export const bulkCreateDiscounts = async (bulkData: any): Promise<DiscountCode[]> => {
  const { data } = await axiosInstance.post('/api/discounts/bulk-create', bulkData);
  return data.data;
};

// Bulk operations
export const bulkUpdateDiscounts = async (ids: string[], updates: Partial<DiscountCode>): Promise<void> => {
  await axiosInstance.put('/api/discounts/bulk-update', { ids, updates });
};

export const bulkDeleteDiscounts = async (ids: string[]): Promise<void> => {
  await axiosInstance.delete('/api/discounts/bulk-delete', { data: { ids } });
};
