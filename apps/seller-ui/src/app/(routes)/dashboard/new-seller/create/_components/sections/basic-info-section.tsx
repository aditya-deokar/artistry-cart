// components/product/sections/basic-info-section.tsx
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'
import { useProductStore } from '@/store/product-strore'

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { generateSlug } = useProductStore()
  const [newTag, setNewTag] = useState('')

  const handleTitleChange = (title: string) => {
    form.setValue('title', title)
    generateSlug(title)
  }

  const addTag = () => {
    if (newTag.trim() && !form.getValues('tags').includes(newTag.trim())) {
      const currentTags = form.getValues('tags')
      form.setValue('tags', [...currentTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Title *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter product title"
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  handleTitleChange(e.target.value)
                }}
              />
            </FormControl>
            <FormDescription>
              A clear and descriptive title for your product.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Slug *</FormLabel>
            <FormControl>
              <Input
                placeholder="product-slug"
                {...field}
              />
            </FormControl>
            <FormDescription>
              URL-friendly version of the title. Auto-generated from title.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Brand */}
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter brand name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of your product"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              A brief overview of your product (will be shown in product listings).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Detailed Description */}
      <FormField
        control={form.control}
        name="detailed_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detailed Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detailed description with features, specifications, usage instructions, etc."
                className="min-h-[200px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Comprehensive product information, features, and specifications.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags */}
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="space-y-3">
              {/* Add new tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display tags */}
              <div className="flex flex-wrap gap-2">
                {field.value.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            <FormDescription>
              Add relevant tags to help customers find your product.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Warranty */}
      <FormField
        control={form.control}
        name="warranty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Warranty Information</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Warranty details, terms, and conditions"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Warranty terms and conditions for this product.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
