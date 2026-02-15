'use client';

import { useParams } from 'next/navigation';
import { useOrderDetails } from '@/hooks/useOrders';
import OrderDetails from '@/components/dashboard/orders/OrderDetails';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderId as string;

    const { data: order, isLoading, error } = useOrderDetails(orderId);

    if (isLoading) return <LoadingState />;
    if (error) return <div className="p-8 text-red-500">Error loading order details.</div>;
    if (!order) return <div className="p-8">Order not found.</div>;

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderDetails order={order} />
            </div>
        </div>
    );
}
