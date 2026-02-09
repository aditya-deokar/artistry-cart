'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import Link from 'next/link';
import { Bounded } from '@/components/common/Bounded';
import { Check, X, Loader2, ArrowRight, ShoppingBag, Receipt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// --- Display Components ---

const SuccessDisplay = ({ order, amount }: { order: any; amount: number }) => (
    <div className="max-w-md mx-auto w-full animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8 text-center">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-green-50">
                <Check className="h-10 w-10" strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Successful</h1>
            <p className="text-muted-foreground mt-2">Your order has been confirmed.</p>
        </div>

        <Card className="border-border shadow-lg overflow-hidden relative">
            {/* Receipt jagged edge effect - purely decorative */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />

            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" /> Receipt</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date().toLocaleDateString()}</span>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Amount Paid</p>
                    <p className="text-4xl font-bold tracking-tight text-foreground">{formatPrice(amount)}</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-mono font-medium">{order?.id?.slice(-8).toUpperCase() ?? "PENDING"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">Card ****</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-muted/10 pt-6">
                <Button asChild className="w-full h-11 text-base shadow-md hover:shadow-lg transition-shadow">
                    <Link href="/profile/orders">
                        View Order Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                    <Link href="/shops">
                        Continue Shopping
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
);

const FailureDisplay = ({ message }: { message: string }) => (
    <div className="max-w-md mx-auto w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50">
            <X className="h-10 w-10" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Payment Failed</h1>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
            {message || "We encountered an issue processing your payment. No funds were deducted."}
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button asChild size="lg" className="w-full">
                <Link href="/cart">Return to Cart & Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
                <Link href="/contact">Contact Support</Link>
            </Button>
        </div>
    </div>
);

// --- Main Page Logic ---

const ConfirmationContent = () => {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [order, setOrder] = useState<any>(null);
    const [amount, setAmount] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState('');

    // Get clearCart action from store
    const clearCart = useStore((state) => state.actions.clearCart);
    const removeCoupon = useStore((state) => state.actions.removeCoupon);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        const redirectStatus = searchParams.get('redirect_status');

        if (!paymentIntentId) {
            setStatus('error');
            setErrorMessage('Invalid confirmation link. No Payment Intent ID found.');
            return;
        }

        // Check Stripe redirect status first
        if (redirectStatus === 'failed') {
            setStatus('error');
            setErrorMessage('Your payment was declined. Please try again with a different payment method.');
            return;
        }

        const verifyPayment = async () => {
            try {
                // Call the correct endpoint
                const res = await axiosInstance.get(`/order/api/payment-status?payment_intent=${paymentIntentId}`);

                if (res.data.status === 'succeeded') {
                    setOrder(res.data.order);
                    setAmount(res.data.amount);
                    setStatus('success');

                    // Clear cart and coupon on successful payment
                    clearCart();
                    removeCoupon();
                } else if (res.data.status === 'processing') {
                    // Payment is still processing
                    setStatus('success');
                    setAmount(res.data.amount);
                } else {
                    setStatus('error');
                    setErrorMessage('Payment was not completed. Please try again.');
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.response?.data?.error || 'Failed to confirm your payment.');
            }
        };

        verifyPayment();

    }, [searchParams, clearCart, removeCoupon]);

    return (
        <Bounded>
            <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-6 text-center animate-pulse">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-muted"></div>
                            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold">Processing Payment...</h2>
                            <p className="text-muted-foreground">Securely verifying your transaction.</p>
                        </div>
                    </div>
                )}
                {status === 'success' && <SuccessDisplay order={order} amount={amount} />}
                {status === 'error' && <FailureDisplay message={errorMessage} />}
            </div>
        </Bounded>
    );
};

// Main export wrapped in Suspense for useSearchParams
export default function PaymentConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <ConfirmationContent />
        </Suspense>
    );
}