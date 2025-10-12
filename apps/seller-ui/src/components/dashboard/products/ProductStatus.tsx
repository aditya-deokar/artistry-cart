// components/dashboard/products/ProductStatus.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, Clock, FileText, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { ProductStatus as StatusType, Product } from '@/types/product';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '@/lib/api/products';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductStatusProps {
  product: Product;
  variant?: 'badge' | 'select' | 'dropdown';
  showActions?: boolean;
  onStatusChange?: (status: StatusType) => void;
}

const statusConfig = {
  Active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    description: 'Product is live and available for purchase'
  },
  Pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    description: 'Awaiting admin approval'
  },
  Draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    icon: FileText,
    description: 'Product is saved but not published'
  }
};

export default function ProductStatus({ 
  product, 
  variant = 'badge', 
  showActions = false,
  onStatusChange 
}: ProductStatusProps) {
  const queryClient = useQueryClient();
  
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: StatusType) => 
      updateProduct(product.id, { ...product, status: newStatus }),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
      onStatusChange?.(updatedProduct.status);
      toast.success(`Product status updated to ${updatedProduct.status}`);
    },
    onError: () => {
      toast.error('Failed to update product status');
    }
  });

  const currentStatus = statusConfig[product.status];
  const StatusIcon = currentStatus.icon;

  const handleStatusChange = (newStatus: StatusType) => {
    if (newStatus !== product.status) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  if (variant === 'badge') {
    return (
      <Badge className={cn('flex items-center gap-1', currentStatus.color)}>
        <StatusIcon className="h-3 w-3" />
        {currentStatus.label}
      </Badge>
    );
  }

  if (variant === 'select') {
    return (
      <Select value={product.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              {currentStatus.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
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
            {currentStatus.label}
            {showActions && <MoreVertical className="h-4 w-4 ml-2" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 border-b">
            <div className="font-medium">Change Status</div>
            <div className="text-sm text-muted-foreground">
              Current: {currentStatus.label}
            </div>
          </div>
          
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            const isActive = status === product.status;
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status as StatusType)}
                disabled={isActive || updateStatusMutation.isPending}
                className={cn(
                  'flex items-center gap-2',
                  isActive && 'bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
                {isActive && <CheckCircle className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
          
          {showActions && (
            <>
              <div className="border-t my-1" />
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Product
              </DropdownMenuItem>
              <DropdownMenuItem>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide from Store
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
