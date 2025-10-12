// components/product/sections/media-section.tsx
'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ProductFormValues } from '@/lib/validations/product'
import { useImageUpload, useImageDelete } from '@/hooks/use-product-mutations'
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
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Video, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface MediaSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function MediaSection({ form }: MediaSectionProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const imageUploadMutation = useImageUpload()
  const imageDeleteMutation = useImageDelete()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const currentImages = form.getValues('images')
    
    for (const file of acceptedFiles) {
      // Convert file to base64 for upload
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result as string
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
          
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: Math.min(prev[file.name] + 10, 90)
            }))
          }, 100)

          const result = await imageUploadMutation.mutateAsync(base64)
          
          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

          // Add to form
          form.setValue('images', [
            ...currentImages,
            { url: result.file_url, file_id: result.file_id }
          ])

          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[file.name]
              return newProgress
            })
          }, 1000)

        } catch (error) {
          toast.error(`Failed to upload ${file.name}`)
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[file.name]
            return newProgress
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }, [form, imageUploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  })

  const removeImage = async (index: number, fileId: string) => {
    try {
      await imageDeleteMutation.mutateAsync(fileId)
      const currentImages = form.getValues('images')
      form.setValue('images', currentImages.filter((_, i) => i !== index))
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const images = form.watch('images')

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Images *</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium mb-2">
                        {isDragActive
                          ? 'Drop the images here...'
                          : 'Drag & drop images here, or click to select'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 5MB each
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Progress */}
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <Card key={fileName}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{fileName}</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </CardContent>
                  </Card>
                ))}

                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <Card key={index} className="relative group">
                        <CardContent className="p-2">
                          <div className="relative aspect-square">
                            <Image
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index, image.file_id)}
                              disabled={imageDeleteMutation.isPending}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          {index === 0 && (
                            <div className="text-xs text-center mt-1 text-muted-foreground">
                              Main Image
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Upload high-quality images of your product. The first image will be the main product image.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Video URL */}
      <FormField
        control={form.control}
        name="video_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Product Video URL
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                {...field}
              />
            </FormControl>
            <FormDescription>
              Optional: Add a video showcasing your product (YouTube, Vimeo, etc.)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
