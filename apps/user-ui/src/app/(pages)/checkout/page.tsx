'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe, Appearance } from "@stripe/stripe-js";
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosinstance';
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { Loader2, ShieldCheck, Lock, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Load Stripe once
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey!);

// --- Components ---

const CheckoutSteps = ({ currentStep }: { currentStep: string }) => {
    const steps = [
        { id: 'cart', label: 'Cart', href: '/cart' },
        { id: 'payment', label: 'Payment', href: '#' },
        { id: 'confirmation', label: 'Confirmation', href: '#' },
    ];

    return (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            {steps.map((step, index) => {
                const isCompleted = index < steps.findIndex(s => s.id === currentStep);
                const isCurrent = step.id === currentStep;

                return (
                    <React.Fragment key={step.id}>
                        <div className={cn(
                            "flex items-center",
                            isCurrent && "text-primary font-medium",
                            isCompleted && "text-primary"
                        )}>
                            {isCompleted ? (
                                <Link href={step.href} className="hover:underline flex items-center">
                                    {step.label}
                                </Link>
                            ) : (
                                <span>{step.label}</span>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const TrustBadges = () => (
    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-6 justify-center md:justify-start opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>Secure Encryption</span>
        </div>
        <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Guaranteed Safe</span>
        </div>
    </div>
);

// ... imports
import { useTheme } from "next-themes";
import { useMemo } from "react";

// ... TrustBadges component

// --- Main Page ---

const CheckoutPageContent = () => {
    const { resolvedTheme } = useTheme();
    const [clientSecret, setClientSecret] = useState('');
    const [sessionData, setSessionData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    useEffect(() => {
        // ... fetching logic (unchanged)
        const fetchSessionAndIntent = async () => {
            if (!sessionId) {
                setError("Invalid session. Please return to your cart and try again.");
                setLoading(false);
                return;
            }

            try {
                const res = await axiosInstance.get(`/order/api/verify-session-and-create-intent?sessionId=${sessionId}`);
                setClientSecret(res.data.clientSecret);
                setSessionData(res.data.session);
            } catch (err) {
                console.error(err);
                setError("Unable to initialize checkout. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessionAndIntent();
    }, [sessionId]);

    const appearance: Appearance = useMemo(() => {
        const isDark = resolvedTheme === 'dark';

        return {
            theme: isDark ? 'night' : 'stripe',
            variables: {
                colorPrimary: isDark ? '#eab308' : '#0f172a', // Gold in dark, Slate-900 in light
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                colorBackground: isDark ? '#1e293b' : '#ffffff',
                colorText: isDark ? '#f8fafc' : '#0f172a',
            },
        };
    }, [resolvedTheme]);

    if (loading) {
        // ... loading state
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] mx-auto">
                <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
                <h2 className="text-xl font-medium">Preparing secure checkout...</h2>
                <p className="text-muted-foreground text-sm mt-2">Please wait while we connect to Stripe.</p>
            </div>
        );
    }

    if (error) {
        // ... error state
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-md mx-auto">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Checkout Error</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link href="/cart" className="text-primary hover:underline font-medium">Return to Cart</Link>
            </div>
        );
    }








    return (
        <div className="container max-w-6xl py-10 px-4 md:px-6 mx-auto">
            <CheckoutSteps currentStep="payment" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Column: Payment Form */}
                <div className="lg:col-span-7 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Details</h1>
                        <p className="text-muted-foreground">Complete your purchase securely.</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-sm font-medium text-primary">
                            <CreditCard className="h-4 w-4" />
                            <span>Credit or Debit Card</span>
                        </div>

                        {clientSecret && sessionData && (
                            <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                <PaymentForm clientSecret={clientSecret} sessionData={sessionData} />
                            </Elements>
                        )}
                    </div>

                    <TrustBadges />
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-muted/30 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 bg-muted/50 border-b">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Order Summary
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {sessionData.cart.map((item: any) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="h-16 w-16 bg-background rounded-md border flex items-center justify-center overflow-hidden shrink-0">
                                                {/* Fallback for image since it might not be in session data immediately or verified */}
                                                <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium truncate">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-sm font-medium">
                                                ${(item.sale_price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${sessionData.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-muted-foreground">Calculated next step</span>
                                    </div>
                                    {sessionData.coupon && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>- Calculated</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-base font-semibold">Total</span>
                                        <p className="text-xs text-muted-foreground">Including taxes</p>
                                    </div>
                                    <span className="text-2xl font-bold tracking-tight">
                                        ${sessionData.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Help / Support Text */}
                        <div className="text-center text-xs text-muted-foreground px-6">
                            Need help? <Link href="/contact" className="underline hover:text-primary">Contact Support</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => (
    <React.Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>}>
        <CheckoutPageContent />
    </React.Suspense>
);

export default CheckoutPage;