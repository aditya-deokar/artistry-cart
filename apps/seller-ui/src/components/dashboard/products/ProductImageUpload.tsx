// components/dashboard/products/ProductImageUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { uploadProductImage, deleteProductImage } from '@/lib/api/products';
import { ProductImage } from '@/types/product';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  className?: string;
}

export default function ProductImageUpload({ 
  images, 
  onChange, 
  maxImages = 10,
  className 
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: uploadProductImage,
    onSuccess: (uploadedImage) => {
      onChange([...images, uploadedImage]);
      toast.success('Image uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload image');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: () => {
      toast.success('Image deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete image');
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        await uploadMutation.mutateAsync(file);
      }
    } finally {
      setUploading(false);
    }
  }, [images.length, maxImages, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: uploading || images.length >= maxImages
  });

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      await deleteMutation.mutateAsync(imageToRemove.file_id);
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                uploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              
              {uploading ? (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              ) : isDragActive ? (
                <p className="text-sm text-muted-foreground">Drop images here...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG, WEBP (Max {maxImages} images)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={`${image.file_id}-${index}`} className="group relative">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  
                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                  
                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Move Buttons */}
                  <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveImage(index, index - 1)}
                      >
                        ←
                      </Button>
                    )}
                    {index < images.length - 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveImage(index, index + 1)}
                      >
                        →
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Image {index + 1}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
