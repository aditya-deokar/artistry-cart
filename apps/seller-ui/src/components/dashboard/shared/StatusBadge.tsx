// components/dashboard/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, AlertCircle, Pause } from 'lucide-react';

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'error' 
  | 'warning' 
  | 'draft' 
  | 'published' 
  | 'scheduled' 
  | 'expired'
  | 'paused';

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  className: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    icon: <CheckCircle className="h-3 w-3" />
  },
  inactive: {
    label: 'Inactive',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
    icon: <XCircle className="h-3 w-3" />
  },
  pending: {
    label: 'Pending',
    variant: 'outline',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: <Clock className="h-3 w-3" />
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    icon: <CheckCircle className="h-3 w-3" />
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    icon: <XCircle className="h-3 w-3" />
  },
  error: {
    label: 'Error',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    icon: <AlertCircle className="h-3 w-3" />
  },
  warning: {
    label: 'Warning',
    variant: 'outline',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
    icon: <AlertCircle className="h-3 w-3" />
  },
  draft: {
    label: 'Draft',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
    icon: <Clock className="h-3 w-3" />
  },
  published: {
    label: 'Published',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    icon: <CheckCircle className="h-3 w-3" />
  },
  scheduled: {
    label: 'Scheduled',
    variant: 'outline',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
    icon: <Clock className="h-3 w-3" />
  },
  expired: {
    label: 'Expired',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    icon: <XCircle className="h-3 w-3" />
  },
  paused: {
    label: 'Paused',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: <Pause className="h-3 w-3" />
  }
};

export function StatusBadge({
  status,
  customLabel,
  showIcon = true,
  size = 'md',
  variant,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const label = customLabel || config.label;
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <Badge
      variant={variant || config.variant}
      className={cn(
        'font-medium inline-flex items-center gap-1',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && config.icon}
      {label}
    </Badge>
  );
}
