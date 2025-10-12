// app/(dashboard)/seller/discounts/[discountId]/edit/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DiscountForm from '@/components/dashboard/discounts/DiscountForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EditDiscountPageProps {
  params: { discountId: string };
}

export async function generateMetadata({ params }: EditDiscountPageProps): Promise<Metadata> {
  return {
    title: `Edit Discount Code - Seller Dashboard`,
    description: 'Edit discount code details and settings',
  };
}

export default function EditDiscountPage({ params }: EditDiscountPageProps) {
  const { discountId } = params;

  if (!discountId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/seller/discounts/${discountId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discount
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Discount Code</h1>
          <p className="text-muted-foreground">
            Update your discount code settings and restrictions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Code Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <DiscountForm mode="edit" discountId={discountId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
