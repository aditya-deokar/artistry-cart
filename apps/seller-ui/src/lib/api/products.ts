// lib/api/products.ts


import axiosInstance from "@/utils/axiosinstance"


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
}

// Product API functions
export const productApi = {
  // Get categories
  getCategories: async (): Promise<CategoryData> => {
    const { data } = await axiosInstance.get<ApiResponse<CategoryData>>('/product/api/categories')
    return data.data!
  },

  // Upload product image
  uploadImage: async (fileName: string): Promise<ImageUploadResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<ImageUploadResponse>>('/product/api/images/upload', {
      fileName
    })
    return data.data!
  },

  // Delete product image
  deleteImage: async (fileId: string): Promise<void> => {
    await axiosInstance.delete('/product/api/images/delete', {
      data: { fileId }
    })
  },

  // Create product
  createProduct: async (productData: ProductForm): Promise<any> => {
    const { data } = await axiosInstance.post<ApiResponse>('/product/api/products', productData)
    return data.data
  },

  // Validate coupon
  validateCoupon: async (couponCode: string): Promise<any> => {
    const { data } = await axiosInstance.post<ApiResponse>('/product/api/coupon/validate', {
      couponCode
    })
    return data.data
  }
}
