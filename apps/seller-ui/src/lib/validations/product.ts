// lib/validations/product.ts
import { z } from 'zod'

export const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  detailed_description: z.string().min(1, 'Detailed description is required'),
  warranty: z.string().optional().or(z.literal('')),
  custom_specifications: z.any().optional(),
  slug: z.string().min(1, 'Slug is required'),
  tags: z.array(z.string()).default([]),
  cash_on_delivery: z.boolean().default(true),
  brand: z.string().optional().or(z.literal('')),
  video_url: z.string().url('Invalid video URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Sub-category is required'),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  discountCodes: z.string().optional().or(z.literal('')),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sale_price: z.number().min(0, 'Sale price cannot be negative').optional(),
  regular_price: z.number().min(0, 'Regular price cannot be negative'),
  customProperties: z.any().default({}),
  images: z.array(z.object({
    url: z.string(),
    file_id: z.string()
  })).min(1, 'At least one image is required'),
  status: z.enum(['Active', 'Pending', 'Draft']).default('Active'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
