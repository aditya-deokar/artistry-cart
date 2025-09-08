'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { DiscountCode, CreateDiscountData, PaginationData } from '@/types';

interface DiscountsResponse {
  discountCodes: DiscountCode[];
  pagination: PaginationData;
}

interface DiscountsParams {
  page?: number;
  limit?: number;
  status?: string;
  discount_type?: string;
  search?: string;
}

// Get seller discount codes
export const useSellerDiscounts = (params?: DiscountsParams) => {
  return useQuery({
    queryKey: ['discounts', 'seller', params],
    queryFn: async (): Promise<DiscountsResponse> => {
      const { data } = await axiosInstance.get('/product/api/discounts/seller', { params });
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create discount code
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (discountData: CreateDiscountData): Promise<DiscountCode> => {
      const { data } = await axiosInstance.post('/product/api/discounts/create', discountData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
    },
  });
};

// Update discount code
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ discountId, data }: { discountId: string; data: Partial<CreateDiscountData> }): Promise<DiscountCode> => {
      const response = await axiosInstance.put(`/product/api/discounts/update/${discountId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
    },
  });
};

// Delete discount code
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (discountId: string): Promise<void> => {
      await axiosInstance.delete(`/product/api/discounts/delete/${discountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
    },
  });
};

// Validate discount code
export const useValidateDiscount = () => {
  return useMutation({
    mutationFn: async (data: {
      discountCode: string;
      cartItems: any[];
      shopId: string;
    }) => {
      const response = await axiosInstance.post('/product/api/discounts/validate', data);
      return response.data.data;
    },
  });
};
