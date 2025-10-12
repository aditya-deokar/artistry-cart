// components/dashboard/offers/OffersHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Settings, BarChart3, Calendar, Zap, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function OffersHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="h-8 w-8" />
          Offers Management
        </h1>
        <p className="text-muted-foreground">
          Manage all your promotional offers, pricing strategies, and sales campaigns
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="default">12 Active Offers</Badge>
          <Badge variant="secondary">5 Scheduled</Badge>
          <Badge variant="outline">3 Draft</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/offers/pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/offers/seasonal">
            <Calendar className="h-4 w-4 mr-2" />
            Seasonal
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/offers/flash-sales">
            <Zap className="h-4 w-4 mr-2" />
            Flash Sales
          </Link>
        </Button>

        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>
    </div>
  );
}
