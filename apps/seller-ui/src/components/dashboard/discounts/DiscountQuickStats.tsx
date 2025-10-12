// components/dashboard/discounts/DiscountQuickStats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Target, DollarSign, TrendingUp } from 'lucide-react';
import { getDiscountById } from '@/lib/api/discounts';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface DiscountQuickStatsProps {
  discountId: string;
}

export default function DiscountQuickStats({ discountId }: DiscountQuickStatsProps) {
  const { data: discount, isLoading } = useQuery({
    queryKey: ['discount', discountId],
    queryFn: () => getDiscountById(discountId),
  });

  if (isLoading) return <LoadingState />;
  if (!discount) return null;

  const usagePercentage = discount.usageLimit 
    ? Math.round((discount.currentUsageCount / discount.usageLimit) * 100)
    : 0;

  const estimatedSavings = discount.currentUsageCount * 
    (discount.discountType === 'PERCENTAGE' 
      ? (100 * discount.discountValue / 100) // Estimate based on average order
      : discount.discountValue
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Uses</p>
              <p className="text-2xl font-bold">{formatNumber(discount.currentUsageCount)}</p>
              {discount.usageLimit && (
                <p className="text-sm text-muted-foreground">
                  of {formatNumber(discount.usageLimit)} limit
                </p>
              )}
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          {discount.usageLimit && (
            <div className="mt-3">
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {usagePercentage}% used
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Discount Value</p>
              <p className="text-2xl font-bold text-green-600">
                {discount.discountType === 'PERCENTAGE' 
                  ? `${discount.discountValue}%` 
                  : discount.discountType === 'FIXED_AMOUNT'
                  ? formatCurrency(discount.discountValue)
                  : 'FREE'
                }
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {discount.discountType.replace('_', ' ')}
              </Badge>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Customer Savings</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(estimatedSavings)}
              </p>
              <p className="text-sm text-green-600">
                +{discount.currentUsageCount} happy customers
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge 
                variant={
                  !discount.isActive ? 'secondary' :
                  discount.validUntil && new Date(discount.validUntil) < new Date() ? 'destructive' :
                  'default'
                }
                className="text-sm"
              >
                {!discount.isActive ? 'Inactive' :
                 discount.validUntil && new Date(discount.validUntil) < new Date() ? 'Expired' :
                 'Active'
                }
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Per user: {discount.usageLimitPerUser} use{discount.usageLimitPerUser > 1 ? 's' : ''}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
