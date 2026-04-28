'use client';

import DiscountUsageChart from './DiscountUsageChart';

interface DiscountUsageChartsProps {
  discountId: string;
}

export default function DiscountUsageCharts({
  discountId,
}: DiscountUsageChartsProps) {
  return <DiscountUsageChart discountId={discountId} />;
}
