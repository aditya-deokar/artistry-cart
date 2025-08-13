'use-client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore, type DiscountCode } from '@/store';
import axiosInstance from '@/utils/axiosinstance';


const validateCouponCode = async (couponCode: string): Promise<DiscountCode> => {
  try {
    const response = await axiosInstance.post('/product/api/coupon/validate', { couponCode });
    return response.data;
  } catch (error) {
    
    if (axios.isAxiosError(error) && error.response) {
      
      throw new Error(error.response.data.message || 'Invalid coupon code.');
    }
  
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const CouponInput = () => {
  const [code, setCode] = useState('');
  const { applyCoupon } = useStore((state) => state.actions);


  const mutation = useMutation({
    mutationFn: validateCouponCode,
    onSuccess: (validatedCoupon) => {
     
      applyCoupon(validatedCoupon); 
      setCode(''); 
    },
    
  });

  const handleApplyCoupon = () => {
    if (!code) return;
    mutation.mutate(code);
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