// components/dashboard/products/ProductInventory.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ProductInventory() {
  const form = useFormContext();
  const stock = form.watch('stock');
  const trackQuantity = form.watch('trackQuantity') ?? true;
  const allowBackorders = form.watch('allowBackorders') ?? false;
  const lowStockThreshold = form.watch('lowStockThreshold') ?? 5;

  const getStockStatus = () => {
    if (!trackQuantity) return { status: 'untracked', color: 'secondary', icon: Package };
    if (stock === 0) return { status: 'out-of-stock', color: 'destructive', icon: AlertTriangle };
    if (stock <= lowStockThreshold) return { status: 'low-stock', color: 'warning', icon: AlertTriangle };
    return { status: 'in-stock', color: 'success', icon: CheckCircle };
  };

  const stockStatus = getStockStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Tracking */}
        <FormField
          control={form.control}
          name="trackQuantity"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel>Track Quantity</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Enable inventory tracking for this product
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

        {trackQuantity && (
          <div className="space-y-4">
            {/* Current Stock */}
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Stock Quantity
                    <Badge 
                      variant={stockStatus.color as any}
                      className="flex items-center gap-1"
                    >
                      <stockStatus.icon className="h-3 w-3" />
                      {stockStatus.status.replace('-', ' ')}
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Low Stock Threshold */}
            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Alert</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="5"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Get notified when stock falls below this number
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., PROD-001"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Unique identifier for inventory management
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Barcode */}
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 123456789012"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Stock Behavior */}
        <div className="space-y-4">
          <h4 className="font-medium">Stock Behavior</h4>
          
          <FormField
            control={form.control}
            name="allowBackorders"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Allow Backorders</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to purchase when out of stock
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

          {allowBackorders && (
            <FormField
              control={form.control}
              name="backorderMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backorder Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Available on backorder"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Message shown to customers when backordering
                  </p>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="stockStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="on-backorder">On Backorder</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Inventory Summary */}
        {trackQuantity && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Inventory Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current Stock:</span>
                <div className="font-medium">{stock} units</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className={`font-medium ${
                  stockStatus.status === 'in-stock' ? 'text-green-600' :
                  stockStatus.status === 'low-stock' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {stockStatus.status.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
