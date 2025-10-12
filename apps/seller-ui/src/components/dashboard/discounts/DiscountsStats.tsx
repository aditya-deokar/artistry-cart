// components/dashboard/discounts/DiscountsStats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, TrendingUp, Users, DollarSign, Target, Percent } from 'lucide-react';
import { getDiscountStats } from '@/lib/api/discounts';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { useDiscountStore } from '@/store/discounts/discountStore';

export default function DiscountsStats() {
  const { activeDiscounts, expiredDiscounts, inactiveDiscounts } = useDiscountStore();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['discount-stats'],
    queryFn: getDiscountStats,
  });

  const statsData = [
    {
      title: 'Total Discount Codes',
      value: formatNumber((stats?.totalDiscounts || 0) + activeDiscounts.length + expiredDiscounts.length + inactiveDiscounts.length),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Ticket,
    },
    {
      title: 'Active Codes',
      value: formatNumber(activeDiscounts.length),
      change: 'Ready to use',
      changeType: 'neutral' as const,
      icon: Target,
    },
    {
      title: 'Total Uses',
      value: formatNumber(stats?.totalUsage || 1240),
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Discount Revenue',
      value: formatCurrency(stats?.totalSavings || 8750),
      change: '+23.7%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <Badge 
                    variant={
                      stat.changeType === 'positive' ? 'default' : 
                      stat.changeType === 'negative' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-xs mt-1"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <Icon className={`h-8 w-8 ${
                  index === 0 ? 'text-blue-500' :
                  index === 1 ? 'text-green-500' :
                  index === 2 ? 'text-purple-500' :
                  'text-yellow-500'
                }`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
