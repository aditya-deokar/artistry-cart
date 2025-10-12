// components/dashboard/offers/OffersStats.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, TrendingUp, Users, DollarSign, Target, Percent } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';

export default function OffersStats() {
  const statsData = [
    {
      title: 'Total Offers',
      value: '28',
      change: '+3 this month',
      changeType: 'positive' as const,
      icon: Gift,
      color: 'text-blue-500'
    },
    {
      title: 'Active Revenue Impact',
      value: formatCurrency(45230),
      change: '+23.7% vs last month',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Customers Reached',
      value: formatNumber(8420),
      change: '+18.2% engagement',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-purple-500'
    },
    {
      title: 'Average Conversion',
      value: '12.8%',
      change: '+2.1% improvement',
      changeType: 'positive' as const,
      icon: Target,
      color: 'text-yellow-500'
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
                    variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs mt-1"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
