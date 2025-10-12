// components/dashboard/shared/BulkActionBar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Trash2, Archive, Edit, Download, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount?: number;
  actions: BulkAction[];
  onSelectAll?: () => void;
  onClearSelection: () => void;
  className?: string;
  isAllSelected?: boolean;
  position?: 'fixed' | 'sticky' | 'static';
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  actions,
  onSelectAll,
  onClearSelection,
  className,
  isAllSelected = false,
  position = 'fixed',
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const positionClasses = {
    fixed: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
    sticky: 'sticky bottom-4 z-40',
    static: 'relative z-10',
  };

  return (
    <div className={cn(
      "bg-background border rounded-lg shadow-lg p-4",
      "flex items-center justify-between min-w-[400px] max-w-4xl",
      positionClasses[position],
      className
    )}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {onSelectAll && totalCount && (
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label={isAllSelected ? "Deselect all" : "Select all"}
            />
          )}
          
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
          
          {totalCount && (
            <span className="text-sm text-muted-foreground">
              of {totalCount} items
            </span>
          )}
          
          {onSelectAll && totalCount && !isAllSelected && (
            <Button
              variant="link"
              size="sm"
              onClick={onSelectAll}
              className="h-auto p-0 text-xs"
            >
              Select all {totalCount}
            </Button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className="flex items-center gap-2"
            >
              {action.loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              ) : (
                action.icon
              )}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-8 w-8 p-0"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Predefined common bulk actions
export const commonBulkActions = {
  delete: (onClick: () => void, loading = false): BulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    onClick,
    loading,
  }),
  
  archive: (onClick: () => void, loading = false): BulkAction => ({
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
    variant: 'outline',
    onClick,
    loading,
  }),
  
  edit: (onClick: () => void, loading = false): BulkAction => ({
    id: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    variant: 'outline',
    onClick,
    loading,
  }),
  
  export: (onClick: () => void, loading = false): BulkAction => ({
    id: 'export',
    label: 'Export',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline',
    onClick,
    loading,
  }),
  
  email: (onClick: () => void, loading = false): BulkAction => ({
    id: 'email',
    label: 'Send Email',
    icon: <Mail className="h-4 w-4" />,
    variant: 'outline',
    onClick,
    loading,
  }),
};
