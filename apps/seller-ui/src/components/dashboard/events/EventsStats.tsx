// components/dashboard/events/EventsStats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, DollarSign, Eye, Zap } from 'lucide-react';
import { getEventStats } from '@/lib/api/events';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';
import { useEventStore } from '@/store/events/eventStore';

export default function EventsStats() {
  const { activeEvents, upcomingEvents, endedEvents } = useEventStore();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['event-stats'],
    queryFn: getEventStats,
  });

  const statsData = [
    {
      title: 'Total Events',
      value: formatNumber((stats?.totalEvents || 0) + activeEvents.length + upcomingEvents.length + endedEvents.length),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      title: 'Active Events',
      value: formatNumber(activeEvents.length),
      change: 'Live now',
      changeType: 'neutral' as const,
      icon: Zap,
    },
    {
      title: 'Total Views',
      value: formatNumber(stats?.totalViews || 15420),
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: Eye,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 48750),
      change: '+18.2%',
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
