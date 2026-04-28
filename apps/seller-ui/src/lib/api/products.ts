// lib/api/products.ts

import axiosInstance from "@/utils/axiosinstance"
import type { Product, ProductFilters, ProductFormData, ProductsResponse } from "@/types/productTypes"

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any
}

export interface CategoryData {
  categories: string[]
  subCategories: Record<string, string[]>
}

export interface ImageUploadResponse {
  file_url: string
  file_id: string
  url?: string
}

export interface GetProductsParams extends ProductFilters {
  search?: string
  page?: number
  limit?: number
}

export const getCategories = async (): Promise<CategoryData> => {
  const { data } = await axiosInstance.get<ApiResponse<CategoryData>>('/product/api/categories')
  return data.data!
}

export const uploadImage = async (fileName: string): Promise<ImageUploadResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<ImageUploadResponse>>('/product/api/images/upload', {
    fileName,
  })
  return {
    file_url: data.data?.file_url ?? data.data?.url ?? '',
    file_id: data.data?.file_id ?? '',
    url: data.data?.url,
  }
}

export const deleteImage = async (fileId: string): Promise<void> => {
  await axiosInstance.delete('/product/api/images/delete', {
    data: { fileId },
  })
}

export const getSellerProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<ProductsResponse>>(
    '/product/api/seller/products',
    { params }
  )
  return data.data!
}

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await axiosInstance.get<ApiResponse<Product>>(`/product/api/product/${id}`)
  return data.data!
}

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const { data } = await axiosInstance.post<ApiResponse<Product>>('/product/api/products', productData)
  return data.data!
}

export const updateProduct = async (
  id: string,
  productData: ProductFormData
): Promise<Product> => {
  const { data } = await axiosInstance.put<ApiResponse<Product>>(`/product/api/products/${id}`, productData)
  return data.data!
}

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/product/api/products/${id}`)
}

export const restoreProduct = async (id: string): Promise<Product> => {
  const { data } = await axiosInstance.put<ApiResponse<Product>>(`/product/api/products/${id}/restore`)
  return data.data!
}

export const bulkUpdateProducts = async (
  ids: string[],
  updates: Partial<Product>
): Promise<void> => {
  await axiosInstance.put('/product/api/products/bulk-update', { ids, updates })
}

export const bulkDeleteProducts = async (ids: string[]): Promise<void> => {
  await axiosInstance.delete('/product/api/products/bulk-delete', { data: { ids } })
}

export const uploadProductImage = async (
  file: File
): Promise<{ url: string; file_id: string }> => {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await axiosInstance.post<ApiResponse<ImageUploadResponse>>(
    '/product/api/images/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )

  return {
    url: data.data?.url ?? data.data?.file_url ?? '',
    file_id: data.data?.file_id ?? '',
  }
}

export const deleteProductImage = async (fileId: string): Promise<void> => {
  await axiosInstance.delete('/product/api/images/delete', {
    data: { fileId, file_id: fileId },
  })
}

export const getProductAnalytics = async (productId: string): Promise<any> => {
  const { data } = await axiosInstance.get<ApiResponse>(`/product/api/products/${productId}/analytics`)
  return data.data
}

export const getProductPricingHistory = async (productId: string): Promise<any[]> => {
  const { data } = await axiosInstance.get<ApiResponse<any[]>>(
    `/product/api/offers/products/${productId}/history`
  )
  return data.data ?? []
}

export const updateProductPricing = async (productId: string, pricingData: any): Promise<any> => {
  const { data } = await axiosInstance.post<ApiResponse>(
    `/product/api/offers/products/${productId}/update`,
    pricingData
  )
  return data.data
}

export const validateCoupon = async (couponCode: string): Promise<any> => {
  const { data } = await axiosInstance.post<ApiResponse>('/product/api/coupon/validate', {
    couponCode,
  })
  return data.data
}

export const productApi = {
  createProduct,
  deleteImage,
  deleteProductImage,
  getCategories,
  uploadImage,
  uploadProductImage,
  validateCoupon,
}
