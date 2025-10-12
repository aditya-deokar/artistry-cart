// components/dashboard/discounts/DiscountStatus.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, Clock, XCircle, Play, Pause, MoreVertical, AlertTriangle, CalendarX } from 'lucide-react';
import { DiscountCode } from '@/types/discount';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDiscount } from '@/lib/api/discounts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/formatting';

interface DiscountStatusProps {
  discount: DiscountCode;
  variant?: 'badge' | 'select' | 'dropdown';
  showActions?: boolean;
  onStatusChange?: (status: boolean) => void;
}

export default function DiscountStatus({ 
  discount, 
  variant = 'badge', 
  showActions = false,
  onStatusChange 
}: DiscountStatusProps) {
  const queryClient = useQueryClient();
  
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: boolean) => 
      updateDiscount(discount.id, { ...discount, isActive: newStatus }),
    onSuccess: (updatedDiscount) => {
      queryClient.invalidateQueries({ queryKey: ['seller-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', discount.id] });
      onStatusChange?.(updatedDiscount.isActive);
      toast.success(`Discount ${updatedDiscount.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: () => {
      toast.error('Failed to update discount status');
    }
  });

  // Determine discount status based on dates and active flag
  const getDiscountStatus = () => {
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validUntil = discount.validUntil ? new Date(discount.validUntil) : null;

    if (!discount.isActive) {
      return {
        status: 'inactive',
        label: 'Inactive',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        icon: Pause,
        description: 'Discount is deactivated'
      };
    }

    if (now < validFrom) {
      return {
        status: 'scheduled',
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock,
        description: `Starts ${formatDate(validFrom)}`
      };
    }

    if (validUntil && now > validUntil) {
      return {
        status: 'expired',
        label: 'Expired',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: CalendarX,
        description: `Expired on ${formatDate(validUntil)}`
      };
    }

    // Check usage limits
    if (discount.usageLimit && discount.currentUsageCount >= discount.usageLimit) {
      return {
        status: 'exhausted',
        label: 'Exhausted',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        icon: XCircle,
        description: 'Usage limit reached'
      };
    }

    return {
      status: 'active',
      label: 'Active',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
      description: 'Discount is available for use'
    };
  };

  const statusInfo = getDiscountStatus();
  const StatusIcon = statusInfo.icon;

  const handleStatusToggle = () => {
    if (statusInfo.status === 'expired' || statusInfo.status === 'exhausted') {
      toast.error('Cannot activate expired or exhausted discounts');
      return;
    }
    updateStatusMutation.mutate(!discount.isActive);
  };

  if (variant === 'badge') {
    return (
      <Badge className={cn('flex items-center gap-1', statusInfo.color)}>
        <StatusIcon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  }

  if (variant === 'select') {
    return (
      <Select 
        value={discount.isActive ? 'active' : 'inactive'} 
        onValueChange={(value) => {
          if (statusInfo.status === 'expired' || statusInfo.status === 'exhausted') {
            toast.error('Cannot modify expired or exhausted discounts');
            return;
          }
          updateStatusMutation.mutate(value === 'active');
        }}
      >
        <SelectTrigger className="w-36">
          <SelectValue>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              {statusInfo.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active" disabled={statusInfo.status === 'expired' || statusInfo.status === 'exhausted'}>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">Activate</div>
                <div className="text-xs text-muted-foreground">
                  Make discount available
                </div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="inactive">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-gray-600" />
              <div>
                <div className="font-medium">Deactivate</div>
                <div className="text-xs text-muted-foreground">
                  Disable discount code
                </div>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
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
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2 border-b">
            <div className="font-medium">Status: {statusInfo.label}</div>
            <div className="text-sm text-muted-foreground">
              {statusInfo.description}
            </div>
          </div>
          
          {statusInfo.status === 'inactive' && (
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2 text-green-600" />
              Activate Discount
            </DropdownMenuItem>
          )}
          
          {statusInfo.status === 'active' && (
            <DropdownMenuItem
              onClick={handleStatusToggle}
              disabled={updateStatusMutation.isPending}
            >
              <Pause className="h-4 w-4 mr-2 text-gray-600" />
              Deactivate Discount
            </DropdownMenuItem>
          )}

          {statusInfo.status === 'scheduled' && (
            <DropdownMenuItem
              onClick={() => updateStatusMutation.mutate(false)}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Cancel Schedule
            </DropdownMenuItem>
          )}

          {(statusInfo.status === 'expired' || statusInfo.status === 'exhausted') && (
            <DropdownMenuItem disabled>
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              Cannot Reactivate
            </DropdownMenuItem>
          )}

          {/* Additional Info */}
          <div className="px-3 py-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Usage: {discount.currentUsageCount}/{discount.usageLimit || '∞'}</div>
              {discount.validUntil && (
                <div>Expires: {formatDate(discount.validUntil)}</div>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
