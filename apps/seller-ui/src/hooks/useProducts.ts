'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';

export const useSellerProducts = (params?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['seller-products', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/product/api/events/seller-products', { params });
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
