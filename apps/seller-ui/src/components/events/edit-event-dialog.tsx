'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, AlertTriangle, Info } from 'lucide-react';
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
import { cn } from '@/lib/utils';

import { Event } from '@/types';
import { toast } from 'sonner';
import { useUpdateEvent } from '@/hooks/useEvents';

const editEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  event_type: z.enum(['FLASH_SALE', 'SEASONAL', 'CLEARANCE', 'NEW_ARRIVAL']),
  discount_percent: z.number().min(0).max(100).optional(),
  starting_date: z.date({
    error: 'Start date is required',
  }),
  ending_date: z.date({
    error : 'End date is required',
  }),
  is_active: z.boolean(),
}).refine(data => data.ending_date > data.starting_date, {
  message: "End date must be after start date",
  path: ["ending_date"],
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EditEventDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEventDialog({ event, isOpen, onClose }: EditEventDialogProps) {
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  
  const updateEvent = useUpdateEvent();

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
    if (event) {
      form.reset({
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        discount_percent: event.discount_percent,
        starting_date: new Date(event.starting_date),
        ending_date: new Date(event.ending_date),
        is_active: event.is_active,
      });
    }
  }, [event, form]);

  const now = new Date();
  const eventStarted = new Date(event.starting_date) <= now;
  const eventEnded = new Date(event.ending_date) <= now;
  const isActive = new Date(event.starting_date) <= now && new Date(event.ending_date) > now;

  const getEventStatus = () => {
    if (eventEnded) return { status: 'expired', message: 'This event has already ended.' };
    if (isActive) return { status: 'active', message: 'This event is currently active.' };
    if (eventStarted) return { status: 'started', message: 'This event has started.' };
    return { status: 'upcoming', message: 'This event is scheduled for the future.' };
  };

  const eventStatus = getEventStatus();

  const onSubmit = async (data: EditEventFormData) => {
    try {
      await updateEvent.mutateAsync({
        eventId: event.id,
        data: {
          ...data,
          starting_date: data.starting_date.toISOString(),
          ending_date: data.ending_date.toISOString(),
        }
      });
      
      toast.success('Event updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Event: {event.title}
          </DialogTitle>
        </DialogHeader>

        {/* Event Status Alert */}
        <Alert className={cn(
          "border-l-4",
          eventStatus.status === 'expired' && "border-red-500 bg-red-50",
          eventStatus.status === 'active' && "border-green-500 bg-green-50",
          eventStatus.status === 'started' && "border-orange-500 bg-orange-50",
          eventStatus.status === 'upcoming' && "border-blue-500 bg-blue-50"
        )}>
          <Info className={cn(
            "h-4 w-4",
            eventStatus.status === 'expired' && "text-red-600",
            eventStatus.status === 'active' && "text-green-600",
            eventStatus.status === 'started' && "text-orange-600",
            eventStatus.status === 'upcoming' && "text-blue-600"
          )} />
          <AlertDescription className={cn(
            eventStatus.status === 'expired' && "text-red-700",
            eventStatus.status === 'active' && "text-green-700",
            eventStatus.status === 'started' && "text-orange-700",
            eventStatus.status === 'upcoming' && "text-blue-700"
          )}>
            {eventStatus.message}
            {eventStatus.status === 'active' && (
              <div className="mt-1 text-sm">
                Be careful when editing active events as it may affect customer experience.
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Event Analytics */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{event.views.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{event.clicks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Clicks</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Event Status
                        </FormLabel>
                        <FormDescription>
                          Enable or disable this event
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
              </div>

              {/* Event Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Event Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
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
                          <SelectContent>
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
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>Optional - Enter 0-100</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Date Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
                
                {eventStarted && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700">
                      This event has already started. Changing dates may affect active customers.
                    </AlertDescription>
                  </Alert>
                )}

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
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsStartCalendarOpen(false);
                              }}
                              disabled={(date) => {
                                // Can't change start date if event has already started
                                if (eventStarted) return true;
                                // Can't set past dates
                                return date < new Date();
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {eventStarted && (
                          <FormDescription className="text-orange-600">
                            Cannot change start date after event has started
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
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsEndCalendarOpen(false);
                              }}
                              disabled={(date) => {
                                const startDate = form.getValues('starting_date');
                                // Can't set date before today unless event hasn't started
                                if (!eventStarted && date < new Date()) return true;
                                // Can't set date before start date
                                if (startDate && date <= startDate) return true;
                                // If event has ended, can only extend, not shorten
                                if (eventEnded && date <= new Date()) return true;
                                return false;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {eventEnded ? 'You can extend the end date to reactivate the event' : 'Event will automatically end on this date'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Products Information */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Associated Products</h3>
                <div className="text-sm text-gray-600">
                  This event is associated with <strong>{event.products?.length || 0}</strong> products.
                </div>
                {event.products && event.products.length > 0 && (
                  <div className="text-xs text-gray-500">
                    To modify associated products, please contact support or manage products individually.
                  </div>
                )}
              </div>

              {/* Created Info */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                <div>Created: {format(new Date(event.createdAt), 'PPP')}</div>
                <div>Last updated: {format(new Date(event.updatedAt), 'PPP')}</div>
                <div>Shop: {event?.shop?.name}</div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateEvent.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {updateEvent.isPending ? 'Updating...' : 'Update Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
