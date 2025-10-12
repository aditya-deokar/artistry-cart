// app/(dashboard)/seller/offers/pricing/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import PricingHeader from '@/components/dashboard/offers/pricing/PricingHeader';
import PricingStrategies from '@/components/dashboard/offers/pricing/PricingStrategies';
import DynamicPricing from '@/components/dashboard/offers/pricing/DynamicPricing';
import PricingRules from '@/components/dashboard/offers/pricing/PricingRules';
import PriceOptimization from '@/components/dashboard/offers/pricing/PriceOptimization';
import BulkPricing from '@/components/dashboard/offers/pricing/BulkPricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Pricing Management - Seller Dashboard',
  description: 'Manage pricing strategies, dynamic pricing, and bulk pricing rules',
};

export default function PricingManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/offers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Offers
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Pricing Management
          </h1>
          <p className="text-muted-foreground">
            Configure pricing strategies, dynamic pricing rules, and bulk pricing options
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <PricingHeader />
      </Suspense>

      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="strategies">Pricing Strategies</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <PricingStrategies />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynamic">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <DynamicPricing />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules & Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <PricingRules />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Price Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <PriceOptimization />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Pricing Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <BulkPricing />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
