'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ordersApi } from '@/lib/api/orders';
import { formatPrice } from '@/lib/formatters';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Icons
import {
    ArrowLeft,
    Package,
    CreditCard,
    MapPin,
    Calendar,
    Truck,
    CheckCircle,
    Clock,
    X,
    RotateCcw,
    LoaderCircle,
    Receipt,
    Store,
} from 'lucide-react';

// Status styles
const getStatusStyles = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
        case 'delivered':
        case 'completed':
            return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
        case 'paid':
            return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
        case 'processing':
            return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
        case 'shipped':
            return { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
        case 'cancelled':
        case 'failed':
            return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
        case 'refunded':
            return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' };
        default:
            return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
    }
};

// Order Timeline Component
const OrderTimeline = ({ order }: { order: any }) => {
    const steps = [
        { key: 'placed', label: 'Order Placed', icon: Package, completed: true },
        { key: 'paid', label: 'Payment Confirmed', icon: CreditCard, completed: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'processing', label: 'Processing', icon: Clock, completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'shipped', label: 'Shipped', icon: Truck, completed: ['SHIPPED', 'DELIVERED'].includes(order.status?.toUpperCase()) },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle, completed: order.status?.toUpperCase() === 'DELIVERED' },
    ];

    return (
        <div className="relative">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                            }`}>
                            <step.icon size={18} />
                        </div>
                        <span className={`text-xs mt-2 text-center ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                        width: `${(steps.filter(s => s.completed).length - 1) / (steps.length - 1) * 100}%`
                    }}
                />
            </div>
        </div>
    );
};

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const orderId = params.orderId as string;
    const [isLoading, setIsLoading] = React.useState(false);

    const { data, isLoading: isLoadingOrder, isError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await ordersApi.getOrderById(orderId);
            return res.data.order;
        },
        enabled: !!orderId,
    });

    const order = data;

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setIsLoading(true);
        try {
            await ordersApi.cancelOrder(orderId, 'Cancelled by customer');
            toast.success('Order cancelled successfully');
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['userOrders'] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to cancel order');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestRefund = async () => {
        const reason = prompt('Please provide a reason for your refund request:');
        if (!reason) return;

        setIsLoading(true);
        try {
            await ordersApi.requestRefund({ orderId, reason });
            toast.success('Refund request submitted');
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['userOrders'] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to request refund');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingOrder) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Package className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Order Not Found</h2>
                <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
                <Button asChild variant="outline">
                    <Link href="/profile/orders">Back to Orders</Link>
                </Button>
            </div>
        );
    }

    const statusStyles = getStatusStyles(order.status);
    const canCancel = ['PENDING', 'PAID'].includes(order.status?.toUpperCase());
    const canRefund = order.status?.toUpperCase() === 'DELIVERED';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-semibold">
                            Order #{order.id?.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={`${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} border px-4 py-1.5`}>
                        {order.status?.replace(/_/g, ' ')}
                    </Badge>
                    {canCancel && (
                        <Button variant="destructive" size="sm" onClick={handleCancelOrder} disabled={isLoading}>
                            <X size={16} className="mr-1" /> Cancel
                        </Button>
                    )}
                    {canRefund && (
                        <Button variant="outline" size="sm" onClick={handleRequestRefund} disabled={isLoading}>
                            <RotateCcw size={16} className="mr-1" /> Refund
                        </Button>
                    )}
                </div>
            </div>

            {/* Order Timeline */}
            {!['CANCELLED', 'REFUNDED', 'FAILED'].includes(order.status?.toUpperCase()) && (
                <div className="p-6 rounded-xl border bg-card">
                    <h3 className="font-semibold mb-6">Order Progress</h3>
                    <OrderTimeline order={order} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Package size={18} /> Order Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-muted/30">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {item.product?.images?.[0]?.url ? (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.product.title || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <Link href={`/product/${item.productId}`} className="font-medium hover:underline">
                                            {item.product?.title || 'Product'}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        <p className="font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shop Info */}
                    {order.shop && (
                        <div className="p-6 rounded-xl border bg-card">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Store size={18} /> Sold By
                            </h3>
                            <Link href={`/shops/${order.shop.slug || order.shopId}`} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Store size={20} className="text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">{order.shop.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.shop.category}</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Receipt size={18} /> Payment Summary
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(order.totalAmount * 0.9)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatPrice(50)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (5%)</span>
                                <span>{formatPrice(order.totalAmount * 0.05)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>

                        {order.payment && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm">
                                    <CreditCard size={16} className="text-muted-foreground" />
                                    <span className="text-muted-foreground">Paid via</span>
                                    <span className="capitalize">{order.payment.paymentMethod || 'Card'}</span>
                                </div>
                                <Badge className="mt-2" variant="outline">
                                    {order.payment.status}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="p-6 rounded-xl border bg-card">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <MapPin size={18} /> Shipping Address
                            </h3>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
                                {order.shippingAddress.addressLine2 && (
                                    <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                                )}
                                <p className="text-muted-foreground">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                </p>
                                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    )}

                    {/* Need Help */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-semibold mb-2">Need Help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            If you have any questions about your order, we're here to help.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/support">Contact Support</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
