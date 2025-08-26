import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/formatters';
import Image from 'next/image';

// Assuming full order data with items and product details
interface OrderData {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    shippingAddress: { addressLine1: string, city: string };
    items: {
        id: string;
        quantity: number;
        price: number;
        product: { title: string, images: { url: string }[] };
    }[];
}

type OrderDetailsModalProps = {
    order: OrderData | null;
    isOpen: boolean;
    onClose: () => void;
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <p className="text-sm text-primary/70">Order #{order.id.slice(-6)} &bull; Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Items List */}
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-md bg-neutral-800 flex-shrink-0">
                                    <Image src={item.product.images[0].url} alt={item.product.title} fill className="object-cover rounded-md" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.product.title}</p>
                                    <p className="text-sm text-primary/70">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    {/* Summary */}
                    <div className="pt-4 border-t border-neutral-800 text-right">
                        <p className="font-bold text-lg">Total: {formatPrice(order.totalAmount)}</p>
                    </div>
                    {/* Shipping Info */}
                </div>
            </DialogContent>
        </Dialog>
    );
};