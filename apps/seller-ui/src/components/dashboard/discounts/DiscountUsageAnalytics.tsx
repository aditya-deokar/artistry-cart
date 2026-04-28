'use client';

import DiscountQuickStats from './DiscountQuickStats';

interface DiscountUsageAnalyticsProps {
  discountId: string;
}

export default function DiscountUsageAnalytics({
  discountId,
}: DiscountUsageAnalyticsProps) {
  return <DiscountQuickStats discountId={discountId} />;
}
