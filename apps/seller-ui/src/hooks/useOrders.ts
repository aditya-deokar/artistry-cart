'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axiosinstance';
import { Order, OrderListResponse, OrderStatus } from '@/types/order';

interface OrdersParams {
    page?: number;
    limit?: number;
    status?: string;
}

// Get seller orders
export const useSellerOrders = (params?: OrdersParams) => {
    return useQuery<OrderListResponse, Error>({
        queryKey: ['seller-orders', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/order/api/seller/orders', { params });
            return data;
        },
        staleTime: 60 * 1000, // 1 minute
    });
};

// Get order details
export const useOrderDetails = (orderId: string) => {
    return useQuery<Order, Error>({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/order/api/seller/orders/${orderId}`);
            return data.order;
        },
        enabled: !!orderId,
    });
};

// Update order status
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<Order, Error, { orderId: string; status: OrderStatus; deliveryStatus?: string }>({
        mutationFn: async ({ orderId, status, deliveryStatus }) => {
            const { data } = await axiosInstance.put(`/order/api/seller/orders/${orderId}/status`, {
                status,
                deliveryStatus,
            });
            return data.order;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', data.id] });
            toast.success('Order status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update order status');
        },
    });
};
