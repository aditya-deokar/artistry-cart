// components/dashboard/offers/QuickActions.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Calendar, DollarSign, Gift, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const quickActions = [
    {
      title: 'Create Flash Sale',
      description: 'Quick 24-hour flash sale',
      icon: Zap,
      href: '/seller/offers/flash-sales',
      color: 'text-yellow-500'
    },
    {
      title: 'Seasonal Offer',
      description: 'Holiday or seasonal promotion',
      icon: Calendar,
      href: '/seller/offers/seasonal',
      color: 'text-blue-500'
    },
    {
      title: 'Dynamic Pricing',
      description: 'Set smart pricing rules',
      icon: DollarSign,
      href: '/seller/offers/pricing',
      color: 'text-green-500'
    },
    {
      title: 'Promotional Offer',
      description: 'General promotional campaign',
      icon: Gift,
      href: '/seller/offers/create',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Quick Actions</h3>
      
      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${action.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/seller/analytics/offers">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Full Analytics
          </Link>
        </Button>
      </div>
    </div>
  );
}
