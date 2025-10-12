// app/seller/products/create/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useCategories, useCreateProduct } from '@/hooks/use-product-mutations'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useProductStore } from '@/store/product-strore'
import { ProductForm } from './_components/product-form'

export default function CreateProductPage() {
  const router = useRouter()
  const { setCategories, resetForm } = useProductStore()
  
  // Queries and mutations
  const { data: categoryData, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const createProductMutation = useCreateProduct()

  // Load categories on mount
  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.categories, categoryData.subCategories)
    }
  }, [categoryData, setCategories])

  // Reset form on mount
  useEffect(() => {
    resetForm()
  }, [resetForm])

  // Handle successful product creation
  useEffect(() => {
    if (createProductMutation.isSuccess) {
      router.push('/seller/products')
    }
  }, [createProductMutation.isSuccess, router])

  if (categoriesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (categoriesError) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load categories. Please refresh the page to try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
          <p className="text-muted-foreground mt-2">
            Add a new product to your store with detailed information and images.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Fill in the details below to create your product listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
