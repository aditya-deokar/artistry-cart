// hooks/use-product-mutations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productApi, CategoryData, ImageUploadResponse } from '@/lib/api/products'

import { toast } from 'sonner'

// Categories query
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Image upload mutation
export const useImageUpload = () => {
  return useMutation({
    mutationFn: productApi.uploadImage,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    }
  })
}

// Image delete mutation
export const useImageDelete = () => {
  return useMutation({
    mutationFn: productApi.deleteImage,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete image')
    }
  })
}

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: (data) => {
      toast.success('Product created successfully!')
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product')
    }
  })
}

// Coupon validation mutation
export const useCouponValidation = () => {
  return useMutation({
    mutationFn: productApi.validateCoupon,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
    }
  })
}
