// components/dashboard/events/EventProductDiscounts.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Percent, DollarSign, Package, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Image from 'next/image';
import { getEventProductDiscounts, createEventProductDiscount, updateEventProductDiscount, deleteEventProductDiscount } from '@/lib/api/events';
import { formatCurrency } from '@/lib/utils/formatting';
import { EventProductDiscount } from '@/types/event';

interface EventProductDiscountsProps {
  eventId: string;
}

const discountTypes = [
  { value: 'PERCENTAGE', label: 'Percentage Discount', icon: Percent },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount Off', icon: DollarSign },
  { value: 'SPECIAL_PRICE', label: 'Special Price', icon: Target },
  { value: 'BUY_X_GET_Y', label: 'Buy X Get Y', icon: Package },
];

export default function EventProductDiscounts({ eventId }: EventProductDiscountsProps) {
  const [selectedDiscount, setSelectedDiscount] = useState<EventProductDiscount | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['event-product-discounts', eventId],
    queryFn: () => getEventProductDiscounts(eventId),
  });

  const form = useForm({
    defaultValues: {
      productId: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      maxDiscount: null,
      specialPrice: null,
      minQuantity: 1,
      maxQuantity: null,
      priority: 1,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createEventProductDiscount(eventId, data),
    onSuccess: () => {
      toast.success('Product discount created successfully');
      queryClient.invalidateQueries({ queryKey: ['event-product-discounts', eventId] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error('Failed to create product discount');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateEventProductDiscount(id, data),
    onSuccess: () => {
      toast.success('Product discount updated successfully');
      queryClient.invalidateQueries({ queryKey: ['event-product-discounts', eventId] });
      setIsDialogOpen(false);
      setSelectedDiscount(null);
    },
    onError: () => {
      toast.error('Failed to update product discount');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEventProductDiscount,
    onSuccess: () => {
      toast.success('Product discount deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['event-product-discounts', eventId] });
    },
    onError: () => {
      toast.error('Failed to delete product discount');
    },
  });

  const onSubmit = (data: any) => {
    if (selectedDiscount) {
      updateMutation.mutate({ id: selectedDiscount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (discount: EventProductDiscount) => {
    setSelectedDiscount(discount);
    form.reset({
      productId: discount.productId,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      maxDiscount: discount.maxDiscount,
      specialPrice: discount.specialPrice,
      minQuantity: discount.minQuantity || 1,
      maxQuantity: discount.maxQuantity,
      priority: discount.priority,
      isActive: discount.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (discountId: string) => {
    if (confirm('Are you sure you want to delete this product discount?')) {
      deleteMutation.mutate(discountId);
    }
  };

  const getDiscountDisplay = (discount: EventProductDiscount) => {
    switch (discount.discountType) {
      case 'PERCENTAGE':
        return `${discount.discountValue}% OFF`;
      case 'FIXED_AMOUNT':
        return `${formatCurrency(discount.discountValue)} OFF`;
      case 'SPECIAL_PRICE':
        return `${formatCurrency(discount.specialPrice || 0)}`;
      case 'BUY_X_GET_Y':
        return `Buy ${discount.minQuantity} Get ${discount.discountValue}`;
      default:
        return 'Custom';
    }
  };

  const DiscountForm = () => {
    const discountType = form.watch('discountType');
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* This would be populated with actual products */}
                      <SelectItem value="product-1">Sample Product 1</SelectItem>
                      <SelectItem value="product-2">Sample Product 2</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {discountType !== 'SPECIAL_PRICE' && (
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {discountType === 'PERCENTAGE' ? 'Discount %' : 
                       discountType === 'FIXED_AMOUNT' ? 'Discount Amount' :
                       'Quantity to Get'} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step={discountType === 'PERCENTAGE' ? "1" : "0.01"}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {discountType === 'SPECIAL_PRICE' && (
              <FormField
                control={form.control}
                name="specialPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {discountType === 'PERCENTAGE' && (
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Optional"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Higher priority discounts are applied first
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between pt-6">
                  <FormLabel>Active</FormLabel>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedDiscount(null);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedDiscount ? 'Update Discount' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  if (isLoading) {
    return <div>Loading product discounts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Product-Specific Discounts</h3>
          <p className="text-sm text-muted-foreground">
            Configure unique discounts for individual products in this event
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDiscount ? 'Edit Product Discount' : 'Add Product Discount'}
              </DialogTitle>
            </DialogHeader>
            <DiscountForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Discounts Table */}
      {discounts && discounts.length > 0 ? (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Discount Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Quantity Range</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Product image would go here */}
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div>
                          <p className="font-medium">Product Name</p>
                          <p className="text-xs text-muted-foreground">SKU-123</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discount.discountType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {getDiscountDisplay(discount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {discount.minQuantity}-{discount.maxQuantity || '∞'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{discount.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={discount.isActive ? 'default' : 'secondary'}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(discount)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(discount.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Product Discounts</h3>
            <p className="text-muted-foreground mb-6">
              Add specific discounts for individual products in this event
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Product Discount
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
