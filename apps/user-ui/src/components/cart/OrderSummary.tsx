'use client';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { formatPrice } from '@/lib/formatters';

type OrderSummaryProps = {
  subtotal: number;
};

export const OrderSummary = ({ subtotal }: OrderSummaryProps) => {
  // In a real app, shipping and taxes would be calculated. Here, they are placeholders.
  const shippingCost = 0;
  const taxes = subtotal * 0; // Example: 0% tax for now

  const total = subtotal + shippingCost + taxes;

  return (
    <div className="rounded-lg border border-border bg-card p-6 lg:p-8 space-y-6 sticky top-24">
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Order Summary
      </h2>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">Calculated at next step</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxes</span>
          <span className="text-foreground">Calculated at next step</span>
        </div>
      </div>
      {/* <Separator /> */}
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      <Button size="lg" className="w-full">
        Proceed to Checkout
      </Button>
    </div>
  );
};