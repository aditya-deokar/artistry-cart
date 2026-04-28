'use client';

import { useDiscountDetails } from '@/hooks/useDiscounts';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';

interface DiscountUsageTableProps {
  discountId: string;
}

export default function DiscountUsageTable({
  discountId,
}: DiscountUsageTableProps) {
  const { data: discount, isLoading } = useDiscountDetails(discountId);

  if (isLoading) {
    return <LoadingState />;
  }

  const usageHistory = discount?.usageHistory ?? [];

  if (usageHistory.length === 0) {
    return (
      <div className="py-10 text-sm text-muted-foreground">
        No usage history yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {usageHistory.map((usage) => (
        <div
          key={usage.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">
              {usage.user?.name || usage.user?.email || 'Customer'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(usage.usedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(usage.discountAmount)}</p>
            <p className="text-xs text-muted-foreground">
              Order {usage.order?.id?.slice(-8).toUpperCase() || 'N/A'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
