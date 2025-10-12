// components/product/sections/inventory-section.tsx
'use client'

import { UseFormReturn } from 'react-hook-form'
import { ProductFormValues } from '@/lib/validations/product'
import { useState } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Package, Palette } from 'lucide-react'

interface InventorySectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function InventorySection({ form }: InventorySectionProps) {
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')

  const addColor = () => {
    if (newColor.trim() && !form.getValues('colors').includes(newColor.trim())) {
      const currentColors = form.getValues('colors')
      form.setValue('colors', [...currentColors, newColor.trim()])
      setNewColor('')
    }
  }

  const removeColor = (colorToRemove: string) => {
    const currentColors = form.getValues('colors')
    form.setValue('colors', currentColors.filter(color => color !== colorToRemove))
  }

  const addSize = () => {
    if (newSize.trim() && !form.getValues('sizes').includes(newSize.trim())) {
      const currentSizes = form.getValues('sizes')
      form.setValue('sizes', [...currentSizes, newSize.trim()])
      setNewSize('')
    }
  }

  const removeSize = (sizeToRemove: string) => {
    const currentSizes = form.getValues('sizes')
    form.setValue('sizes', currentSizes.filter(size => size !== sizeToRemove))
  }

  const colors = form.watch('colors')
  const sizes = form.watch('sizes')
  const stock = form.watch('stock')

  return (
    <div className="space-y-6">
      {/* Stock Level */}
      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock Quantity *
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
            <FormDescription>
              Number of units available for sale.
            </FormDescription>
            <FormMessage />
            
            {/* Stock Status Indicator */}
            <div className="mt-2">
              <Badge 
                variant={
                  stock === 0 ? 'destructive' : 
                  stock < 10 ? 'secondary' : 
                  'default'
                }
              >
                {stock === 0 ? 'Out of Stock' : 
                 stock < 10 ? 'Low Stock' : 
                 'In Stock'}
              </Badge>
            </div>
          </FormItem>
        )}
      />

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Available Colors
          </CardTitle>
          <CardDescription>
            Add color variants for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new color */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a color (e.g., Red, Blue, #FF0000)"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addColor}
              disabled={!newColor.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Display colors */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {colors.map((color, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ 
                      backgroundColor: color.startsWith('#') ? color : 
                        color.toLowerCase() === 'red' ? '#EF4444' :
                        color.toLowerCase() === 'blue' ? '#3B82F6' :
                        color.toLowerCase() === 'green' ? '#10B981' :
                        color.toLowerCase() === 'yellow' ? '#F59E0B' :
                        color.toLowerCase() === 'purple' ? '#8B5CF6' :
                        color.toLowerCase() === 'pink' ? '#EC4899' :
                        color.toLowerCase() === 'black' ? '#000000' :
                        color.toLowerCase() === 'white' ? '#FFFFFF' :
                        '#9CA3AF'
                    }}
                  />
                  {color}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground ml-1"
                    onClick={() => removeColor(color)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Sizes</CardTitle>
          <CardDescription>
            Add size variants for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new size */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a size (e.g., Small, Medium, XL, 10, 42)"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSize}
              disabled={!newSize.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Display sizes */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {size}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSize(size)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variant Summary */}
      {(colors.length > 0 || sizes.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variant Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{colors.length}</p>
                <p className="text-sm text-muted-foreground">Colors</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{sizes.length}</p>
                <p className="text-sm text-muted-foreground">Sizes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {colors.length * sizes.length || Math.max(colors.length, sizes.length, 1)}
                </p>
                <p className="text-sm text-muted-foreground">Total Variants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
