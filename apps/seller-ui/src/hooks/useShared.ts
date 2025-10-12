'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';

// Custom hook for managing pagination
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  
  const nextPage = useCallback(() => setPage(prev => prev + 1), []);
  const prevPage = useCallback(() => setPage(prev => Math.max(1, prev - 1)), []);
  const goToPage = useCallback((pageNum: number) => setPage(pageNum), []);
  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
  }, []);
  
  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    paginationParams: { page, limit },
  };
}

// Custom hook for handling search with debounce
export function useSearch(initialSearch = '', debounceMs = 500) {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    
    // Clear the previous timeout
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [debounceMs]);
  
  return {
    search,
    debouncedSearch,
    setSearch: handleSearch,
    resetSearch: () => {
      setSearch('');
      setDebouncedSearch('');
    },
  };
}

// Custom hook for fetching dashboard analytics
export function useDashboardAnalytics(dateRange?: { from: Date; to: Date }) {
  return useQuery<{
    revenue: { total: number; change: number };
    orders: { total: number; change: number };
    products: { total: number; change: number };
    customers: { total: number; change: number };
    revenueChart: { date: string; amount: number }[];
    topProducts: { id: string; title: string; sales: number; revenue: number }[];
    recentOrders: any[];
  }>({
    queryKey: ['dashboard-analytics', dateRange],
    queryFn: async () => {
      const params = dateRange ? {
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
      } : {};
      
      const { data } = await axiosInstance.get('/product/api/dashboard/analytics', { params });
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for handling form submission with loading state
export function useFormSubmit<T>(onSubmit: (data: T) => Promise<any>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await onSubmit(data);
      setIsSubmitting(false);
      return result;
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      throw err;
    }
  }, [onSubmit]);
  
  return {
    isSubmitting,
    error,
    handleSubmit,
    clearError: () => setError(null),
  };
}