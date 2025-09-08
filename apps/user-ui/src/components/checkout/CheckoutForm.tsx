'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Bounded } from '@/components/common/Bounded';
import { formatPrice } from '@/lib/formatters';
import Image from 'next/image';
import { LoaderCircle } from 'lucide-react';

export const CheckoutForm = ({ clientSecret, sessionData }: { clientSecret: string, sessionData: any }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // This is the URL Stripe will redirect the user back to after payment.
                // You will handle the success/failure message on this page.
                return_url: `${window.location.origin}/payment-confirmation`,
            },
        });

        // This point will only be reached if there is an immediate error during confirmation.
        // Otherwise, your customer will be redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } else {
            setErrorMessage("An unexpected error occurred. Please try again.");
        }

        setIsLoading(false);
    };

    return (
        <Bounded>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-16">
                
                {/* --- Left Side: Order Summary --- */}
                <div className="p-8 border border-neutral-800 rounded-lg order-last lg:order-first">
                    <h2 className="font-display text-2xl mb-6">Your Order</h2>
                    <div className="space-y-4">
                        {sessionData.cart.map((item: any) => (
                            <div key={item.product.id} className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-md bg-neutral-800 flex-shrink-0">
                                    <Image src={item.product.images[0].url} alt={item.product.title} fill className="object-cover rounded-md" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.product.title}</p>
                                    <p className="text-sm text-primary/70">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">{formatPrice(item.product.sale_price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-neutral-800 space-y-2 text-sm">
                         <div className="flex justify-between text-lg font-bold text-foreground">
                            <span>Total</span>
                            <span>{formatPrice(sessionData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* --- Right Side: Payment Form --- */}
                <div className="p-8 border border-neutral-800 rounded-lg">
                    <h2 className="font-display text-2xl mb-6">Payment Details</h2>
                    <form id="payment-form" onSubmit={handleSubmit}>
                        {/* The PaymentElement renders card, bank, and other payment method inputs */}
                        <PaymentElement id="payment-element" />

                        {/* The AddressElement can be used to collect shipping/billing info */}
                        <h3 className="font-semibold mt-8 mb-4">Shipping Information</h3>
                        <AddressElement options={{ mode: 'shipping' }} />

                        {errorMessage && <div id="payment-message" className="text-red-500 mt-4">{errorMessage}</div>}
                        
                        <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-8" size="lg">
                            <span id="button-text">
                                {isLoading ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    `Pay ${formatPrice(sessionData.totalAmount)}`
                                )}
                            </span>
                        </Button>
                    </form>
                </div>

            </div>
        </Bounded>
    );
};