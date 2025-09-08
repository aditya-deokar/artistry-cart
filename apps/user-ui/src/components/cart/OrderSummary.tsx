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
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType.toLowerCase() === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else { // Assuming 'flat' or 'fixed_amount'
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }
  const shippingCost = subtotal > 0 ? 50 : 0; 
  const taxes = subtotal * 0.05; // Example: 5% tax
  const total = subtotal - discountAmount + shippingCost + taxes;

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

        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-500">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-semibold">Discount ({appliedCoupon.publicName})</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={removeCoupon}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <span className="font-medium">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{formatPrice(shippingCost)}</span>
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