// components/dashboard/shared/EmptyState.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Search, 
  Plus, 
  FileX, 
  Users, 
  ShoppingCart, 
  Mail,
  Image as ImageIcon,
  Calendar,
  BarChart3
} from 'lucide-react';
import { isValidElement } from 'react';

interface EmptyStateProps {
  icon?: keyof typeof icons | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const icons = {
  package: Package,
  search: Search,
  plus: Plus,
  file: FileX,
  users: Users,
  cart: ShoppingCart,
  mail: Mail,
  image: ImageIcon,
  calendar: Calendar,
  chart: BarChart3,
};

export function EmptyState({
  icon = 'package',
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  // Get icon component
  let IconComponent;
  if (isValidElement(icon)) {
    IconComponent = () => icon;
  } else if (typeof icon === 'string' && icons[icon]) {
    IconComponent = icons[icon];
  } else {
    IconComponent = icons.package;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className={cn("text-center", classes.container)}>
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="rounded-full bg-muted p-4">
            <IconComponent className={cn("text-muted-foreground", classes.icon)} />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className={cn("font-semibold tracking-tight", classes.title)}>
              {title}
            </h3>
            {description && (
              <p className={cn("text-muted-foreground max-w-md", classes.description)}>
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              {action && (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || 'default'}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {action.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
