// components/dashboard/events/EventScheduler.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, AlertCircle, Play, Pause, Timer } from 'lucide-react';
import { format, addDays, addHours, addMinutes, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const quickDurations = [
  { label: '1 Hour', hours: 1 },
  { label: '6 Hours', hours: 6 },
  { label: '12 Hours', hours: 12 },
  { label: '1 Day', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '1 Week', hours: 168 },
  { label: '2 Weeks', hours: 336 },
  { label: '1 Month', hours: 720 },
];

const eventTemplateSchedules = [
  {
    id: 'flash-1h',
    name: '1-Hour Flash Sale',
    description: 'Quick flash sale for maximum urgency',
    duration: 1,
    recommended: ['FLASH_SALE']
  },
  {
    id: 'weekend',
    name: 'Weekend Sale',
    description: 'Friday evening to Sunday night',
    duration: 60,
    recommended: ['SEASONAL', 'CLEARANCE']
  },
  {
    id: 'week-long',
    name: 'Week-Long Event',
    description: 'Full week promotional event',
    duration: 168,
    recommended: ['NEW_ARRIVAL', 'SEASONAL']
  },
];

export default function EventScheduler() {
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [schedulingMode, setSchedulingMode] = useState<'now' | 'later'>('later');
  const [duration, setDuration] = useState<number | null>(null);

  const form = useFormContext();
  const startDate = form.watch('starting_date');
  const endDate = form.watch('ending_date');
  const eventType = form.watch('event_type');

  // Update end date when start date or duration changes
  useEffect(() => {
    if (startDate && duration && schedulingMode === 'later') {
      const newEndDate = addHours(new Date(startDate), duration);
      form.setValue('ending_date', newEndDate);
    }
  }, [startDate, duration, schedulingMode, form]);

  const setQuickDuration = (hours: number) => {
    setDuration(hours);
    if (schedulingMode === 'now') {
      const now = new Date();
      const end = addHours(now, hours);
      form.setValue('starting_date', now);
      form.setValue('ending_date', end);
    } else if (startDate) {
      const end = addHours(new Date(startDate), hours);
      form.setValue('ending_date', end);
    }
  };

  const startNow = () => {
    const now = new Date();
    form.setValue('starting_date', now);
    if (duration) {
      const end = addHours(now, duration);
      form.setValue('ending_date', end);
    }
    setSchedulingMode('now');
  };

  const scheduleForLater = () => {
    setSchedulingMode('later');
  };

  const applyTemplate = (template: typeof eventTemplateSchedules[0]) => {
    setDuration(template.duration);
    
    if (schedulingMode === 'now') {
      const now = new Date();
      const end = addHours(now, template.duration);
      form.setValue('starting_date', now);
      form.setValue('ending_date', end);
    } else if (startDate) {
      const end = addHours(new Date(startDate), template.duration);
      form.setValue('ending_date', end);
    }
  };

  // Validation checks
  const getValidationStatus = () => {
    if (!startDate || !endDate) return { valid: false, message: 'Please set both start and end dates' };
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isBefore(start, now) && schedulingMode === 'later') {
      return { valid: false, message: 'Start date cannot be in the past' };
    }
    
    if (isBefore(end, start)) {
      return { valid: false, message: 'End date must be after start date' };
    }
    
    if (isBefore(end, now)) {
      return { valid: false, message: 'End date cannot be in the past' };
    }
    
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1) {
      return { valid: false, message: 'Event must run for at least 1 hour' };
    }
    
    if (durationHours > 2160) { // 90 days
      return { valid: false, message: 'Event cannot run for more than 90 days' };
    }
    
    return { valid: true, message: 'Schedule looks good!' };
  };

  const validation = getValidationStatus();
  
  // Calculate event duration
  const getEventDuration = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (hours < 24) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
    }
  };

  const eventDuration = getEventDuration();

  return (
    <div className="space-y-6">
      {/* Scheduling Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={schedulingMode === 'now' ? 'default' : 'outline'}
              onClick={startNow}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Now
            </Button>
            <Button
              type="button"
              variant={schedulingMode === 'later' ? 'default' : 'outline'}
              onClick={scheduleForLater}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule for Later
            </Button>
          </div>

          {/* Start Date/Time */}
          <FormField
            control={form.control}
            name="starting_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    disabled={schedulingMode === 'now'}
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date/Time */}
          <FormField
            control={form.control}
            name="ending_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    min={startDate ? format(new Date(startDate), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration Display */}
          {eventDuration && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Timer className="h-4 w-4" />
              <span className="text-sm">
                Event Duration: <strong>{eventDuration}</strong>
              </span>
            </div>
          )}

          {/* Time Zone */}
          <div className="space-y-2">
            <FormLabel>Time Zone</FormLabel>
            <Select value={timeZone} onValueChange={setTimeZone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Duration Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Duration Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickDurations.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                onClick={() => setQuickDuration(preset.hours)}
                className={cn(
                  "text-sm",
                  duration === preset.hours && "ring-2 ring-primary"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schedule Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventTemplateSchedules
              .filter(template => 
                !eventType || template.recommended.includes(eventType)
              )
              .map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description} • {template.duration < 24 ? `${template.duration}h` : `${template.duration / 24}d`}
                    </p>
                    {template.recommended.includes(eventType) && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Recommended for {eventType.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Alert className={validation.valid ? 'border-green-200' : 'border-destructive'}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className={validation.valid ? 'text-green-700' : ''}>
          {validation.message}
        </AlertDescription>
      </Alert>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="auto_start"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Auto Start</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Automatically activate the event at the scheduled time
                  </p>
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

          <FormField
            control={form.control}
            name="auto_end"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Auto End</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Automatically deactivate the event at the scheduled end time
                  </p>
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

          <FormField
            control={form.control}
            name="send_notifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Send Notifications</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Notify customers when the event starts and ends
                  </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
