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
import { toast } from 'sonner';
import { useUpdateDiscount } from '@/hooks/useDiscounts';

const editDiscountSchema = z.object({
  publicName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue: z.number().min(0),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validUntil: z.date().optional(),
  isActive: z.boolean(),
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
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

  const form = useForm<EditDiscountFormData>({
    resolver: zodResolver(editDiscountSchema),
    defaultValues: {
      publicName: discount.publicName,
      description: discount.description || '',
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minimumOrderAmount: discount.minimumOrderAmount,
      maximumDiscountAmount: discount.maximumDiscountAmount,
      usageLimit: discount.usageLimit,
      usageLimitPerUser: discount.usageLimitPerUser,
      validUntil: discount.validUntil ? new Date(discount.validUntil) : undefined,
      isActive: discount.isActive,
    },
  });

  useEffect(() => {
    if (discount) {
      form.reset({
        publicName: discount.publicName,
        description: discount.description || '',
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        minimumOrderAmount: discount.minimumOrderAmount,
        maximumDiscountAmount: discount.maximumDiscountAmount,
        usageLimit: discount.usageLimit,
        usageLimitPerUser: discount.usageLimitPerUser,
        validUntil: discount.validUntil ? new Date(discount.validUntil) : undefined,
        isActive: discount.isActive,
      });
    }
  }, [discount, form]);

  const discountType = form.watch('discountType');
  const hasBeenUsed = discount.currentUsageCount > 0;

  const onSubmit = async (data: EditDiscountFormData) => {
    try {
      await updateDiscount.mutateAsync({
        discountId: discount.id,
        data: {
          ...data,
          validUntil: data.validUntil?.toISOString(),
        }
      });
      
      toast.success('Discount code updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update discount code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
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
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            disabled={discountType !== 'PERCENTAGE'}
                          />
                        </FormControl>
                        <FormDescription>
                          For percentage discounts only
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
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Current usage: {discount.currentUsageCount}
                          {hasBeenUsed && ' (Cannot set below current usage)'}
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
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
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
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setIsCalendarOpen(false);
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
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
              <Button type="button" variant="outline" onClick={onClose}>
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
