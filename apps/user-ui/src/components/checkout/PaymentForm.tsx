"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
    clientSecret: string;
    sessionData: any;
}

export function PaymentForm({ clientSecret, sessionData }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "An unexpected error occurred.");
            setIsLoading(false);
            return;
        }

        const returnUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/order-confirmation`;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            setMessage(error.message || "An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && (
                <div id="payment-message" className="text-red-500 text-sm">
                    {message}
                </div>
            )}

            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full"
                size="lg"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    "Pay Now"
                )}
            </Button>
        </form>
    );
}
