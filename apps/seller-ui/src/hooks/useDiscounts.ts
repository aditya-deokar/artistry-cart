'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosinstance';
import { DiscountCode, CreateDiscountData, PaginationData } from '@/types';

export interface DiscountsResponse {
  discountCodes: DiscountCode[];
  pagination: PaginationData;
  analytics?: {
    totalUsage: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

export interface DiscountsParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'expired' | 'scheduled' | 'all';
  discount_type?: string;
  search?: string;
  date_range?: { from: Date; to: Date };
  sort_by?: 'newest' | 'usage' | 'value' | 'expiry';
  include_analytics?: boolean;
}

// Get seller discount codes with enhanced filtering
export const useSellerDiscounts = (params?: DiscountsParams) => {
  const formattedParams = params ? {
    ...params,
    start_date: params.date_range?.from ? format(params.date_range.from, 'yyyy-MM-dd') : undefined,
    end_date: params.date_range?.to ? format(params.date_range.to, 'yyyy-MM-dd') : undefined,
    date_range: undefined, // Remove the original date_range object
  } : {};

  return useQuery<DiscountsResponse, Error>({
    queryKey: ['discounts', 'seller', formattedParams],
    queryFn: async (): Promise<DiscountsResponse> => {
      const { data } = await axiosInstance.get('/product/api/discounts/seller', { 
        params: formattedParams 
      });
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single discount details
export const useDiscountDetails = (discountId: string) => {
  return useQuery<DiscountCode, Error>({
    queryKey: ['discounts', discountId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/product/api/discounts/${discountId}`);
      return data.data;
    },
    enabled: !!discountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create discount code with optimistic updates
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DiscountCode, Error, CreateDiscountData>({
    mutationFn: async (discountData: CreateDiscountData): Promise<DiscountCode> => {
      const { data } = await axiosInstance.post('/product/api/discounts/create', discountData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
      toast.success('Discount code created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create discount code');
    },
  });
};

// Update discount code with optimistic updates
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DiscountCode, Error, { discountId: string; data: Partial<CreateDiscountData> }>({
    mutationFn: async ({ discountId, data }): Promise<DiscountCode> => {
      const response = await axiosInstance.put(`/product/api/discounts/update/${discountId}`, data);
      return response.data.data;
    },
    onMutate: async ({ discountId, data }) => {
      // Cancel outgoing refetches to avoid optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: ['discounts', discountId] });
      
      // Keep previous discount data to roll back in case of failure
      const previousDiscount = queryClient.getQueryData<DiscountCode>(['discounts', discountId]);
      
      // Optimistically update the discount data if available
      if (previousDiscount) {
        queryClient.setQueryData(['discounts', discountId], {
          ...previousDiscount,
          ...data,
        });
      }
      
      return { previousDiscount };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
      queryClient.invalidateQueries({ queryKey: ['discounts', variables.discountId] });
      toast.success('Discount code updated successfully');
    },
    onError: (error: any, variables, context: any) => {
      // Roll back to previous state on error
      if (context?.previousDiscount) {
        queryClient.setQueryData(['discounts', variables.discountId], context.previousDiscount);
      }
      toast.error(error.response?.data?.message || 'Failed to update discount code');
    },
  });
};

// Delete discount code with confirmation handling
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (discountId: string): Promise<void> => {
      await axiosInstance.delete(`/product/api/discounts/delete/${discountId}`);
    },
    onMutate: async (discountId) => {
      // Cancel outgoing refetches to avoid optimistic update being overwritten
      await queryClient.cancelQueries({ queryKey: ['discounts', 'seller'] });
      
      // Keep previous discounts data to roll back in case of failure
      const previousDiscounts = queryClient.getQueryData<DiscountsResponse>(['discounts', 'seller']);
      
      // Optimistically update the discounts list if available
      if (previousDiscounts?.discountCodes) {
        queryClient.setQueryData(['discounts', 'seller'], {
          ...previousDiscounts,
          discountCodes: previousDiscounts.discountCodes.filter(code => code.id !== discountId),
        });
      }
      
      return { previousDiscounts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
      toast.success('Discount code deleted successfully');
    },
    onError: (error: any, _, context: any) => {
      // Roll back to previous state on error
      if (context?.previousDiscounts) {
        queryClient.setQueryData(['discounts', 'seller'], context.previousDiscounts);
      }
      toast.error(error.response?.data?.message || 'Failed to delete discount code');
    },
  });
};

// Validate discount code with improved error handling
export const useValidateDiscount = () => {
  return useMutation<
    { valid: boolean; discount: number; message: string },
    Error,
    { discountCode: string; cartItems: any[]; shopId: string }
  >({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/product/api/discounts/validate', data);
      return response.data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to validate coupon code');
    },
  });
};

// Toggle discount active state
export const useToggleDiscountActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation<DiscountCode, Error, { discountId: string; isActive: boolean }>({
    mutationFn: async ({ discountId, isActive }) => {
      const { data } = await axiosInstance.patch(`/product/api/discounts/${discountId}/toggle-active`, { 
        isActive 
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts', 'seller'] });
      queryClient.invalidateQueries({ queryKey: ['discounts', variables.discountId] });
      toast.success(`Discount code ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update discount status');
    },
  });
};

// Get discount usage analytics
export const useDiscountAnalytics = (discountId: string, dateRange?: { from: Date; to: Date }) => {
  return useQuery<{
    usageTimeline: { date: string; count: number; revenue: number }[];
    topProducts: { id: string; title: string; count: number }[];
    performance: { usage: number; revenue: number; averageOrder: number };
  }, Error>({
    queryKey: ['discounts', discountId, 'analytics', dateRange],
    queryFn: async () => {
      const params = dateRange ? {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
      } : {};
      
      const { data } = await axiosInstance.get(`/product/api/discounts/${discountId}/analytics`, { 
        params 
      });
      return data.data;
    },
    enabled: !!discountId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
