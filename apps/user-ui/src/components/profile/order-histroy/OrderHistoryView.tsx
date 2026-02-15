'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { OrderItemCard } from './OrderItemCard';
import { motion } from 'framer-motion';
import { LoaderCircle, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const ORDER_STATUSES = [
    { value: '', label: 'All Orders' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REFUNDED', label: 'Refunded' },
];

export const OrderHistoryView = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['userOrders', statusFilter, page],
        queryFn: async () => {
            const res = await ordersApi.getOrders({
                page,
                limit,
                status: statusFilter || undefined
            });
            return res.data;
        },
    });

    const orders = data?.orders || [];
    const totalPages = data?.totalPages || 1;
    const total = data?.total || 0;

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Section Header */}
            <div className="mb-6">
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

            {/* Status Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs value={statusFilter} onValueChange={(value: string) => { setStatusFilter(value); setPage(1); }} className="w-full sm:w-auto">
                    <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                        {ORDER_STATUSES.map((status) => (
                            <TabsTrigger
                                key={status.value}
                                value={status.value}
                                className="text-xs px-3 py-1.5 data-[state=active]:bg-background"
                            >
                                {status.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {total > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Showing {orders.length} of {total} orders
                    </p>
                )}
            </div>

            {/* Loading overlay for filtering */}
            <div className="relative">
                {isFetching && !isLoading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
                        <LoaderCircle className="h-8 w-8 animate-spin" />
                    </div>
                )}

                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: any, index: number) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
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
                            {statusFilter ? 'No Orders Found' : 'No Orders Yet'}
                        </h3>
                        <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-center max-w-sm">
                            {statusFilter
                                ? `You don't have any ${statusFilter.toLowerCase()} orders.`
                                : "You haven't placed any orders yet. Start exploring our collection of handcrafted artisan pieces."
                            }
                        </p>
                        {statusFilter && (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setStatusFilter('')}
                            >
                                View All Orders
                            </Button>
                        )}
                        {!statusFilter && (
                            <Button asChild className="mt-4">
                                <Link href="/shops">Browse Shops</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1 || isFetching}
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setPage(pageNum)}
                                    disabled={isFetching}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages || isFetching}
                    >
                        Next
                        <ChevronRight size={16} className="ml-1" />
                    </Button>
                </div>
            )}
        </motion.div>
    );
};