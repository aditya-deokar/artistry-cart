'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Upload, X, ArrowLeft, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/utils/axiosinstance';
import ProductSelectionDialog from '@/components/events/product-selection-for-create';

// Image object type
type BannerImage = {
  url: string;
  file_id: string;
} | null;

// Simple event schema - banner_image is truly optional now
const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  event_type: z.string().min(1, 'Event type is required'),
  starting_date: z.string().min(1, 'Start date is required'),
  ending_date: z.string().min(1, 'End date is required'),
  discount_percent: z.number().optional(),
  banner_image: z.object({
    url: z.string(),
    file_id: z.string()
  }).optional().nullable(),
  is_active: z.boolean(),
  product_ids: z.array(z.string()),
});

type EventFormData = {
  title: string;
  description: string;
  event_type: string;
  starting_date: string;
  ending_date: string;
  discount_percent?: number;
  banner_image?: BannerImage;
  is_active: boolean;
  product_ids: string[];
};

const eventTypes = [
  { value: 'FLASH_SALE', label: 'Flash Sale', suggested: 30 },
  { value: 'SEASONAL', label: 'Seasonal Event', suggested: 25 },
  { value: 'CLEARANCE', label: 'Clearance', suggested: 50 },
  { value: 'NEW_ARRIVAL', label: 'New Arrival', suggested: 15 },
];

