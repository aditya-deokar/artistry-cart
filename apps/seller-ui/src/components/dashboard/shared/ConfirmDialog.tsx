// components/dashboard/shared/ConfirmDialog.tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Loader2, AlertTriangle, Trash2, Archive, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidElement, useCallback, useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
  icon?: 'alert' | 'delete' | 'archive' | 'check' | React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const variantConfig = {
  default: {
    confirmClass: 'bg-primary hover:bg-primary/90',
    iconColor: 'text-blue-600',
    defaultIcon: 'check' as const,
  },
  destructive: {
    confirmClass: 'bg-destructive hover:bg-destructive/90',
    iconColor: 'text-destructive',
    defaultIcon: 'delete' as const,
  },
  warning: {
    confirmClass: 'bg-yellow-600 hover:bg-yellow-600/90 text-white',
    iconColor: 'text-yellow-600',
    defaultIcon: 'alert' as const,
  },
};

const iconComponents = {
  alert: AlertTriangle,
  delete: Trash2,
  archive: Archive,
  check: Check,
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  icon,
  size = 'md',
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm dialog error:', error);
      // Don't close dialog on error to allow user to retry
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  // Get icon component
  let IconComponent;
  if (isValidElement(icon)) {
    IconComponent = () => icon;
  } else if (typeof icon === 'string' && iconComponents[icon]) {
    IconComponent = iconComponents[icon];
  } else {
    IconComponent = iconComponents[config.defaultIcon];
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn('gap-6', sizeClasses[size])}>
        <AlertDialogHeader className="text-left">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
              variant === 'destructive' && 'bg-red-100 dark:bg-red-900/20',
              variant === 'warning' && 'bg-yellow-100 dark:bg-yellow-900/20',
              variant === 'default' && 'bg-blue-100 dark:bg-blue-900/20'
            )}>
              <IconComponent className={cn('h-6 w-6', config.iconColor)} />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-row justify-end gap-3 sm:space-x-0">
          <AlertDialogCancel 
            onClick={handleCancel} 
            disabled={loading}
            className="mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn('min-w-24', config.confirmClass)}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Predefined confirm dialogs for common actions
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'default' | 'destructive' | 'warning';
    confirmText?: string;
    loading?: boolean;
  }>({
    open: false,
    title: '',
    onConfirm: () => {},
  });

  const confirm = useCallback((options: {
    title: string;
    description?: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'default' | 'destructive' | 'warning';
    confirmText?: string;
  }) => {
    setDialogState({
      ...options,
      open: true,
      loading: false,
    });
  }, []);

  const confirmDelete = useCallback((onConfirm: () => void | Promise<void>, itemName?: string) => {
    confirm({
      title: `Delete ${itemName || 'item'}?`,
      description: `This action cannot be undone. This will permanently delete the ${itemName || 'item'}.`,
      onConfirm,
      variant: 'destructive',
      confirmText: 'Delete',
    });
  }, [confirm]);

  const confirmBulkDelete = useCallback((onConfirm: () => void | Promise<void>, count: number) => {
    confirm({
      title: `Delete ${count} items?`,
      description: `This action cannot be undone. This will permanently delete ${count} selected items.`,
      onConfirm,
      variant: 'destructive',
      confirmText: 'Delete All',
    });
  }, [confirm]);

  const handleConfirm = async () => {
    setDialogState(prev => ({ ...prev, loading: true }));
    try {
      await dialogState.onConfirm();
      setDialogState(prev => ({ ...prev, open: false, loading: false }));
    } catch (error) {
      setDialogState(prev => ({ ...prev, loading: false }));
    }
  };

  const dialog = (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
      title={dialogState.title}
      description={dialogState.description}
      onConfirm={handleConfirm}
      variant={dialogState.variant}
      confirmText={dialogState.confirmText}
      loading={dialogState.loading}
    />
  );

  return {
    confirm,
    confirmDelete,
    confirmBulkDelete,
    dialog,
  };
};
