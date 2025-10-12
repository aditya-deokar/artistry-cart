// components/dashboard/events/EventTemplate.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileTemplate, Plus, Eye, Edit, Trash2, Copy, Star, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EventTemplate } from '@/types/event';
import { getEventTemplates, createEventTemplate, updateEventTemplate, deleteEventTemplate } from '@/lib/api/events';
import { formatNumber } from '@/lib/utils/formatting';

const eventTypes = [
  { value: 'FLASH_SALE', label: 'Flash Sale' },
  { value: 'SEASONAL', label: 'Seasonal Sale' },
  { value: 'CLEARANCE', label: 'Clearance' },
  { value: 'NEW_ARRIVAL', label: 'New Arrival' },
];

const discountTypes = [
  { value: 'PERCENTAGE', label: 'Percentage Discount' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  { value: 'TIERED', label: 'Tiered Discount' },
];

export default function EventTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['event-templates'],
    queryFn: getEventTemplates,
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      event_type: 'FLASH_SALE',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      duration_days: 1,
      isPublic: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: createEventTemplate,
    onSuccess: () => {
      toast.success('Template created successfully');
      queryClient.invalidateQueries({ queryKey: ['event-templates'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateEventTemplate(id, data),
    onSuccess: () => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: ['event-templates'] });
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEventTemplate,
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['event-templates'] });
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const onSubmit = (data: any) => {
    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (template: EventTemplate) => {
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      description: template.description,
      event_type: template.event_type,
      discount_type: template.discount_type,
      discount_value: template.discount_value,
      duration_days: template.duration_days,
      isPublic: template.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleUseTemplate = (template: EventTemplate) => {
    // Navigate to create event page with template data
    const templateData = {
      title: template.name,
      description: template.description,
      event_type: template.event_type,
      discount_type: template.discount_type,
      discount_value: template.discount_value,
      starting_date: new Date(),
      ending_date: new Date(Date.now() + template.duration_days * 24 * 60 * 60 * 1000),
    };
    
    // Store template data in localStorage for the create page
    localStorage.setItem('eventTemplateData', JSON.stringify(templateData));
    
    // Navigate to create event page
    window.location.href = '/seller/events/create';
  };

  const TemplateCard = ({ template }: { template: EventTemplate }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {template.isPublic && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Public
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {template.usageCount} uses
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium">{template.event_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <p className="font-medium">
                {template.duration_days} {template.duration_days === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Discount:</span>
              <p className="font-medium">
                {template.discount_type === 'PERCENTAGE' 
                  ? `${template.discount_value}%` 
                  : `$${template.discount_value}`
                }
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Usage:</span>
              <p className="font-medium">{formatNumber(template.usageCount)} times</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => handleUseTemplate(template)}>
              <FileTemplate className="h-4 w-4 mr-1" />
              Use Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(template.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TemplateForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Flash Sale Template" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this template is for..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedTemplate(null);
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {selectedTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Templates</h2>
          <p className="text-muted-foreground">
            Create reusable templates for quick event setup
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
            </DialogHeader>
            <TemplateForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileTemplate className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first event template to speed up future event creation
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Template</DialogTitle>
          </DialogHeader>
          <TemplateForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
