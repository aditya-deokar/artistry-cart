// stores/product-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ProductFormValues } from '@/lib/validations/product'

interface ProductStore {
  // Form data - use the exact type from Zod schema
  formData: ProductFormValues
  
  // UI states
  isLoading: boolean
  currentStep: number
  errors: Record<string, string>
  
  // Categories data
  categories: string[]
  subCategories: Record<string, string[]>
  
  // Actions
  updateFormData: (data: Partial<ProductFormValues>) => void
  setLoading: (loading: boolean) => void
  setCurrentStep: (step: number) => void
  setErrors: (errors: Record<string, string>) => void
  setCategories: (categories: string[], subCategories: Record<string, string[]>) => void
  resetForm: () => void
  generateSlug: (title: string) => void
}

const initialFormData: ProductFormValues = {
  title: '',
  description: '',
  detailed_description: '',
  warranty: '',
  custom_specifications: {},
  slug: '',
  tags: [],
  cash_on_delivery: true,
  brand: '',
  video_url: '',
  category: '',
  subCategory: '',
  colors: [],
  sizes: [],
  discountCodes: '',
  stock: 0,
  sale_price: undefined,
  regular_price: 0,
  customProperties: {},
  images: [],
  status: 'Active'
}

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      formData: initialFormData,
      isLoading: false,
      currentStep: 1,
      errors: {},
      categories: [],
      subCategories: {},

      // Actions
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data }
        }), false, 'updateFormData'),

      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'setLoading'),

      setCurrentStep: (step) =>
        set({ currentStep: step }, false, 'setCurrentStep'),

      setErrors: (errors) =>
        set({ errors }, false, 'setErrors'),

      setCategories: (categories, subCategories) =>
        set({ categories, subCategories }, false, 'setCategories'),

      resetForm: () =>
        set({ 
          formData: initialFormData, 
          errors: {},
          currentStep: 1 
        }, false, 'resetForm'),

      generateSlug: (title) => {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        set((state) => ({
          formData: { ...state.formData, slug }
        }), false, 'generateSlug')
      }
    }),
    { name: 'product-store' }
  )
)
