'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Loader2, Package, Sparkles, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/utils/axiosinstance';
import confetti from 'canvas-confetti';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    items: {
        id: string;
        product: {
            title: string;
            images: { url: string }[];
        };
        quantity: number;
        price: number;
    }[];
}

function OrderConfirmationContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get payment_intent from URL if redirected from Stripe
    const paymentIntentId = searchParams.get('payment_intent');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (paymentIntentId) {
                    const res = await axiosInstance.get(`/order/api/payment-status?payment_intent=${paymentIntentId}`);
                    if (res.data.order) {
                        setOrder(res.data.order);
                        triggerConfetti(); // Trigger confetti on success
                    } else {
                        // If order is not found yet, show generic success but still celebrate
                        triggerConfetti();
                    }
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Could not retrieve order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [paymentIntentId]);

    const triggerConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-medium">Verifying your order...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background/50">
            <div className="container max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-4">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                        <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Order Confirmed!</h1>
                    <div className="text-muted-foreground text-lg max-w-md mx-auto space-y-2">
                        <p>Thank you for your purchase. Your order has been received and is being processed.</p>
                        {order && <p className="font-medium text-foreground text-sm bg-muted/50 p-2 rounded-md inline-block">Order ID: {order.id}</p>}
                    </div>
                </div>

                <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Order Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                <Sparkles className="h-4 w-4" />
                                <span>Payment Successful</span>
                            </div>
                        </div>

                        {order && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                                    <Receipt className="h-4 w-4" />
                                    <span>Order Summary</span>
                                </div>
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="h-16 w-16 bg-muted rounded-md border overflow-hidden relative flex-shrink-0">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Package className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm line-clamp-1">{item.product.title}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="font-medium text-sm">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total</span>
                                        <span>${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t mt-6">
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto shadow-sm rounded-full px-8">
                                <Link href="/profile/orders">
                                    View My Orders
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all rounded-full px-8">
                                <Link href="/">Continue Shopping</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-medium">Loading your order...</h2>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
