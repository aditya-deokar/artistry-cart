// components/product/sections/pricing-section.tsx
'use client'

import { UseFormReturn } from 'react-hook-form'
import { ProductFormValues } from '@/lib/validations/product'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Percent } from 'lucide-react'

interface PricingSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function PricingSection({ form }: PricingSectionProps) {
  const regularPrice = form.watch('regular_price')
  const salePrice = form.watch('sale_price')
  
  const discountPercent = salePrice && regularPrice > 0 
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0
    
  const savings = salePrice && regularPrice > 0 ? regularPrice - salePrice : 0

  return (
    <div className="space-y-6">
      {/* Pricing Summary Card */}
      {(regularPrice > 0 || salePrice) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Regular Price</p>
                <p className="text-2xl font-bold">
                  ${regularPrice || 0}
                </p>
              </div>
              
              {salePrice && (
                <>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Sale Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${salePrice}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">You Save</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${savings.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      <Percent className="h-4 w-4 mr-1" />
                      {discountPercent}%
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Price */}
      <FormField
        control={form.control}
        name="regular_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Regular Price *</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
            <FormDescription>
              The original price of your product before any discounts.
            </FormDescription>
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
            <FormLabel>Sale Price (Optional)</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  value={field.value || ''}
                />
              </div>
            </FormControl>
            <FormDescription>
              Optional discounted price. Leave empty if no discount.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price Validation */}
      {salePrice && regularPrice && salePrice >= regularPrice && (
        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Sale price should be lower than regular price to show as a discount.
          </p>
        </div>
      )}
    </div>
  )
}
