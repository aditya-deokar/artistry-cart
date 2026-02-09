'use client';

import { Order, OrderStatus } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, CheckCircle, Package, Calendar, Clock, MapPin, User, Mail, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/format-currency';

interface OrderDetailsProps {
    order: Order & { shippingAddress?: any }; // Extend type locally for now
}

export default function OrderDetails({ order }: OrderDetailsProps) {
    const updateStatus = useUpdateOrderStatus();
    const [status, setStatus] = useState<OrderStatus>(order.status);

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus as OrderStatus);
        updateStatus.mutate({
            orderId: order.id,
            status: newStatus as OrderStatus
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Order #{order.id.slice(-8)}</h2>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={status} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 py-4 border-b last:border-0">
                                        <div className="relative h-16 w-16 rounded overflow-hidden bg-muted">
                                            {item.product.images?.[0]?.url && (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{item.product.title}</h4>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm">{formatCurrency(item.price)}</p>
                                            <p className="text-xs text-muted-foreground">Total: {formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                    {/* Note: totalAmount usually includes shipping/tax, simplified here */}
                                </div>
                                <div className="flex justify-between font-medium text-base pt-2">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Payment Status</p>
                                    <Badge variant={order.paymentStatus === 'SUCCEEDED' ? 'default' : 'secondary'} className="mt-1">
                                        {order.paymentStatus}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Payment Method</p>
                                    <p className="font-medium mt-1 uppercase">{order.payment?.method || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="font-medium">{order.user.name}</p>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    <a href={`mailto:${order.user.email}`} className="hover:underline">{order.user.email}</a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            {order.shippingAddress ? (
                                <div className="space-y-1 text-muted-foreground">
                                    <p className="font-medium text-foreground">{order.user.name}</p> {/* Usually address has name, fallback to user name */}
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No shipping address provided.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
