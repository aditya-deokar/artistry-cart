// app/(dashboard)/seller/discounts/bulk-create/page.tsx
import { Metadata } from 'next';
import BulkDiscountCreator from '@/components/dashboard/discounts/BulkDiscountCreator';
import BulkDiscountTemplates from '@/components/dashboard/discounts/BulkDiscountTemplates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Bulk Create Discount Codes - Seller Dashboard',
  description: 'Create multiple discount codes at once',
};

export default function BulkCreateDiscountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seller/discounts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discounts
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8" />
            Bulk Create Discount Codes
          </h1>
          <p className="text-muted-foreground">
            Create multiple discount codes efficiently for campaigns
          </p>
        </div>
      </div>

      <Tabs defaultValue="creator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="creator">Bulk Creator</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="creator">
          <Card>
            <CardHeader>
              <CardTitle>Create Multiple Discount Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkDiscountCreator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Discount Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <BulkDiscountTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import from CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Layers className="h-16 w-16 mx-auto mb-4" />
                <p>CSV import functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
