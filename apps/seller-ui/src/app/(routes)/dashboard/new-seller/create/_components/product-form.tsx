// components/product/product-form.tsx
'use client'

import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useCreateProduct } from '@/hooks/use-product-mutations'
import { productFormSchema, type ProductFormValues } from '@/lib/validations/product'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Eye, FileText, Camera, Package, DollarSign, Settings, Loader2 } from 'lucide-react'


import { useProductStore } from '@/store/product-strore'
import { BasicInfoSection } from './sections/basic-info-section'
import { MediaSection } from './sections/media-section'
import { CategorySection } from './sections/category-section'
import { PricingSection } from './sections/pricing-section'
import { InventorySection } from './sections/inventory-section'
import { SettingsSection } from './sections/settings-section'


export function ProductForm() {
  const { formData, setErrors } = useProductStore()
  const createProductMutation = useCreateProduct()
  const [activeTab, setActiveTab] = useState('basic')

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: formData,
    mode: 'onChange'
  })

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    try {
      setErrors({})
      console.log('Submitting form with values:', values)
      await createProductMutation.mutateAsync(values)
    } catch (error: any) {
      console.error('Form submission error:', error)
      if (error.response?.data?.errors) {
        const formErrors: Record<string, string> = {}
        if (error.response.data.errors.issues) {
          error.response.data.errors.issues.forEach((issue: any) => {
            if (issue.path && issue.path[0]) {
              formErrors[issue.path[0]] = issue.message
            }
          })
        }
        setErrors(formErrors)
      }
    }
  }

  const handleDraftSave = () => {
    form.setValue('status', 'Draft')
    form.handleSubmit(onSubmit)()
  }

  const handlePendingSubmit = () => {
    form.setValue('status', 'Pending')
    form.handleSubmit(onSubmit)()
  }

  const handlePublish = () => {
    form.setValue('status', 'Active')
    form.handleSubmit(onSubmit)()
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'category', label: 'Category', icon: Package },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="basic">
              <BasicInfoSection form={form} />
            </TabsContent>

            <TabsContent value="media">
              <MediaSection form={form} />
            </TabsContent>

            <TabsContent value="category">
              <CategorySection form={form} />
            </TabsContent>

            <TabsContent value="pricing">
              <PricingSection form={form} />
            </TabsContent>

            <TabsContent value="inventory">
              <InventorySection form={form} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsSection form={form} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDraftSave}
              disabled={createProductMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {/* Preview logic */}}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={createProductMutation.isPending}
              onClick={handlePendingSubmit}
              variant="secondary"
            >
              {createProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Submit for Review
            </Button>
            
            <Button
              type="button"
              disabled={createProductMutation.isPending}
              onClick={handlePublish}
            >
              {createProductMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Publish Product
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