interface Product {
  id: string;
  title: string;
  regular_price: number;
  sale_price?: number;
  current_price: number;
  stock_quantity: number;
  images?: Array<{ url: string }>;
  category?: { name: string };
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      event_type: '',
      starting_date: '',
      ending_date: '',
      is_active: true,
      product_ids: [],
      discount_percent: 0,
      banner_image: null,
    },
  });

  const { register, watch, setValue, formState: { errors } } = form;

  const selectedEventType = watch('event_type');
  const isActive = watch('is_active');

  // Convert file to base64 (same as product image upload)
  const convertFileBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Convert file to base64
      const fileName = await convertFileBase64(file);

      // Upload using the same endpoint as product images
      const response = await axiosInstance.post("/product/api/images/upload", { fileName });

      const uploadedImage = {
        file_id: response.data.data.file_id,
        url: response.data.data.file_url,
      };

      setValue('banner_image', uploadedImage);
      setBannerPreview(response.data.data.file_url);

      toast.success('Banner image uploaded successfully');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove banner image
  const removeBannerImage = async () => {
    const currentImage = watch('banner_image');
    
    if (!currentImage?.file_id) {
      setValue('banner_image', null);
      setBannerPreview('');
      return;
    }

    try {
      // Delete image from server (same as product images)
      await axiosInstance.delete("/product/api/images/delete", {
        data: { fileId: currentImage.file_id },
      });

      setValue('banner_image', null);
      setBannerPreview('');
      toast.success('Banner image removed successfully');
    } catch (error: any) {
      console.error('Image deletion error:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  // Apply suggested discount
  const applySuggestedDiscount = () => {
    const type = eventTypes.find((t) => t.value === selectedEventType);
    if (type?.suggested) {
      setValue('discount_percent', type.suggested);
      toast.success(`Applied ${type.suggested}% discount`);
    }
  };

  // Handle product selection
  const handleProductsSelected = (products: Product[], productIds: string[]) => {
    setSelectedProducts(products);
    setValue('product_ids', productIds);
  };

  // Remove a single product
  const removeProduct = (productId: string) => {
    const updatedProducts = selectedProducts.filter((p) => p.id !== productId);
    const updatedIds = updatedProducts.map((p) => p.id);
    setSelectedProducts(updatedProducts);
    setValue('product_ids', updatedIds);
  };

  // Submit form
  const onSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true);

      // Validate products
      if (data.product_ids.length === 0) {
        toast.error('Please select at least one product for this event');
        setIsLoading(false);
        return;
      }

      // Validate dates
      const startDate = new Date(data.starting_date);
      const endDate = new Date(data.ending_date);

      if (endDate <= startDate) {
        toast.error('End date must be after start date');
        setIsLoading(false);
        return;
      }

      // Create event - only include banner_image if it exists
      const eventData: any = {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        starting_date: startDate.toISOString(),
        ending_date: endDate.toISOString(),
        product_ids: data.product_ids,
        is_active: data.is_active,
      };

      // Only add optional fields if they have values
      if (data.discount_percent && data.discount_percent > 0) {
        eventData.discount_percent = data.discount_percent;
      }
      
      // Only include banner_image if it exists and has valid data
      if (data.banner_image && data.banner_image.url && data.banner_image.file_id) {
        eventData.banner_image = {
          url: data.banner_image.url,
          file_id: data.banner_image.file_id
        };
      }

      console.log('Submitting event data:', eventData); // Debug log

      const response = await axiosInstance.post('/product/api/events/with-products', eventData);

      if (response.data) {
        toast.success('Event created successfully!');
        router.push('/dashboard/events');
      }
    } catch (error: any) {
      console.error('Create event error:', error);
      console.error('Error response:', error.response?.data); // Debug detailed error
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/events')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Fill in the details to create a promotional event for your products</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Information (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Art Sale 2025"
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  rows={4}
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="event_type">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('event_type', value)}>
                  <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} (Suggested: {type.suggested}% off)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.event_type && (
                  <p className="text-sm text-red-500">{errors.event_type.message}</p>
                )}
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="discount_percent">Discount Percentage (Optional)</Label>
                  {selectedEventType && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applySuggestedDiscount}
                    >
                      Apply Suggested Discount
                    </Button>
                  )}
                </div>
                <Input
                  id="discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  {...register('discount_percent', { valueAsNumber: true })}
                />
                {errors.discount_percent && (
                  <p className="text-sm text-red-500">{errors.discount_percent.message}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-sm text-gray-500">
                    Make this event active immediately
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
            </CardContent>
              </Card>

              {/* Date Selection */}
              <Card>
            <CardHeader>
              <CardTitle>Event Duration</CardTitle>
              <CardDescription>Set the start and end dates for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="starting_date">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="starting_date"
                    type="date"
                    min={today}
                    {...register('starting_date')}
                    className={errors.starting_date ? 'border-red-500' : ''}
                  />
                  {errors.starting_date && (
                    <p className="text-sm text-red-500">{errors.starting_date.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="ending_date">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ending_date"
                    type="date"
                    min={watch('starting_date') || today}
                    {...register('ending_date')}
                    className={errors.ending_date ? 'border-red-500' : ''}
                  />
                  {errors.ending_date && (
                    <p className="text-sm text-red-500">{errors.ending_date.message}</p>
                  )}
                </div>
              </div>

              {/* Duration Display */}
              {watch('starting_date') && watch('ending_date') && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Duration:</strong>{' '}
                    {Math.ceil(
                      (new Date(watch('ending_date')).getTime() -
                        new Date(watch('starting_date')).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                </div>
              )}
            </CardContent>
              </Card>

              {/* Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Products</CardTitle>
                  <CardDescription>
                    Select products to include in this promotional event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-2 border-dashed hover:border-primary hover:bg-primary/5"
                    onClick={() => setIsProductDialogOpen(true)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="font-medium">Add Products</span>
                      <span className="text-xs text-gray-500">
                        {selectedProducts.length > 0
                          ? `${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} selected`
                          : 'Click to select products'}
                      </span>
                    </div>
                  </Button>
                  {errors.product_ids && (
                    <p className="text-sm text-red-500 mt-2">{errors.product_ids.message}</p>
                  )}

                  {/* Selected Products List */}
                  {selectedProducts.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <img
                            src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.sale_price ? (
                                <>
                                  <span className="text-xs font-semibold text-green-600">
                                    ₹{product.sale_price.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{product.regular_price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-semibold">
                                  ₹{product.regular_price.toLocaleString()}
                                </span>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                Stock: {product.stock_quantity}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => removeProduct(product.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary & Banner (1/3 width) */}
            <div className="space-y-6">
              {/* Banner Image */}
              <Card>
            <CardHeader>
              <CardTitle>Banner Image (Optional)</CardTitle>
              <CardDescription>Upload a banner image for your event</CardDescription>
            </CardHeader>
            <CardContent>
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeBannerImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <Label
                    htmlFor="banner_upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Click to upload banner image
                  </Label>
                  <Input
                    id="banner_upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                </div>
              )}
              </CardContent>
              </Card>

              {/* Event Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Summary</CardTitle>
                  <CardDescription>Quick overview of your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watch('title') && (
                    <div>
                      <p className="text-xs text-gray-500">Event Title</p>
                      <p className="text-sm font-medium">{watch('title')}</p>
                    </div>
                  )}
                  
                  {watch('event_type') && (
                    <div>
                      <p className="text-xs text-gray-500">Event Type</p>
                      <p className="text-sm font-medium">
                        {eventTypes.find(t => t.value === watch('event_type'))?.label}
                      </p>
                    </div>
                  )}

                  {watch('discount_percent') && (watch('discount_percent') || 0) > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Discount</p>
                      <p className="text-sm font-medium text-green-600">{watch('discount_percent')}% OFF</p>
                    </div>
                  )}

                  {watch('starting_date') && watch('ending_date') && (
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium">
                        {Math.ceil(
                          (new Date(watch('ending_date')).getTime() -
                            new Date(watch('starting_date')).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </p>
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Products</p>
                      <p className="text-sm font-medium">
                        {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/events')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Product Selection Dialog */}
        <ProductSelectionDialog
          isOpen={isProductDialogOpen}
          onClose={() => setIsProductDialogOpen(false)}
          selectedProductIds={watch('product_ids')}
          onProductsSelected={handleProductsSelected}
        />
      </div>
    </div>
  );
}
