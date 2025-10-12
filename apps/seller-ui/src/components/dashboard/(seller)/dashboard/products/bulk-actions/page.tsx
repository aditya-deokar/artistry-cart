// app/(dashboard)/seller/products/bulk-actions/page.tsx
import { Metadata } from 'next';
import BulkProductActions from '@/components/dashboard/products/BulkProductActions';
import BulkPricingUpdate from '@/components/dashboard/products/BulkPricingUpdate';
import BulkInventoryUpdate from '@/components/dashboard/products/BulkInventoryUpdate';
import BulkCategoryUpdate from '@/components/dashboard/products/BulkCategoryUpdate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Bulk Actions - Seller Dashboard',
  description: 'Perform bulk operations on multiple products',
};

export default function BulkActionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bulk Actions</h1>
          <p className="text-muted-foreground">
            Perform operations on multiple products at once
          </p>
        </div>
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="actions">Bulk Actions</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Updates</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Updates</TabsTrigger>
          <TabsTrigger value="categories">Category Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Product Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkProductActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Pricing Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkPricingUpdate />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Inventory Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkInventoryUpdate />
            </CardContent>
          </Card>
        </CardContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Category Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkCategoryUpdate />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
