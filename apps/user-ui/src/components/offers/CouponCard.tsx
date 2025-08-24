'use client';

import React from 'react';

import { Copy, TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CouponData {
  discountCode: string;
  publicName: string;
  discountType: string;
  discountValue: number;
}

export const CouponCard: React.FC<{ coupon: CouponData }> = ({ coupon }) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.discountCode);
        toast.success(`Copied code: ${coupon.discountCode}`);
    };

    const discountText = coupon.discountType.toLowerCase() === 'percentage'
        ? `${coupon.discountValue}% OFF`
        : `$${coupon.discountValue} OFF`;

    return (
        <div className="bg-neutral-900/50 border border-dashed border-accent/50 rounded-lg p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <TicketPercent className="text-accent" />
                    <h3 className="font-bold text-lg text-primary">{discountText}</h3>
                </div>
                <p className="text-sm text-primary/70">{coupon.publicName}</p>
            </div>
            <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-md mt-6">
                <span className="font-mono text-accent font-bold tracking-wider text-lg">
                    {coupon.discountCode}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy size={16} className="mr-2" />
                    Copy
                </Button>
            </div>
        </div>
    );
};