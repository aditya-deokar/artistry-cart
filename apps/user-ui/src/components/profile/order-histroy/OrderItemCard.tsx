import React from 'react';
import { formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const OrderItemCard = ({ order }: { order: any }) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString();

    return (
        <div className="p-4 border border-neutral-800 rounded-lg flex justify-between items-center">
            <div>
                <p className="font-semibold">Order #{order.id.slice(-6)}</p>
                <p className="text-sm text-primary/70">Date: {orderDate}</p>
                <p className="text-sm text-primary/70">Total: {formatPrice(order.totalAmount)}</p>
            </div>
            <div className="text-right">
                <Badge>{order.status}</Badge>
                <Button variant="outline" size="sm" className="mt-2">View Details</Button>
            </div>
        </div>
    );
};