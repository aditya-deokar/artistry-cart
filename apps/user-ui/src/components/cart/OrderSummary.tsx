'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- FIXED: Correct import for App Router
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { toast } from 'sonner';

// Store and Types
import { CartItem, useStore } from '@/store';
import { AddressData } from '../profile/address-book/AddressCard';

// UI Components
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For address selection
import { CouponInput } from './CouponInput';

// Utils and Icons
import { formatPrice } from '@/lib/formatters';
import { MapPin, Tag, X, LoaderCircle } from 'lucide-react';

type OrderSummaryProps = {
  subtotal: number;
  cart: CartItem[]; // <-- FIXED: Cart should be an array of items
};

export const OrderSummary = ({ subtotal, cart }: OrderSummaryProps) => {
  const router = useRouter();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState<boolean>(false);
  
  // 1. --- State to manage the selected address ---
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const removeCoupon = useStore((state) => state.actions.removeCoupon);

  // 2. --- Fetch user addresses ---
  const { data: addresses, isLoading: isLoadingAddresses ,isSuccess } = useQuery<AddressData[]>({
    queryKey: ['userAddresses'],
    // <-- FIXED: Correct API endpoint
    queryFn: async () => (await axiosInstance.get('/auth/api/me/addresses')).data.addresses,
    
  });

    useEffect(() => {
    // This effect runs only when the query is successful and the data is available
    if (isSuccess && addresses && addresses.length > 0) {
        // Find the default address, or fall back to the first one
        const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
        setSelectedAddress(defaultAddress);
    }
  }, [isSuccess, addresses]); 


  // 3. --- Checkout session creation logic ---
  const createPaymentSession = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address before proceeding.");
      return;
    }
    setIsLoadingCheckout(true);
    try {
      const res = await axiosInstance.post('/order/api/create-payment-session', {
        cart,
        selectedAddress,
        // <-- FIXED: Send the applied coupon details
        coupon: appliedCoupon ? {
            code: appliedCoupon.discountCode,
            type: appliedCoupon.discountType,
            value: appliedCoupon.discountValue,
        } : null,
      });

      // Assuming the API returns a URL to redirect to (e.g., Stripe Checkout)
      const redirectUrl = res.data.url;
      if (redirectUrl) {
          window.location.href = redirectUrl; // Redirect to external payment page
      } else {
          toast.error("Could not initiate payment session.");
      }

    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  // 4. --- Calculate final price ---
  
  // Calculate event discounts already applied (difference between regular_price and pricing.finalPrice)
  const eventDiscountsAlreadyApplied = cart.reduce((total, item) => {
    if (item.pricing) {
      // Calculate the discount already applied via event pricing
      const regularTotal = item.regular_price * item.quantity;
      const discountedTotal = item.pricing.finalPrice * item.quantity;
      return total + (regularTotal - discountedTotal);
    }
    // If pricing object isn't available, check if sale_price differs from regular_price
    else if (item.sale_price && item.sale_price < item.regular_price) {
      return total + ((item.regular_price - item.sale_price) * item.quantity);
    }
    return total;
  }, 0);

  // Calculate additional coupon discount
  let couponDiscountAmount = 0;
  if (appliedCoupon && appliedCoupon.discountType) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      couponDiscountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      // Apply maximum discount limit if specified
      if (appliedCoupon.maximumDiscountAmount) {
        couponDiscountAmount = Math.min(couponDiscountAmount, appliedCoupon.maximumDiscountAmount);
      }
    } else if (appliedCoupon.discountType === 'FIXED_AMOUNT') {
      couponDiscountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    } else if (appliedCoupon.discountType === 'FREE_SHIPPING') {
      // Free shipping discount will be applied to shipping cost
      couponDiscountAmount = 0; // Don't reduce subtotal
    }
  }

  // Calculate total discount (both event and coupon)
  let shippingCost = subtotal > 0 ? 50 : 0;
  
  // Apply free shipping if coupon type is FREE_SHIPPING
  if (appliedCoupon && appliedCoupon.discountType === 'FREE_SHIPPING') {
    shippingCost = 0;
  }
  
  const taxes = subtotal * 0.05; // Example: 5% tax
  const total = subtotal - couponDiscountAmount + shippingCost + taxes;

  return (
    <div className="rounded-lg border border-border bg-card p-6 lg:p-8 space-y-4 sticky top-24">
      <h2 className="font-display text-2xl font-semibold text-foreground">Order Summary</h2>

      <div className="space-y-3">
        {/* --- 5. Address Block with Selection --- */}
        <div className="p-4 rounded-md border bg-muted/40 space-y-2 w-full">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Shipping Address
          </h3>

          {isLoadingAddresses && <p className="text-sm text-muted-foreground">Loading addresses...</p>}
          
          {!isLoadingAddresses && addresses && addresses.length > 0 ? (
            <Select
              
              value={selectedAddress?.id}
              onValueChange={(id) => setSelectedAddress(addresses.find(addr => addr.id === id) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an address" />
              </SelectTrigger>
              <SelectContent>
                {addresses.map(addr => (
                  <SelectItem key={addr.id} value={addr.id}>
                    {addr.addressLine1}, {addr.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            !isLoadingAddresses && (
              <Button size="sm" variant="outline" className="w-full" onClick={() => router.push('/profile/addresses')}>
                Add a Shipping Address
              </Button>
            )
          )}
        </div>

        {/* --- Price Details --- */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {eventDiscountsAlreadyApplied > 0 && (
          <div className="flex justify-between items-center text-green-500">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-semibold">Event Discounts</span>
            </div>
            <span className="font-medium">-{formatPrice(eventDiscountsAlreadyApplied)}</span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-500">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-semibold">Coupon ({appliedCoupon.publicName})</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={removeCoupon}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <span className="font-medium">-{formatPrice(couponDiscountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className={`font-medium ${shippingCost === 0 && appliedCoupon?.discountType === 'FREE_SHIPPING' ? 'text-green-500 line-through' : ''}`}>
              {shippingCost === 0 && appliedCoupon?.discountType === 'FREE_SHIPPING' ? (
                <span className="flex items-center gap-1">
                  <span className="line-through text-muted-foreground">{formatPrice(50)}</span>
                  <span className="text-green-500 font-semibold">FREE</span>
                </span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
        </div>
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes</span>
            <span className="font-medium">{formatPrice(taxes)}</span>
        </div>
      </div>

      <Separator />

      {!appliedCoupon && subtotal > 0 && <CouponInput />}

      <div className="flex justify-between text-lg font-bold text-foreground pt-2">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {/* --- 6. Checkout Button connected to the function --- */}
      <Button
        size="lg"
        className="w-full"
        disabled={subtotal === 0 || !selectedAddress || isLoadingCheckout}
        onClick={createPaymentSession}
      >
        {isLoadingCheckout && <LoaderCircle className="animate-spin mr-2" />}
        {isLoadingCheckout ? 'Processing...' : 'Proceed to Payment'}
      </Button>
    </div>
  );
};