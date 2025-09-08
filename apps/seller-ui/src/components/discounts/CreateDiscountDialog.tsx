'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Loader2, Info } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCreateDiscount } from '@/hooks/useDiscounts';

// Fixed schema - make applicableToAll explicitly boolean, not optional with default
const discountSchema = z.object({
  publicName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue: z.number().min(0),
  discountCode: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code too long')
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only'),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validUntil: z.date().optional(),
  applicableToAll: z.boolean(), // Remove .default(true) to fix type issues
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
}).refine(data => {
  if (data.discountType === 'FREE_SHIPPING' && data.discountValue !== 0) {
    return false;
  }
  return true;
}, {
  message: "Free shipping discount value should be 0",
  path: ["discountValue"],
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface CreateDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDiscountDialog({ isOpen, onClose }: CreateDiscountDialogProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const createDiscount = useCreateDiscount();

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      publicName: '',
      description: '',
      discountType: 'PERCENTAGE' as const, // Provide explicit default instead of undefined
      discountValue: 0,
      discountCode: '',
      minimumOrderAmount: undefined,
      maximumDiscountAmount: undefined,
      usageLimit: undefined,
      usageLimitPerUser: undefined,
      validUntil: undefined,
      applicableToAll: true, // This now matches the schema type exactly
    },
  });

  const discountType = form.watch('discountType');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('discountCode', result);
  };

  const onSubmit = async (data: DiscountFormData) => {
    try {
      await createDiscount.mutateAsync({
        ...data,
        validUntil: data.validUntil?.toISOString(),
      });
      
      toast.success('Discount code created successfully!');
      form.reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create discount code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Discount Code</DialogTitle>
        </DialogHeader>

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
                      <FormDescription>
                        This name will be shown to customers
                      </FormDescription>
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
                          value={field.value || ''} // Handle undefined value
                        />
                      </FormControl>
                      <FormMessage />
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
                          onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING') => {
                            field.onChange(value);
                            if (value === 'FREE_SHIPPING') {
                              form.setValue('discountValue', 0);
                            }
                          }} 
                          value={field.value}
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
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            disabled={discountType === 'FREE_SHIPPING'}
                          />
                        </FormControl>
                        <FormDescription>
                          {discountType === 'PERCENTAGE' && 'Enter percentage (0-100)'}
                          {discountType === 'FIXED_AMOUNT' && 'Enter amount in rupees'}
                          {discountType === 'FREE_SHIPPING' && 'Free shipping has no value'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="discountCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Code *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="SUMMER2024" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            className="font-mono"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateRandomCode}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        Use uppercase letters and numbers only. Must be unique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for no minimum
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
                            {...field}
                            value={field.value || ''}
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
                            min="1"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for unlimited uses
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          How many times each user can use this code
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
                        Leave empty for no expiry. Code will be active immediately upon creation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your discount code will be active immediately after creation. You can always edit or deactivate it later from the discount management page.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createDiscount.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createDiscount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {createDiscount.isPending ? 'Creating...' : 'Create Discount Code'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
