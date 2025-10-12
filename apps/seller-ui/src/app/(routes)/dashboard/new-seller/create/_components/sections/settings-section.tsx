// components/product/sections/settings-section.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, CreditCard, Settings, FileText } from 'lucide-react'

interface SettingsSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function SettingsSection({ form }: SettingsSectionProps) {
  const status = form.watch('status')
  const cashOnDelivery = form.watch('cash_on_delivery')

  return (
    <div className="space-y-6">
      {/* Product Status */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Product Status *
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select product status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Active - Visible to customers
                  </div>
                </SelectItem>
                <SelectItem value="Pending">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Pending - Awaiting approval
                  </div>
                </SelectItem>
                <SelectItem value="Draft">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Draft - Not visible to customers
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Control the visibility and availability of your product.
            </FormDescription>
            <FormMessage />
            
            {/* Status Badge */}
            <div className="mt-2">
              <Badge 
                variant={
                  status === 'Active' ? 'default' : 
                  status === 'Pending' ? 'secondary' : 
                  'outline'
                }
              >
                {status}
              </Badge>
            </div>
          </FormItem>
        )}
      />

      {/* Cash on Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Options
          </CardTitle>
          <CardDescription>
            Configure payment methods for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="cash_on_delivery"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Cash on Delivery
                  </FormLabel>
                  <FormDescription>
                    Allow customers to pay when the product is delivered
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
          
          {/* Payment Method Summary */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Available Payment Methods:</p>
            <div className="flex gap-2">
              <Badge variant="outline">Online Payment</Badge>
              {cashOnDelivery && <Badge variant="outline">Cash on Delivery</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Specifications
          </CardTitle>
          <CardDescription>
            Add any additional product specifications or custom properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="custom_specifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specifications (JSON format)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"weight": "2kg", "dimensions": "30x20x15cm", "material": "Cotton"}'
                    className="min-h-[120px] font-mono text-sm"
                    {...field}
                    value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        field.onChange(parsed)
                      } catch {
                        field.onChange(e.target.value)
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter custom specifications as JSON. Example: {"{"}"weight": "2kg", "material": "Cotton"{"}"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={
                status === 'Active' ? 'default' : 
                status === 'Pending' ? 'secondary' : 
                'outline'
              }>
                {status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Methods</p>
              <p className="font-medium">
                Online{cashOnDelivery ? ' + COD' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
