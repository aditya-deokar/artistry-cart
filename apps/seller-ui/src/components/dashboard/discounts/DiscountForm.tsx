// components/dashboard/discounts/DiscountForm.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { discountSchema, type DiscountFormData } from '@/lib/utils/validation';
import { getDiscountById, createDiscount, updateDiscount } from '@/lib/api/discounts';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Form sections
import DiscountBasicInfo from './form-sections/DiscountBasicInfo';
import DiscountConditions from './form-sections/DiscountConditions';
import DiscountUsage from './form-sections/DiscountUsage';
import DiscountValidation from './form-sections/DiscountValidation';

interface DiscountFormProps {
  mode: 'create' | 'edit';
  discountId?: string;
}

export default function DiscountForm({ mode, discountId }: DiscountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get existing discount data for edit mode
  const { data: existingDiscount } = useQuery({
    queryKey: ['discount', discountId],
    queryFn: () => getDiscountById(discountId!),
    enabled: mode === 'edit' && !!discountId,
  });

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: existingDiscount || {
      publicName: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      discountCode: '',
      minimumOrderAmount: null,
      maximumDiscountAmount: null,
      usageLimit: null,
      usageLimitPerUser: 1,
      isActive: true,
      validFrom: new Date(),
      validUntil: null,
      applicableToAll: true,
      applicableCategories: [],
      applicableProducts: [],
      excludedProducts: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: (data) => {
      toast.success('Discount code created successfully!');
      queryClient.invalidateQueries({ queryKey: ['seller-discounts'] });
      router.push(`/seller/discounts/${data.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create discount code');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountFormData }) =>
      updateDiscount(id, data),
    onSuccess: () => {
      toast.success('Discount code updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['discount', discountId] });
      queryClient.invalidateQueries({ queryKey: ['seller-discounts'] });
    },
    onError: (error) => {
      toast.error('Failed to update discount code');
      console.error(error);
    },
  });

  const onSubmit = async (data: DiscountFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else if (discountId) {
        await updateMutation.mutateAsync({ id: discountId, data });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="usage">Usage Limits</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <DiscountBasicInfo form={form} />
          </TabsContent>

          <TabsContent value="conditions">
            <DiscountConditions form={form} />
          </TabsContent>

          <TabsContent value="usage">
            <DiscountUsage form={form} />
          </TabsContent>

          <TabsContent value="validation">
            <DiscountValidation form={form} />
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
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Discount' : 'Update Discount'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
