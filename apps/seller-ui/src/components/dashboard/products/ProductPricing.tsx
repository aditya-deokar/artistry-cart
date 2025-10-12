// components/dashboard/products/ProductPricing.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';

export default function ProductPricing() {
  const form = useFormContext();
  const regularPrice = form.watch('regular_price');
  const salePrice = form.watch('sale_price');
  
  const discountPercent = salePrice && regularPrice > salePrice 
    ? ((regularPrice - salePrice) / regularPrice * 100).toFixed(1)
    : 0;

  const savings = salePrice && regularPrice > salePrice 
    ? regularPrice - salePrice 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regular Price */}
          <FormField
            control={form.control}
            name="regular_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regular Price *</FormLabel>
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
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Price */}
          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Summary */}
        {regularPrice > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Pricing Summary</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Regular Price:</span>
                <div className="font-medium">{formatCurrency(regularPrice)}</div>
              </div>
              
              {salePrice && (
                <div>
                  <span className="text-muted-foreground">Sale Price:</span>
                  <div className="font-medium text-green-600">{formatCurrency(salePrice)}</div>
                </div>
              )}
              
              {savings > 0 && (
                <div>
                  <span className="text-muted-foreground">Customer Saves:</span>
                  <div className="font-medium text-green-600">{formatCurrency(savings)}</div>
                </div>
              )}
              
              {discountPercent > 0 && (
                <div>
                  <span className="text-muted-foreground">Discount:</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-green-600">
                      <Percent className="h-3 w-3 mr-1" />
                      {discountPercent}% OFF
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tax Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Tax & Fee Settings</h4>
          
          <FormField
            control={form.control}
            name="taxable"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Charge tax on this product</FormLabel>
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
            name="cash_on_delivery"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Accept Cash on Delivery</FormLabel>
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

        {/* Pricing Validation */}
        {salePrice && regularPrice && salePrice >= regularPrice && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">
              ⚠️ Sale price should be lower than regular price
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
