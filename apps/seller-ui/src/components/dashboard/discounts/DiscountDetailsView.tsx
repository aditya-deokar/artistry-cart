'use client';

import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiscountDetails } from '@/hooks/useDiscounts';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface DiscountDetailsViewProps {
  discountId: string;
}

export default function DiscountDetailsView({
  discountId,
}: DiscountDetailsViewProps) {
  const { data: discount, isLoading } = useDiscountDetails(discountId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!discount) {
    return (
      <CardContent className="py-10 text-sm text-muted-foreground">
        Discount details are not available.
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{discount.publicName}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {discount.description || 'No description provided.'}
            </p>
          </div>
          <Badge variant={discount.isActive ? 'default' : 'secondary'}>
            {discount.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Discount Code
            </p>
            <p className="mt-1 font-mono text-sm">{discount.discountCode}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Discount Type
            </p>
            <p className="mt-1 text-sm">{discount.discountType}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Discount Value
            </p>
            <p className="mt-1 text-sm">
              {discount.discountType === 'PERCENTAGE'
                ? `${discount.discountValue}%`
                : discount.discountType === 'FIXED_AMOUNT'
                  ? formatCurrency(discount.discountValue)
                  : 'Free shipping'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Usage
            </p>
            <p className="mt-1 text-sm">
              {discount.currentUsageCount}
              {discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Valid From
            </p>
            <p className="mt-1 text-sm">{formatDate(discount.validFrom)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Valid Until
            </p>
            <p className="mt-1 text-sm">
              {discount.validUntil ? formatDate(discount.validUntil) : 'No expiration'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Minimum Order
            </p>
            <p className="mt-1 text-sm">
              {discount.minimumOrderAmount
                ? formatCurrency(discount.minimumOrderAmount)
                : 'No minimum'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Maximum Discount
            </p>
            <p className="mt-1 text-sm">
              {discount.maximumDiscountAmount
                ? formatCurrency(discount.maximumDiscountAmount)
                : 'No limit'}
            </p>
          </div>
        </div>
      </CardContent>
    </>
  );
}
