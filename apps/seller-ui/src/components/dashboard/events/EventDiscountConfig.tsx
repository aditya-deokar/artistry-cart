// components/dashboard/events/EventDiscountConfig.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Percent, DollarSign, Target, TrendingDown, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EventDiscountConfig() {
  const form = useFormContext();
  
  const discountType = form.watch('discount_type');
  const discountValue = form.watch('discount_value');
  const maxDiscount = form.watch('max_discount');
  const minOrderValue = form.watch('min_order_value');

  const getDiscountPreview = () => {
    if (!discountValue) return null;

    const samplePrice = 199.99;
    let discountAmount = 0;
    let finalPrice = samplePrice;

    switch (discountType) {
      case 'PERCENTAGE':
        discountAmount = (samplePrice * discountValue) / 100;
        if (maxDiscount && discountAmount > maxDiscount) {
          discountAmount = maxDiscount;
        }
        finalPrice = samplePrice - discountAmount;
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(discountValue, samplePrice);
        finalPrice = samplePrice - discountAmount;
        break;
      case 'TIERED':
        // Example tiered discount
        if (samplePrice >= (minOrderValue || 0)) {
          discountAmount = (samplePrice * discountValue) / 100;
          finalPrice = samplePrice - discountAmount;
        }
        break;
    }

    return {
      originalPrice: samplePrice,
      discountAmount,
      finalPrice: Math.max(0, finalPrice),
      discountPercent: ((discountAmount / samplePrice) * 100).toFixed(1)
    };
  };

  const preview = getDiscountPreview();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Discount Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Discount Type */}
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Percentage Discount</div>
                            <div className="text-xs text-muted-foreground">
                              e.g., 25% off all products
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Fixed Amount</div>
                            <div className="text-xs text-muted-foreground">
                              e.g., $50 off per product
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="TIERED">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Tiered Discount</div>
                            <div className="text-xs text-muted-foreground">
                              Discount based on order value
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Discount Value */}
          {discountType && (
            <FormField
              control={form.control}
              name="discount_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage' : 
                     discountType === 'FIXED_AMOUNT' ? 'Discount Amount' : 
                     'Discount Percentage'} *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      {discountType === 'PERCENTAGE' || discountType === 'TIERED' ? (
                        <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        type="number"
                        step={discountType === 'PERCENTAGE' || discountType === 'TIERED' ? "1" : "0.01"}
                        min="0"
                        max={discountType === 'PERCENTAGE' || discountType === 'TIERED' ? "100" : undefined}
                        placeholder={
                          discountType === 'PERCENTAGE' ? "25" :
                          discountType === 'FIXED_AMOUNT' ? "50.00" :
                          "20"
                        }
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
          )}

          {/* Maximum Discount (for percentage) */}
          {discountType === 'PERCENTAGE' && (
            <FormField
              control={form.control}
              name="max_discount"
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
                        placeholder="100.00"
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

          {/* Minimum Order Value */}
          <FormField
            control={form.control}
            name="min_order_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Value (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="50.00"
                      className="pl-10"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Customers must spend at least this amount to qualify for the discount
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Additional Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Settings</h4>
            
            <FormField
              control={form.control}
              name="stackable_with_product_discounts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Stack with Product Discounts</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Allow this event discount to combine with individual product sales
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
              name="apply_to_shipping"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Apply to Shipping</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Include shipping costs in discount calculation
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
          </div>
        </CardContent>
      </Card>

      {/* Discount Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discount Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Example Product: Premium Widget</h4>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Original Price:</span>
                  <div className="font-medium">{formatCurrency(preview.originalPrice)}</div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Discount:</span>
                  <div className="font-medium text-green-600">
                    -{formatCurrency(preview.discountAmount)}
                    {discountType === 'PERCENTAGE' && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {preview.discountPercent}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Final Price:</span>
                  <div className="font-bold text-lg text-primary">
                    {formatCurrency(preview.finalPrice)}
                  </div>
                </div>
              </div>
              
              {minOrderValue && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Minimum order value of {formatCurrency(minOrderValue)} required
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discount Guidelines */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Discount Best Practices</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-600 mb-2">✓ Do's</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Set competitive but profitable discounts</li>
                <li>• Use round numbers (25%, 50%, $10)</li>
                <li>• Set minimum order values to increase AOV</li>
                <li>• Test different discount levels</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-red-600 mb-2">✗ Don'ts</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Don't exceed 70% off (seems suspicious)</li>
                <li>• Avoid too many conditions</li>
                <li>• Don't make discounts too complex</li>
                <li>• Avoid discounts that eliminate profit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
