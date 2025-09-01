'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import Link from 'next/link';
import { Bounded } from '@/components/common/Bounded';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Display Components for Clarity ---

const SuccessDisplay = ({ orderId }: { orderId: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-green-500/10 border border-green-500/30 rounded-lg">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="font-display text-3xl md:text-4xl">Payment Successful!</h1>
        <p className="mt-2 text-primary/70 max-w-md">
            Thank you for your purchase. Your order has been confirmed and is now being processed.
        </p>
        <p className="mt-4 font-semibold">Order ID: #{orderId.slice(-8).toUpperCase()}</p>
        <Button asChild className="mt-6">
            <Link href="/profile/orders">View My Orders</Link>
        </Button>
    </div>
);

const FailureDisplay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg">
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
    const [orderId, setOrderId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        
        if (!paymentIntentId) {
            setStatus('error');
            setErrorMessage('Invalid confirmation link. No Payment Intent ID found.');
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await axiosInstance.post('/order/api/confirm-payment', { paymentIntentId });
                
                if (res.data.success) {
                    setOrderId(res.data.order.id);
                    setStatus('success');
                } else {
                    throw new Error(res.data.message || 'Verification failed.');
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.response?.data?.message || 'Failed to confirm your order.');
            }
        };

        verifyPayment();

    }, [searchParams]);

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
                {status === 'success' && orderId && <SuccessDisplay orderId={orderId} />}
                {status === 'error' && <FailureDisplay message={errorMessage} />}
            </div>
        </Bounded>
    );
};

// Main export must be wrapped in Suspense to use searchParams
export default function PaymentConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConfirmationContent />
        </Suspense>
    );
}