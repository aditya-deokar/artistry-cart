// components/dashboard/discounts/DiscountConditions.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, DollarSign, Package, Users, ShoppingCart, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { useQuery } from '@tanstack/react-query';
import { getSellerProductsForEvent } from '@/lib/api/events';
import { getCategories } from '@/lib/api/products';
import { MultiSelect } from '@/components/ui/multi-select';

export default function DiscountConditions() {
  const form = useFormContext();
  
  const applicableToAll = form.watch('applicableToAll');
  const minimumOrderAmount = form.watch('minimumOrderAmount');
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue');

  const { data: products } = useQuery({
    queryKey: ['seller-products-simple'],
    queryFn: getSellerProductsForEvent,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Calculate example discount
  const getDiscountExample = () => {
    if (!minimumOrderAmount || !discountValue) return null;
    
    let discountAmount = 0;
    const orderAmount = minimumOrderAmount;
    
    switch (discountType) {
      case 'PERCENTAGE':
        discountAmount = (orderAmount * discountValue) / 100;
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(discountValue, orderAmount);
        break;
      case 'FREE_SHIPPING':
        discountAmount = 10; // Assumed shipping cost
        break;
    }
    
    return {
      orderAmount,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount)
    };
  };

  const example = getDiscountExample();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Discount Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minimum Order Amount */}
          <FormField
            control={form.control}
            name="minimumOrderAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-10"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Customers must spend at least this amount to use the discount
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Maximum Discount Amount */}
          {discountType === 'PERCENTAGE' && (
            <FormField
              control={form.control}
              name="maximumDiscountAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Discount Amount (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="No limit"
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Cap the maximum discount amount for percentage discounts
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Separator />

          {/* Product Applicability */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="applicableToAll"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Apply to All Products</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Discount applies to all products in your store
                    </p>
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

            {!applicableToAll && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Product Selection</h4>
                
                {/* Applicable Categories */}
                <FormField
                  control={form.control}
                  name="applicableCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Categories</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={categoriesData?.categories?.map(cat => ({
                            label: cat,
                            value: cat
                          })) || []}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Applicable Products */}
                <FormField
                  control={form.control}
                  name="applicableProducts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Products</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={products?.map(product => ({
                            label: product.title,
                            value: product.id
                          })) || []}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select specific products"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Excluded Products */}
                <FormField
                  control={form.control}
                  name="excludedProducts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excluded Products</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={products?.map(product => ({
                            label: product.title,
                            value: product.id
                          })) || []}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Exclude specific products"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Products that cannot use this discount
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Customer Restrictions */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Restrictions
            </h4>

            <FormField
              control={form.control}
              name="firstTimeCustomersOnly"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>First-time Customers Only</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Limit discount to new customers
                    </p>
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

            <FormField
              control={form.control}
              name="emailRestrictedDomains"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Domain Restrictions (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., gmail.com, yahoo.com (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Restrict discount to specific email domains
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Discount Example */}
      {example && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discount Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Example Order</h4>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order Amount:</span>
                  <div className="font-medium">{formatCurrency(example.orderAmount)}</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Discount:</span>
                  <div className="font-medium text-green-600">
                    -{formatCurrency(example.discountAmount)}
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Final Amount:</span>
                  <div className="font-bold text-lg text-primary">
                    {formatCurrency(example.finalAmount)}
                  </div>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Customer saves {formatCurrency(example.discountAmount)} on orders of {formatCurrency(example.orderAmount)} or more
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conditions Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Conditions Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {applicableToAll ? 'All Products' : 'Selected Products'}
              </Badge>
              {minimumOrderAmount && (
                <Badge variant="outline" className="text-xs">
                  Min Order: {formatCurrency(minimumOrderAmount)}
                </Badge>
              )}
            </div>
            
            {!applicableToAll && (
              <p className="text-muted-foreground">
                Applies to specific products and categories only
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
