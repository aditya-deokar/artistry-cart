'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Package, Sparkles } from 'lucide-react'; // Added Sparkles
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

export default function OrderConfirmationPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get payment_intent_client_secret from URL if redirected from Stripe
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (paymentIntentClientSecret) {
                    const res = await axiosInstance.get(`/order/api/payment-status?payment_intent=${paymentIntentClientSecret}`);
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
    }, [paymentIntentClientSecret]);

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
                ...defaults, party: true, // Type fix if party isn't in types, otherwise just omit
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, party: true,
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
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>
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
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="h-12 w-12 bg-muted rounded-md border overflow-hidden relative">
                                            {/* Image placeholder or component */}
                                            <Package className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm line-clamp-1">{item.product.title}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-medium text-sm">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="font-medium">Total</span>
                                    <span className="text-lg font-bold">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-2">
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
