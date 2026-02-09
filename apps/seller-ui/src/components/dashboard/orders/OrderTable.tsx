'use client';

import { useState } from 'react';
import { useSellerOrders } from '@/hooks/useOrders';
import { DataTable } from '@/components/dashboard/shared/DataTable';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { EmptyState } from '@/components/dashboard/shared/EmptyState';
import { columns } from './OrderColumns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrderTable() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState<string>('all');

    const { data, isLoading, error } = useSellerOrders({
        page,
        limit,
        status: status === 'all' ? undefined : status,
    });

    const onPaginationChange = (newPage: number, newLimit: number) => {
        setPage(newPage);
        setLimit(newLimit);
    };

    if (isLoading) return <LoadingState />;
    if (error) return <div className="p-4 text-red-500">Error loading orders. Please try again later.</div>;

    return (
        <Card>
            <CardHeader className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Manage and fulfill your store orders.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs defaultValue="all" onValueChange={setStatus}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="processing">Processing</TabsTrigger>
                        <TabsTrigger value="shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>

                    <TabsContent value={status} className="mt-0">
                        {!data?.orders?.length ? (
                            <EmptyState
                                title="No orders found"
                                description={status !== 'all' ? `No ${status} orders found.` : "You haven't received any orders yet."}
                            />
                        ) : (
                            <DataTable
                                columns={columns}
                                data={data.orders}
                                searchKey="user.name"
                                searchPlaceholder="Filter customers..."
                                pagination={{
                                    page: data.page,
                                    limit: limit, // Backend might return limit, but we use state
                                    total: data.total,
                                    pages: data.totalPages,
                                }}
                                onPaginationChange={onPaginationChange}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
