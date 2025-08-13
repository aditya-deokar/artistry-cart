'use client';

import { useStore } from '@/store';
import { Tag, X } from 'lucide-react';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { formatPrice } from '@/lib/formatters';
import { CouponInput } from './CouponInput';

type OrderSummaryProps = {
  subtotal: number;
};

export const OrderSummary = ({ subtotal }: OrderSummaryProps) => {
  
  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const removeCoupon = useStore((state) => state.actions.removeCoupon);

  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const shippingCost = 0;
  const taxes = 0; 
  const total = subtotal - discountAmount + shippingCost + taxes;

  return (
    <div className="rounded-lg border border-border bg-card p-6 lg:p-8 space-y-4 sticky top-24">
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        
        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-600">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-semibold">Discount ({appliedCoupon.publicName})</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-red-500" 
                onClick={removeCoupon}
                aria-label="Remove coupon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <span className="font-medium">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {/* ... other price details ... */}
      </div>

      <Separator />

      {!appliedCoupon && (
        <div className="pt-2 pb-2">
            <CouponInput />
        </div>
      )}

      <div className="flex justify-between text-lg font-bold text-foreground pt-2">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      
      <Button size="lg" className="w-full" disabled={subtotal === 0}>
        Proceed to Checkout
      </Button>
    </div>
  );
};