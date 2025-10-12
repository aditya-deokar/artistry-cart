// components/dashboard/discounts/DiscountUsageChart.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDiscountUsageStats } from '@/lib/api/discounts';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { formatDate } from '@/lib/utils/formatting';

interface DiscountUsageChartProps {
  discountId: string;
}

// Sample data
const usageData = [
  { date: '2025-09-01', uses: 5, savings: 125 },
  { date: '2025-09-02', uses: 8, savings: 200 },
  { date: '2025-09-03', uses: 12, savings: 300 },
  { date: '2025-09-04', uses: 6, savings: 150 },
  { date: '2025-09-05', uses: 15, savings: 375 },
  { date: '2025-09-06', uses: 9, savings: 225 },
  { date: '2025-09-07', uses: 18, savings: 450 },
];

export default function DiscountUsageChart({ discountId }: DiscountUsageChartProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['discount-usage-stats', discountId],
    queryFn: () => getDiscountUsageStats(discountId),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorUses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value, name) => [value, name === 'uses' ? 'Uses' : 'Customer Savings']}
                />
                <Area 
                  type="monotone" 
                  dataKey="uses" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorUses)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [`$${value}`, 'Customer Savings']}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
