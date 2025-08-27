'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { OrderItemCard } from './OrderItemCard';

export const OrderHistoryView = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['userOrders'],
        queryFn: async () => {
            const res = await axiosInstance.get('/auth/api/me/orders');
            return res.data; // Expects { orders: [], pagination: {} }
        },
    });

    if (isLoading) return <div>Loading orders...</div>;
    if (isError) return <div>Failed to load order history.</div>;

    const orders = data?.orders || [];
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-display text-3xl">Order History</h2>
                <p className="text-primary/70">Review your past purchases and their status.</p>
            </div>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order:any ) => <OrderItemCard key={order.id} order={order} />)}
                </div>
            ) : (
                <p>You have not placed any orders yet.</p>
            )}
            {/* Pagination controls would go here */}
        </div>
    );
};