// components/dashboard/events/EventForm.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, type EventFormData } from '@/lib/utils/validation';
import { getEventById, createEvent, updateEvent } from '@/lib/api/events';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Form sections
import EventBasicInfo from './form-sections/EventBasicInfo';
import EventSchedule from './form-sections/EventSchedule';
import EventDiscounts from './form-sections/EventDiscounts';
import EventBanner from './form-sections/EventBanner';
import EventSettings from './form-sections/EventSettings';

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
}

export default function EventForm({ mode, eventId }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get existing event data for edit mode
  const { data: existingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventById(eventId!),
    enabled: mode === 'edit' && !!eventId,
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: existingEvent || {
      title: '',
      description: '',
      event_type: 'FLASH_SALE',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      max_discount: null,
      min_order_value: null,
      starting_date: new Date(),
      ending_date: new Date(),
      is_active: true,
      banner_image: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
      router.push(`/seller/events/${data.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create event');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventFormData }) =>
      updateEvent(id, data),
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
    },
    onError: (error) => {
      toast.error('Failed to update event');
      console.error(error);
    },
  });

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else if (eventId) {
        await updateMutation.mutateAsync({ id: eventId, data });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="banner">Banner</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <EventBasicInfo form={form} />
          </TabsContent>

          <TabsContent value="schedule">
            <EventSchedule form={form} />
          </TabsContent>

          <TabsContent value="discounts">
            <EventDiscounts form={form} />
          </TabsContent>

          <TabsContent value="banner">
            <EventBanner form={form} />
          </TabsContent>

          <TabsContent value="settings">
            <EventSettings form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Update Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
