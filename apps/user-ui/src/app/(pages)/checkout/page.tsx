'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe, Appearance } from "@stripe/stripe-js";
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import { Elements } from "@stripe/react-stripe-js";

import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { CheckoutForm } from '@/components/checkout/checkoutForm';

// Load Stripe once outside the component to avoid re-creating it on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const CheckoutPageContent = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [sessionData, setSessionData] = useState<any>(null); // To hold cart, coupon, etc.
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    useEffect(() => {
        const fetchSessionAndIntent = async () => {
            if (!sessionId) {
                setError("Invalid session. Please return to your cart and try again.");
                setLoading(false);
                return;
            }

            try {
                // Verify session and create payment intent in one go
                const res = await axiosInstance.get(`/order/api/verify-session-and-create-intent?sessionId=${sessionId}`);
                
                setClientSecret(res.data.clientSecret);
                setSessionData(res.data.session);

            } catch (err) {
                console.error(err);
                setError("Something went wrong while preparing your payment. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessionAndIntent();
    }, [sessionId]);

    const appearance: Appearance = {
        theme: "night", // Use Stripe's dark theme
        labels: 'floating',
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoaderCircle className="animate-spin h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold">Preparing your secure checkout...</h2>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Payment Failed</h2>
                <p className="text-primary/70">{error}</p>
                <Link href="/cart" className="mt-6 underline">Return to Cart</Link>
            </div>
        );
    }

    return (
        clientSecret && sessionData && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                <CheckoutForm
                    clientSecret={clientSecret}
                    sessionData={sessionData}
                />
            </Elements>
        )
    );
};

// Main export must be wrapped in Suspense for useSearchParams
const CheckoutPage = () => (
    <React.Suspense fallback={<div>Loading...</div>}>
        <CheckoutPageContent />
    </React.Suspense>
);


export default CheckoutPage;