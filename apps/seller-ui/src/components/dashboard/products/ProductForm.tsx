// components/dashboard/products/ProductForm.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/utils/validation';
import { getProductById, createProduct, updateProduct } from '@/lib/api/products';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Form sections
import ProductBasicInfo from './form-sections/ProductBasicInfo';
import ProductImages from './form-sections/ProductImages';
import ProductPricing from './form-sections/ProductPricing';
import ProductInventory from './form-sections/ProductInventory';
import ProductVariations from './form-sections/ProductVariations';
import ProductSEO from './form-sections/ProductSEO';
import ProductShipping from './form-sections/ProductShipping';

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

export default function ProductForm({ mode, productId }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get existing product data for edit mode
  const { data: existingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId!),
    enabled: mode === 'edit' && !!productId,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: existingProduct || {
      title: '',
      description: '',
      detailed_description: '',
      category: '',
      subCategory: '',
      brand: '',
      tags: [],
      regular_price: 0,
      sale_price: null,
      stock: 0,
      images: [],
      colors: [],
      sizes: [],
      warranty: '',
      cash_on_delivery: true,
      status: 'Draft',
    },
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      router.push(`/seller/products/${data.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      updateProduct(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error(error);
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else if (productId) {
        await updateMutation.mutateAsync({ id: productId, data });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="variations">Variations</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ProductBasicInfo form={form} />
          </TabsContent>

          <TabsContent value="images">
            <ProductImages form={form} />
          </TabsContent>

          <TabsContent value="pricing">
            <ProductPricing form={form} />
          </TabsContent>

          <TabsContent value="inventory">
            <ProductInventory form={form} />
          </TabsContent>

          <TabsContent value="variations">
            <ProductVariations form={form} />
          </TabsContent>

          <TabsContent value="seo">
            <ProductSEO form={form} />
          </TabsContent>

          <TabsContent value="shipping">
            <ProductShipping form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
