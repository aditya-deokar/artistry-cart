// components/dashboard/events/EventStatus.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, Clock, XCircle, Play, Pause, MoreVertical, AlertCircle } from 'lucide-react';
import { Event } from '@/types/event';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvent } from '@/lib/api/events';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface EventStatusProps {
  event: Event;
  variant?: 'badge' | 'select' | 'dropdown';
  showActions?: boolean;
  onStatusChange?: (status: string) => void;
}

export default function EventStatus({ 
  event, 
  variant = 'badge', 
  showActions = false,
  onStatusChange 
}: EventStatusProps) {
  const queryClient = useQueryClient();
  
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: boolean) => 
      updateEvent(event.id, { ...event, is_active: newStatus }),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      onStatusChange?.(updatedEvent.is_active ? 'active' : 'inactive');
      toast.success(`Event ${updatedEvent.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: () => {
      toast.error('Failed to update event status');
    }
  });

  // Determine event status based on dates and active flag
  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(event.starting_date);
    const end = new Date(event.ending_date);

    if (!event.is_active) {
      return {
        status: 'inactive',
        label: 'Inactive',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        icon: Pause,
        description: 'Event is deactivated'
      };
    }

    if (now < start) {
      return {
        status: 'scheduled',
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock,
        description: 'Event starts soon'
      };
    }

    if (now > end) {
      return {
        status: 'ended',
        label: 'Ended',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
        description: 'Event has concluded'
      };
    }

    return {
      status: 'active',
      label: 'Live',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
      description: 'Event is currently running'
    };
  };

  const statusInfo = getEventStatus();
  const StatusIcon = statusInfo.icon;

  // Calculate event progress for active events
  const getEventProgress = () => {
    if (statusInfo.status !== 'active') return null;
    
    const now = new Date();
    const start = new Date(event.starting_date);
    const end = new Date(event.ending_date);
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const progress = getEventProgress();

  const handleStatusToggle = () => {
    updateStatusMutation.mutate(!event.is_active);
  };

  if (variant === 'badge') {
    return (
      <div className="flex items-center gap-2">
        <Badge className={cn('flex items-center gap-1', statusInfo.color)}>
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
        {progress !== null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{progress}%</span>
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'select') {
    return (
      <div className="space-y-2">
        <Select 
          value={event.is_active ? 'active' : 'inactive'} 
          onValueChange={(value) => updateStatusMutation.mutate(value === 'active')}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                {statusInfo.label}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                <div>
                  <div className="font-medium">Activate</div>
                  <div className="text-xs text-muted-foreground">
                    Make event live and visible
                  </div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                <div>
                  <div className="font-medium">Deactivate</div>
                  <div className="text-xs text-muted-foreground">
                    Hide event from public view
                  </div>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {progress !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusInfo.label}
            {showActions && <MoreVertical className="h-4 w-4 ml-2" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 border-b">
            <div className="font-medium">Event Status</div>
            <div className="text-sm text-muted-foreground">
              {statusInfo.description}
            </div>
          </div>
          
          {statusInfo.status === 'scheduled' && (
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Event Now
            </DropdownMenuItem>
          )}
          
          {statusInfo.status === 'active' && (
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Event
            </DropdownMenuItem>
          )}
          
          {statusInfo.status === 'inactive' && (
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Activate Event
            </DropdownMenuItem>
          )}

          {showActions && statusInfo.status === 'ended' && (
            <DropdownMenuItem>
              <AlertCircle className="h-4 w-4 mr-2" />
              View Final Report
            </DropdownMenuItem>
          )}

          {progress !== null && (
            <div className="px-3 py-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Event Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
