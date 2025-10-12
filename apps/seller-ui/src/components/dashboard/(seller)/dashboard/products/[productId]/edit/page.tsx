// app/(dashboard)/seller/products/[productId]/edit/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/dashboard/products/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EditProductPageProps {
  params: { productId: string };
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  return {
    title: `Edit Product - Seller Dashboard`,
    description: 'Edit product information and settings',
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = params;

  if (!productId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/seller/products/${productId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update your product information and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductForm mode="edit" productId={productId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
