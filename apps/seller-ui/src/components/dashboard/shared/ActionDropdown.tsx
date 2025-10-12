// components/dashboard/shared/ActionDropdown.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

export interface ActionGroup {
  label?: string;
  items: ActionItem[];
}

interface ActionDropdownProps {
  actions: ActionItem[] | ActionGroup[];
  triggerIcon?: 'horizontal' | 'vertical' | React.ReactNode;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  disabled?: boolean;
}

export function ActionDropdown({
  actions,
  triggerIcon = 'horizontal',
  triggerLabel,
  triggerVariant = 'ghost',
  align = 'end',
  side = 'bottom',
  className,
  disabled = false,
}: ActionDropdownProps) {
  const getTriggerIcon = () => {
    if (React.isValidElement(triggerIcon)) {
      return triggerIcon;
    }
    
    switch (triggerIcon) {
      case 'vertical':
        return <MoreVertical className="h-4 w-4" />;
      case 'horizontal':
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const isGroupedActions = (actions: ActionItem[] | ActionGroup[]): actions is ActionGroup[] => {
    return actions.length > 0 && 'items' in actions[0];
  };

  const renderActionItem = (action: ActionItem) => (
    <DropdownMenuItem
      key={action.id}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        'flex items-center gap-2 cursor-pointer',
        action.variant === 'destructive' && 'text-destructive focus:text-destructive'
      )}
    >
      {action.icon}
      {action.label}
    </DropdownMenuItem>
  );

  const renderActions = () => {
    if (isGroupedActions(actions)) {
      return actions.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.label && (
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              {group.label}
            </DropdownMenuLabel>
          )}
          {group.items.map((action, actionIndex) => (
            <div key={action.id}>
              {renderActionItem(action)}
              {action.separator && actionIndex < group.items.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </div>
          ))}
          {groupIndex < actions.length - 1 && <DropdownMenuSeparator />}
        </div>
      ));
    } else {
      return actions.map((action, index) => (
        <div key={action.id}>
          {renderActionItem(action)}
          {action.separator && index < actions.length - 1 && (
            <DropdownMenuSeparator />
          )}
        </div>
      ));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={triggerVariant}
          size="sm"
          className={cn('h-8 w-8 p-0', triggerLabel && 'w-auto px-3', className)}
          disabled={disabled}
        >
          <span className="sr-only">Open menu</span>
          {getTriggerIcon()}
          {triggerLabel && <span className="ml-2">{triggerLabel}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-56">
        {renderActions()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
