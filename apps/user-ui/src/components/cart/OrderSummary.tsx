'use client';

import { useStore } from '@/store';
import { MapPin, Tag, X } from 'lucide-react';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { formatPrice } from '@/lib/formatters';
import { CouponInput } from './CouponInput';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { AddressData } from '../profile/address-book/AddressCard';

type OrderSummaryProps = {
  subtotal: number;
};

export const OrderSummary = ({ subtotal }: OrderSummaryProps) => {

  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const removeCoupon = useStore((state) => state.actions.removeCoupon);

  const { data: addresses, isLoading } = useQuery<AddressData[]>({
    queryKey: ['userAddresses'],
    queryFn: async () =>
      (await axiosInstance.get('/auth/api/me/addresses')).data.addresses,
  });


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


        {/* ✅ Address Block */}
        <div className="p-4 rounded-md border bg-muted/40 space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Shipping Address
          </h3>

          {isLoading && <p className="text-sm text-muted-foreground">Loading addresses...</p>}

          {!isLoading && addresses && addresses.length > 0 ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{addresses[0].addressLine1}</p>
              <p>{addresses[0].city}</p>
              <p>{addresses[0].state} - {addresses[0].postalCode}</p>
              <p>{addresses[0].country}</p>
            </div>
          ) : (
            !isLoading && <p className="text-sm text-muted-foreground">No address found. Please add one.</p>
          )}

          <Button
          size="sm" variant="outline" className="mt-2 w-full">
            Change / Add Address
          </Button>
        </div>


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