'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  PackagePlus,
} from 'lucide-react';

import EventProductSelector from '@/components/dashboard/events/EventProductSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  useEvent,
  useSellerProductsForEvent,
  useUpdateEvent,
  useUpdateEventProducts,
} from '@/hooks/useEvents';
import { Event } from '@/types';

const editEventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(500, 'Description too long'),
    event_type: z.enum(['FLASH_SALE', 'SEASONAL', 'CLEARANCE', 'NEW_ARRIVAL']),
    discount_percent: z.number().min(0).max(100).optional(),
    starting_date: z.date({
      error: 'Start date is required',
    }),
    ending_date: z.date({
      error: 'End date is required',
    }),
    is_active: z.boolean(),
  })
  .refine((data) => data.ending_date > data.starting_date, {
    message: 'End date must be after start date',
    path: ['ending_date'],
  });

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EditEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEventDialog({
  event,
  isOpen,
  onClose,
}: EditEventDialogProps) {
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [initialProductIds, setInitialProductIds] = useState<string[]>([]);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  const updateEvent = useUpdateEvent();
  const updateEventProducts = useUpdateEventProducts();
  const { data: eventDetails } = useEvent(event.id);
  const { data: sellerProductsData, isLoading: isSellerProductsLoading } =
    useSellerProductsForEvent(event.shopId, isOpen);

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      discount_percent: event.discount_percent,
      starting_date: new Date(event.starting_date),
      ending_date: new Date(event.ending_date),
      is_active: event.is_active,
    },
  });

  useEffect(() => {
    form.reset({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      discount_percent: event.discount_percent,
      starting_date: new Date(event.starting_date),
      ending_date: new Date(event.ending_date),
      is_active: event.is_active,
    });
  }, [event, form]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const detailedProducts = eventDetails?.products ?? event.products ?? [];
    const ids = detailedProducts.map((product) => product.id);

    setSelectedProducts(ids);
    setInitialProductIds(ids);
  }, [isOpen, event.products, eventDetails?.products]);

  const now = new Date();
  const eventStarted = new Date(event.starting_date) <= now;
  const eventEnded = new Date(event.ending_date) <= now;
  const isActiveWindow =
    new Date(event.starting_date) <= now && new Date(event.ending_date) > now;

  const eventStatus = useMemo(() => {
    if (eventEnded) {
      return { status: 'expired', message: 'This event has already ended.' } as const;
    }
    if (isActiveWindow) {
      return { status: 'active', message: 'This event is currently active.' } as const;
    }
    if (eventStarted) {
      return { status: 'started', message: 'This event has started.' } as const;
    }
    return { status: 'upcoming', message: 'This event is scheduled for the future.' } as const;
  }, [eventEnded, isActiveWindow, eventStarted]);

  const hasProductChanges = useMemo(() => {
    if (selectedProducts.length !== initialProductIds.length) {
      return true;
    }

    const initialSet = new Set(initialProductIds);
    return selectedProducts.some((id) => !initialSet.has(id));
  }, [initialProductIds, selectedProducts]);

  const productLookup = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    const catalogProducts = sellerProductsData?.products ?? [];
    const eventProducts = eventDetails?.products ?? event.products ?? [];

    catalogProducts.forEach((product: any) => {
      map.set(product.id, { id: product.id, title: product.title });
    });

    eventProducts.forEach((product: any) => {
      if (!map.has(product.id)) {
        map.set(product.id, { id: product.id, title: product.title });
      }
    });

    return map;
  }, [event.products, eventDetails?.products, sellerProductsData?.products]);

  const selectedProductPreview = useMemo(() => {
    if (selectedProducts.length === 0) {
      return [] as string[];
    }

    return selectedProducts.slice(0, 5).map((id) => {
      const product = productLookup.get(id);
      return product?.title ?? `Product ${id.slice(0, 6)}…`;
    });
  }, [productLookup, selectedProducts]);

  const isSaving = updateEvent.isPending || updateEventProducts.isPending;

  const onSubmit = async (data: EditEventFormData) => {
    try {
      await updateEvent.mutateAsync({
        eventId: event.id,
        data: {
          ...data,
          starting_date: data.starting_date.toISOString(),
          ending_date: data.ending_date.toISOString(),
        },
      });

      if (hasProductChanges) {
        await updateEventProducts.mutateAsync({
          eventId: event.id,
          productIds: selectedProducts,
        });
      }

      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to update event');
    }
  };

  const hydratedEvent = eventDetails ?? event;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto dark:bg-slate-950 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-slate-100">
            Edit Event: {event.title}
          </DialogTitle>
        </DialogHeader>

        <Alert
          className={cn(
            'flex items-start gap-3 border-l-4 dark:border-l-slate-600',
            eventStatus.status === 'expired' && 'border-red-500 bg-red-50 dark:bg-red-950/30',
            eventStatus.status === 'active' && 'border-green-500 bg-green-50 dark:bg-emerald-950/30',
            eventStatus.status === 'started' && 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
            eventStatus.status === 'upcoming' && 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
          )}
        >
          <Info
            className={cn(
              'mt-1 h-4 w-4',
              eventStatus.status === 'expired' && 'text-red-600',
              eventStatus.status === 'active' && 'text-green-600',
              eventStatus.status === 'started' && 'text-orange-600',
              eventStatus.status === 'upcoming' && 'text-blue-600',
            )}
          />
          <AlertDescription
            className={cn(
              'text-sm',
              eventStatus.status === 'expired' && 'text-red-700 dark:text-red-300',
              eventStatus.status === 'active' && 'text-green-700 dark:text-emerald-300',
              eventStatus.status === 'started' && 'text-orange-700 dark:text-orange-300',
              eventStatus.status === 'upcoming' && 'text-blue-700 dark:text-blue-300',
            )}
          >
            {eventStatus.message}
            {eventStatus.status === 'active' && (
              <span className="mt-1 block text-sm text-muted-foreground dark:text-slate-300">
                Editing a live event will immediately impact customers.
              </span>
            )}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {hydratedEvent.views.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-emerald-400">
              {hydratedEvent.clicks.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Clicks</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Basic Information
                </h3>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Art Sale 2024" {...field} />
                      </FormControl>
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
                          placeholder="Describe your event and what makes it special..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Event Status</FormLabel>
                        <FormDescription>Enable or disable this event</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Event Configuration
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:border-slate-700 dark:bg-slate-900">
                            <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                            <SelectItem value="SEASONAL">Seasonal</SelectItem>
                            <SelectItem value="CLEARANCE">Clearance</SelectItem>
                            <SelectItem value="NEW_ARRIVAL">New Arrival</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20"
                            min="0"
                            max="100"
                            value={field.value ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Optional — enter 0-100</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Schedule</h3>

                {eventStarted && (
                  <Alert className="border-orange-200 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/30">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700 dark:text-orange-300">
                      This event has already started. Changing dates may affect active customers.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0 dark:border-slate-700 dark:bg-slate-900">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsStartCalendarOpen(false);
                              }}
                              disabled={(date) => {
                                if (eventStarted) {
                                  return true;
                                }
                                return date < new Date();
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {eventStarted && (
                          <FormDescription className="text-orange-600 dark:text-orange-300">
                            Cannot change start date after event has started.
                          </FormDescription>
                        )}
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
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0 dark:border-slate-700 dark:bg-slate-900">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsEndCalendarOpen(false);
                              }}
                              disabled={(date) => {
                                const startDate = form.getValues('starting_date');
                                if (!eventStarted && date < new Date()) {
                                  return true;
                                }
                                if (startDate && date <= startDate) {
                                  return true;
                                }
                                if (eventEnded && date <= now) {
                                  return true;
                                }
                                return false;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {eventEnded
                            ? 'Extend the end date to reactivate the event.'
                            : 'Event will automatically end on this date.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Event Products
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-slate-300">
                      Add or remove the products that participate in this event.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProductSelectorOpen((previous) => !previous)}
                    className="flex items-center gap-2"
                  >
                    <PackagePlus className="h-4 w-4" />
                    {isProductSelectorOpen ? 'Hide products' : 'Manage products'}
                    {isProductSelectorOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProducts.length === 0 ? (
                      <span className="text-sm text-muted-foreground dark:text-slate-300">
                        No products selected for this event.
                      </span>
                    ) : (
                      <>
                        <Badge variant="secondary">
                          {selectedProducts.length} products selected
                        </Badge>
                        {hasProductChanges && (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-200"
                          >
                            Unsaved changes
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  {isSellerProductsLoading && (
                    <p className="text-sm text-muted-foreground dark:text-slate-300">
                      Loading products…
                    </p>
                  )}

                  {!isSellerProductsLoading &&
                    selectedProducts.length > 0 &&
                    selectedProductPreview.length === 0 && (
                      <p className="text-sm text-muted-foreground dark:text-slate-300">
                        Product details will appear once loaded.
                      </p>
                    )}

                  {selectedProductPreview.length > 0 && (
                    <div className="space-y-1 text-sm text-muted-foreground dark:text-slate-300">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Selected products:
                      </p>
                      <ul className="list-disc space-y-1 pl-5">
                        {selectedProductPreview.map((title, index) => (
                          <li key={`${title}-${index}`} className="text-sm text-slate-900 dark:text-slate-100">
                            {title}
                          </li>
                        ))}
                        {selectedProducts.length > selectedProductPreview.length && (
                          <li className="text-sm text-muted-foreground dark:text-slate-300">
                            +{selectedProducts.length - selectedProductPreview.length} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <p className="text-xs text-muted-foreground dark:text-slate-400">
                      Pricing updates occur automatically after you save the event.
                    </p>
                  )}
                </div>

                {isProductSelectorOpen && (
                  <div className="max-h-[420px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <EventProductSelector
                      selectedProducts={selectedProducts}
                      onProductsChange={setSelectedProducts}
                      eventId={event.id}
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                <div>Created: {format(new Date(hydratedEvent.createdAt), 'PPP')}</div>
                <div>Last updated: {format(new Date(hydratedEvent.updatedAt), 'PPP')}</div>
                <div>Shop: {hydratedEvent?.shop?.name}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-6 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
