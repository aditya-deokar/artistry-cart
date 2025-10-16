'use-client';

import { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore, type DiscountCode } from '@/store';
import axiosInstance from '@/utils/axiosinstance';


const validateCouponCode = async (couponCode: string, cartItems: any[]): Promise<DiscountCode> => {
  try {
    const response = await axiosInstance.post('/product/api/discounts/validate', { 
      discountCode: couponCode,
      cartItems: cartItems,
    });
    
    // API returns: { success, data: { discount, discountAmount, cartTotal, finalAmount, savings } }
    const apiData = response.data.data;
    const discount = apiData.discount;
    
    // Map API response to store format
    const mappedDiscount: DiscountCode = {
      id: discount.id,
      publicName: discount.publicName,
      discountType: discount.discountType, // 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
      discountValue: discount.discountValue,
      discountCode: discount.discountCode,
      minimumOrderAmount: discount.minimumOrderAmount,
      maximumDiscountAmount: discount.maximumDiscountAmount,
    };
    
    return mappedDiscount;
  } catch (error) {
    
    if (axios.isAxiosError(error) && error.response) {
      // Handle API error response
      throw new Error(error.response.data.message || 'Invalid coupon code.');
    }
  
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const CouponInput = () => {
  const [code, setCode] = useState('');
  const cart = useStore((state) => state.cart); // Get cart items from store
  const { applyCoupon } = useStore((state) => state.actions);


  const mutation = useMutation({
    mutationFn: ({ couponCode, cartItems }: { couponCode: string; cartItems: any[] }) => 
      validateCouponCode(couponCode, cartItems),
    onSuccess: (validatedCoupon) => {
      applyCoupon(validatedCoupon);
      setCode('');
      
      // Show success message based on discount type
      if (validatedCoupon.discountType === 'PERCENTAGE') {
        toast.success(`Coupon applied! ${validatedCoupon.discountValue}% discount`);
      } else if (validatedCoupon.discountType === 'FIXED_AMOUNT') {
        toast.success(`Coupon applied! Flat discount`);
      } else if (validatedCoupon.discountType === 'FREE_SHIPPING') {
        toast.success('Coupon applied! Free shipping');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleApplyCoupon = () => {
    if (!code) return;
    
    // Format cart items for API validation
    const formattedCartItems = cart.map(item => ({
      id: item.id,
      price: item.sale_price || item.regular_price,
      quantity: item.quantity
    }));
    
    mutation.mutate({ couponCode: code, cartItems: formattedCartItems });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter Coupon Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={mutation.isPending}
        />
        <Button onClick={handleApplyCoupon} disabled={mutation.isPending || !code}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>

      
      {mutation.isError && (
        <p className="text-sm text-red-500">{mutation.error.message}</p>
      )}
    </div>
  );
};