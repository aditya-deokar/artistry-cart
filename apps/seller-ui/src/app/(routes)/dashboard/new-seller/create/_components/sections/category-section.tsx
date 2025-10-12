// components/product/sections/category-section.tsx
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
import { useProductStore } from '@/store/product-strore'

interface CategorySectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function CategorySection({ form }: CategorySectionProps) {
  const { categories, subCategories } = useProductStore()
  const selectedCategory = form.watch('category')

  return (
    <div className="space-y-6">
      {/* Category */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value)
                // Reset subcategory when category changes
                form.setValue('subCategory', '')
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Choose the main category that best describes your product.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sub Category */}
      <FormField
        control={form.control}
        name="subCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sub Category *</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!selectedCategory}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sub-category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {selectedCategory && subCategories[selectedCategory] ? (
                  subCategories[selectedCategory].map((subCategory:any) => (
                    <SelectItem key={subCategory} value={subCategory}>
                      {subCategory}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Select a category first
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Choose a more specific sub-category for better discoverability.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
