
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosinstance';

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: {
    url: string;
    file_id: string;
  };
  shop: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: {
      url: string;
      file_id: string;
    };
    banner?: {
      url: string;
      file_id: string;
    };
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    website?: string;
    social?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      pinterest?: string;
    };
    isVerified: boolean;
    ratings: number;
    productCount: number;
    createdAt: string;
  };
  isActive: boolean;
  createdAt: string;
}

// Fetch seller profile with detailed info
const fetchSeller = async(): Promise<SellerProfile> => {
  const response = await axiosInstance.get("/auth/api/logged-in-seller");
  return response.data.seller;
};

// Main hook for seller data
const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    error,
    refetch,
    status
  } = useQuery<SellerProfile, Error>({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return { 
    seller, 
    isLoading, 
    isError,
    error,
    refetch,
    status,
    isAuthenticated: !!seller,
  };
};

// Update seller profile
export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SellerProfile, Error, Partial<SellerProfile>>({
    mutationFn: async (profileData) => {
      const { data } = await axiosInstance.put('/auth/api/seller/profile', profileData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['seller'], data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

// Update shop details
export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation<SellerProfile, Error, {
    shopData: {
      name?: string;
      description?: string;
      logo?: { url: string; file_id: string } | null;
      banner?: { url: string; file_id: string } | null;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
      website?: string;
      social?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        pinterest?: string;
      };
    }
  }>({
    mutationFn: async ({ shopData }) => {
      const { data } = await axiosInstance.put('/auth/api/seller/shop', shopData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['seller'], data);
      toast.success('Shop details updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update shop details');
    },
  });
};

export default useSeller;

