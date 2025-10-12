// app/(dashboard)/seller/discounts/create/page.tsx
import { Metadata } from 'next';
import DiscountForm from '@/components/dashboard/discounts/DiscountForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Create Discount Code - Seller Dashboard',
  description: 'Create a new discount code for your store',
};

export default function CreateDiscountPage() {
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
            <Ticket className="h-8 w-8" />
            Create Discount Code
          </h1>
          <p className="text-muted-foreground">
            Set up a new discount code to boost your sales
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Code Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscountForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
