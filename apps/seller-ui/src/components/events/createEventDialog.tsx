'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Info, X, ShoppingCart, Package, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';
import ProductSelectionDialog from './product-selection-dialog';
import { useCreateEventWithProducts } from '@/hooks/useEvents';
import axiosInstance from '@/utils/axiosinstance';

// Event schema with product selection
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  event_type: z.enum(['FLASH_SALE', 'SEASONAL', 'CLEARANCE', 'NEW_ARRIVAL'], {
    error: 'Please select an event type',
  }),
  discount_percent: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%').optional(),
  starting_date: z.date({
    error: 'Start date is required',
  }),
  ending_date: z.date({
    error: 'End date is required',
  }),
  banner_image: z.object({
    url: z.string(),
    file_id: z.string(),
  }).optional(),
  is_active: z.boolean(),
}).refine(data => data.ending_date > data.starting_date, {
  message: "End date must be after start date",
  path: ["ending_date"],
}).refine(data => data.starting_date >= new Date(new Date().setHours(0, 0, 0, 0)), {
  message: "Start date cannot be in the past",
  path: ["starting_date"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventDialog({ isOpen, onClose }: CreateEventDialogProps) {
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const createEvent = useCreateEventWithProducts();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      event_type: 'FLASH_SALE',
      discount_percent: undefined,
      starting_date: undefined,
      ending_date: undefined,
      banner_image: undefined,
      is_active: true, // Default to active
    },
  });

  const selectedEventType = form.watch('event_type');
  const selectedStartDate = form.watch('starting_date');

  // Event type configurations
  const eventTypeConfig = {
    FLASH_SALE: {
      label: 'Flash Sale',
      description: 'Limited time offers with urgent messaging',
      color: 'bg-red-100 text-red-800 border-red-200',
      suggested_discount: 20,
    },
    SEASONAL: {
      label: 'Seasonal',
      description: 'Holiday or season-based promotions',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      suggested_discount: 15,
    },
    CLEARANCE: {
      label: 'Clearance',
      description: 'End-of-season or inventory clearance',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      suggested_discount: 30,
    },
    NEW_ARRIVAL: {
      label: 'New Arrival',
      description: 'Showcase new products and collections',
      color: 'bg-green-100 text-green-800 border-green-200',
      suggested_discount: 10,
    },
  };


  // Convert file to base64 (same as product image upload)
  const convertFileBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      // Convert file to base64
      const image = await convertFileBase64(file);

      // Upload using the same endpoint as product images
      const response = await axiosInstance.post("/product/api/images/upload", { image });

      const uploadedImage = {
        file_id: response.data.data.file_id,
        url: response.data.data.file_url,
      };

      form.setValue('banner_image', uploadedImage);

      toast.success('Banner image uploaded successfully');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeBannerImage = async () => {
    const currentImage = form.getValues('banner_image');
    
    if (!currentImage?.file_id) {
      form.setValue('banner_image', undefined);
      return;
    }

    try {
      // Delete image from server (same as product images)
      await axiosInstance.delete("/product/api/images/delete", {
        data: { fileId: currentImage.file_id },
      });

      form.setValue('banner_image', undefined);
      toast.success('Banner image removed successfully');
    } catch (error: any) {
      console.error('Image deletion error:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const applySuggestedDiscount = () => {
    const config = eventTypeConfig[selectedEventType];
    if (config?.suggested_discount) {
      form.setValue('discount_percent', config.suggested_discount);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      // Validate that at least one product is selected
      if (selectedProductIds.length === 0) {
        toast.error('Please select at least one product for the event');
        return;
      }

      await createEvent.mutateAsync({
        ...data,
        starting_date: data.starting_date.toISOString(),
        ending_date: data.ending_date.toISOString(),
        product_ids: selectedProductIds, // Include selected products
        is_active: data.is_active,
      });

      // Success message is handled by the hook
      // Reset form and state
      form.reset();
      setSelectedProductIds([]);
      setSelectedProducts([]);
      onClose();
    } catch (error: any) {
      // Error message is handled by the hook
      console.error('Failed to create event:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Event</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Information */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-primary">Basic Information</h3>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Summer Art Sale 2025"
                            {...field}
                            className="font-medium"
                          />
                        </FormControl>
                        <FormDescription>
                          Create an engaging title that captures attention
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your event, what makes it special, and what customers can expect..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Event Configuration */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-primary">Event Configuration</h3>

                  <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(eventTypeConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={config.color}>
                                    {config.label}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {config.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedEventType && (
                          <div className="mt-2">
                            <Badge className={eventTypeConfig[selectedEventType].color}>
                              {eventTypeConfig[selectedEventType].label}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              {eventTypeConfig[selectedEventType].description}
                            </p>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage (Optional)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max="100"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          {selectedEventType && eventTypeConfig[selectedEventType].suggested_discount && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={applySuggestedDiscount}
                              className="whitespace-nowrap"
                            >
                              Use {eventTypeConfig[selectedEventType].suggested_discount}%
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          Optional percentage discount to highlight in promotions (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Banner Image */}
                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-medium text-primary">Event Banner (Optional)</h3>

                  <FormField
                    control={form.control}
                    name="banner_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Image</FormLabel>
                        {field.value ? (
                          <div className="relative">
                            <img
                              src={field.value.url}
                              alt="Event banner"
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeBannerImage}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Upload a banner image for your event
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                              }}
                              disabled={uploadingImage}
                              className="hidden"
                              id="banner-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              asChild
                              disabled={uploadingImage}
                            >
                              <label htmlFor="banner-upload" className="cursor-pointer">
                                {uploadingImage ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  'Choose Image'
                                )}
                              </label>
                            </Button>
                          </div>
                        )}
                        <FormDescription>
                          Recommended size: 1200x400px. Supports JPG, PNG, WebP (max 5MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Schedule */}
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-medium text-primary">Event Schedule</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="starting_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date *</FormLabel>
                          <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    <span className="text-foreground">
                                      {format(field.value, 'PPP')}
                                    </span>
                                  ) : (
                                    <span>Pick start date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-auto p-0" 
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                    setIsStartCalendarOpen(false);
                                  }
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                                defaultMonth={field.value}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Event will be active from this date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ending_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date *</FormLabel>
                          <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    <span className="text-foreground">
                                      {format(field.value, 'PPP')}
                                    </span>
                                  ) : (
                                    <span>Pick end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-auto p-0" 
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                    setIsEndCalendarOpen(false);
                                  }
                                }}
                                disabled={(date) => {
                                  const minDate = selectedStartDate || new Date();
                                  return date <= minDate;
                                }}
                                initialFocus
                                defaultMonth={field.value || selectedStartDate}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Event will automatically end on this date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {selectedStartDate && form.watch('ending_date') && (
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600">
                        <strong>Duration:</strong> {' '}
                        {Math.ceil(
                          (form.watch('ending_date').getTime() - selectedStartDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                        )} days
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Selection */}
                {/* Product Selection with Loading */}
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Event Products</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProductSelectionOpen(true)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Select Products ({selectedProductIds.length})
                    </Button>
                  </div>

                  {selectedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {selectedProducts.map((product: any) => (
                        <Card key={product.id} className="relative">
                          <CardContent className="p-3">
                            <img
                              src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                              alt={product.title}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                            <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-600">
                                {product.sale_price ? (
                                  <>
                                    <span className="text-green-600 font-semibold">
                                      ₹{product.sale_price.toLocaleString()}
                                    </span>
                                    <span className="line-through text-gray-400 ml-1">
                                      ₹{product.regular_price.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold">
                                    ₹{product.regular_price.toLocaleString()}
                                  </span>
                                )}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {product.stock} left
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-red-100"
                              onClick={() => {
                                setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : selectedProductIds.length > 0 ? (
                    <div className="flex items-center justify-center py-8 text-center border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                      <div>
                        <Package className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-orange-700 font-medium">Products not found</p>
                        <p className="text-orange-600 text-sm">Some selected products may have been deleted</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">No products selected</p>
                      <p className="text-gray-500 text-sm">
                        Click "Select Products" to add products to this event
                      </p>
                    </div>
                  )}

                  <FormDescription>
                    Selected products will be featured in this event and marked with event dates.
                  </FormDescription>
                </div>

                {/* Info Alert */}
                {/* Active status field */}
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Make this event visible to customers immediately when it starts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    After creating the event, it will be visible to customers once it becomes active.
                    You can always edit the event or add/remove products later.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEvent.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {createEvent.isPending ? 'Creating Event...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog */}
      <ProductSelectionDialog
        isOpen={isProductSelectionOpen}
        onClose={() => setIsProductSelectionOpen(false)}
        selectedProducts={selectedProductIds}
        onProductsChange={setSelectedProductIds}
      />
    </>
  );
}
