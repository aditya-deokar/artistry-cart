'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { DiscountCode } from '@/types';
import { useUpdateDiscount } from '@/hooks/useDiscounts';

const editDiscountSchema = z.object({
  publicName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue: z.number().min(0),
  minimumOrderAmount: z.number().min(0).optional().nullable(),
  maximumDiscountAmount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().min(1).optional().nullable(),
  usageLimitPerUser: z.number().min(1).optional().nullable(),
  validUntil: z.date().optional().nullable(),
  isActive: z.boolean(),
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
}).refine(data => {
  // If validUntil is set, it must be in the future
  if (data.validUntil && data.validUntil < new Date()) {
    return false;
  }
  return true;
}, {
  message: "Expiry date must be in the future",
  path: ["validUntil"],
});

type EditDiscountFormData = z.infer<typeof editDiscountSchema>;

interface EditDiscountDialogProps {
  discount: DiscountCode;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditDiscountDialog({ discount, isOpen, onClose }: EditDiscountDialogProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const updateDiscount = useUpdateDiscount();

  const handleClose = () => {
    setIsCalendarOpen(false);
    onClose();
  };

  const form = useForm<EditDiscountFormData>({
    resolver: zodResolver(editDiscountSchema),
    defaultValues: {
      publicName: discount.publicName || '',
      description: discount.description || '',
      discountType: discount.discountType || 'PERCENTAGE',
      discountValue: discount.discountValue || 0,
      minimumOrderAmount: discount.minimumOrderAmount ?? null,
      maximumDiscountAmount: discount.maximumDiscountAmount ?? null,
      usageLimit: discount.usageLimit ?? null,
      usageLimitPerUser: discount.usageLimitPerUser ?? null,
      validUntil: discount.validUntil ? new Date(discount.validUntil) : null,
      isActive: discount.isActive ?? true,
    },
  });

  useEffect(() => {
    if (discount && isOpen) {
      form.reset({
        publicName: discount.publicName || '',
        description: discount.description || '',
        discountType: discount.discountType || 'PERCENTAGE',
        discountValue: discount.discountValue || 0,
        minimumOrderAmount: discount.minimumOrderAmount ?? null,
        maximumDiscountAmount: discount.maximumDiscountAmount ?? null,
        usageLimit: discount.usageLimit ?? null,
        usageLimitPerUser: discount.usageLimitPerUser ?? null,
        validUntil: discount.validUntil ? new Date(discount.validUntil) : null,
        isActive: discount.isActive ?? true,
      });
    }
  }, [discount, isOpen, form]);

  const discountType = form.watch('discountType');
  const hasBeenUsed = discount.currentUsageCount > 0;

  const onSubmit = async (data: EditDiscountFormData) => {
    try {
      // Prepare data for API, removing null values and converting date
      const updateData: any = {
        publicName: data.publicName,
        description: data.description || undefined,
        discountType: data.discountType,
        discountValue: data.discountValue,
        isActive: data.isActive,
      };

      // Only include optional fields if they have values
      if (data.minimumOrderAmount !== null && data.minimumOrderAmount !== undefined) {
        updateData.minimumOrderAmount = data.minimumOrderAmount;
      }
      if (data.maximumDiscountAmount !== null && data.maximumDiscountAmount !== undefined) {
        updateData.maximumDiscountAmount = data.maximumDiscountAmount;
      }
      if (data.usageLimit !== null && data.usageLimit !== undefined) {
        updateData.usageLimit = data.usageLimit;
      }
      if (data.usageLimitPerUser !== null && data.usageLimitPerUser !== undefined) {
        updateData.usageLimitPerUser = data.usageLimitPerUser;
      }
      if (data.validUntil) {
        updateData.validUntil = data.validUntil.toISOString();
      }

      await updateDiscount.mutateAsync({
        discountId: discount.id,
        data: updateData
      });
      
      handleClose();
      // Toast is already shown by the hook
    } catch (error: any) {
      // Error toast is already shown by the hook
      console.error('Failed to update discount:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Discount Code: {discount.discountCode}
          </DialogTitle>
        </DialogHeader>

        {hasBeenUsed && (
          <Alert className="border-orange-200 bg-background">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              This discount code has been used {discount.currentUsageCount} times. 
              Some fields are restricted to prevent issues with existing orders.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Basic Information */}
              <div className="space-y-4 p-4 bg-background rounded-lg">
                <h3 className="text-lg font-medium text-primary">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="publicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the discount and any terms..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Enable or disable this discount code
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Discount Configuration */}
              <div className="space-y-4 p-4 bg-background rounded-lg">
                <h3 className="text-lg font-medium text-primary">Discount Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={hasBeenUsed}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
                            <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                          </SelectContent>
                        </Select>
                        {hasBeenUsed && (
                          <FormDescription className="text-orange-600">
                            Cannot change type after code has been used
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            min="0"
                            max={discountType === 'PERCENTAGE' ? 100 : undefined}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={discountType === 'FREE_SHIPPING' || hasBeenUsed}
                          />
                        </FormControl>
                        <FormDescription>
                          {discountType === 'PERCENTAGE' && 'Enter percentage (0-100)'}
                          {discountType === 'FIXED_AMOUNT' && 'Enter amount in rupees'}
                          {discountType === 'FREE_SHIPPING' && 'Free shipping has no value'}
                          {hasBeenUsed && ' (Cannot change after use)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-3  rounded border">
                  <div className="text-sm text-gray-600">
                    <strong>Code:</strong> <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {discount.discountCode}
                    </code>
                    <div className="text-xs text-gray-500 mt-1">
                      Discount codes cannot be changed after creation
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="space-y-4 p-4 bg-background rounded-lg">
                <h3 className="text-lg font-medium text-primary">Usage Limits & Restrictions</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimumOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500"
                            min="0"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Leave empty for no minimum
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maximumDiscountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Cap</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            min="0"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            disabled={discountType !== 'PERCENTAGE'}
                          />
                        </FormControl>
                        <FormDescription>
                          For percentage discounts only (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Usage Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            min={discount.currentUsageCount || 1}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : null;
                              // Ensure value is not less than current usage
                              if (value !== null && hasBeenUsed && value < discount.currentUsageCount) {
                                return;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Current usage: {discount.currentUsageCount}
                          {hasBeenUsed && ' (Cannot set below current usage)'}
                          {!hasBeenUsed && ' (Leave empty for unlimited)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usageLimitPerUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit Per User</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Leave empty for unlimited per user
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>No expiry date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={(date) => {
                              field.onChange(date ?? null);
                              setIsCalendarOpen(false);
                            }}
                            disabled={(date) => {
                              // Disable dates before today (but allow today)
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                          {field.value && (
                            <div className="p-3 border-t">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  field.onChange(null);
                                  setIsCalendarOpen(false);
                                }}
                                className="w-full"
                              >
                                Clear date
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave empty for no expiry
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={updateDiscount.isPending}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateDiscount.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateDiscount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {updateDiscount.isPending ? 'Updating...' : 'Update Discount Code'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
