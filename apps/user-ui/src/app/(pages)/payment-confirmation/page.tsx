'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import Link from 'next/link';
import { Bounded } from '@/components/common/Bounded';
import { CheckCircle, XCircle, LoaderCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { formatPrice } from '@/lib/formatters';

// --- Display Components ---

const SuccessDisplay = ({ order, amount }: { order: any; amount: number }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-green-500/10 border border-green-500/30 rounded-lg max-w-lg mx-auto">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="font-display text-3xl md:text-4xl">Payment Successful!</h1>
        <p className="mt-2 text-primary/70 max-w-md">
            Thank you for your purchase. Your order has been confirmed and is now being processed.
        </p>
        {order && (
            <p className="mt-4 font-semibold">Order ID: #{order.id?.slice(-8).toUpperCase()}</p>
        )}
        <p className="mt-2 text-lg font-bold text-green-500">{formatPrice(amount)}</p>
        <div className="flex gap-4 mt-6">
            <Button asChild>
                <Link href="/profile/orders">View My Orders</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/shops">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                </Link>
            </Button>
        </div>
    </div>
);

const FailureDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg max-w-lg mx-auto">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="font-display text-3xl md:text-4xl">Payment Failed</h1>
        <p className="mt-2 text-primary/70 max-w-md">
            {message || "We were unable to process your payment. Please try again or contact support."}
        </p>
        <Button asChild className="mt-6" variant="outline">
            <Link href="/cart">Return to Cart</Link>
        </Button>
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
            <div className="min-h-[60vh] flex items-center justify-center py-16">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <LoaderCircle className="h-12 w-12 animate-spin" />
                        <h2 className="text-xl font-semibold">Confirming your payment...</h2>
                        <p className="text-primary/70">Please do not close this page.</p>
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
        <Suspense fallback={<div>Loading...</div>}>
            <ConfirmationContent />
        </Suspense>
    );
}