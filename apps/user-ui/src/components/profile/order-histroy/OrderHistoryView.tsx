'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { OrderItemCard } from './OrderItemCard';
import { motion } from 'framer-motion';
import { LoaderCircle, Package, ShoppingBag } from 'lucide-react';

export const OrderHistoryView = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['userOrders'],
        queryFn: async () => {
            const res = await axiosInstance.get('/auth/api/me/orders');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle
                        size={40}
                        className="animate-spin text-[var(--ac-gold)]"
                    />
                    <p className="text-[var(--ac-stone)] dark:text-[var(--ac-silver)] text-sm tracking-wide">
                        Loading your orders...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ac-error)]/10 flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                        Unable to Load Orders
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm">
                        We couldn&apos;t fetch your order history. Please try refreshing the page.
                    </p>
                </div>
            </div>
        );
    }

    const orders = data?.orders || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
        >
            {/* Section Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-px bg-[var(--ac-gold)]" />
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] font-medium">
                        Purchase History
                    </p>
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                    Order History
                </h2>
                <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mt-2">
                    Review your past purchases and track their status.
                </p>
            </div>

            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order: any, index: number) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                        >
                            <OrderItemCard order={order} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                    <div className="w-20 h-20 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center mb-6">
                        <ShoppingBag size={32} className="text-[var(--ac-stone)]" />
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                        No Orders Yet
                    </h3>
                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-center max-w-sm">
                        You haven&apos;t placed any orders yet. Start exploring our collection of handcrafted artisan pieces.
                    </p>
                </div>
            )}
        </motion.div>
    );
};