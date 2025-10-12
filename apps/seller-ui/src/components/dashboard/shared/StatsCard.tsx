// components/dashboard/shared/StatsCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  className,
  loading = false,
}: StatsCardProps) {
  const getChangeIcon = () => {
    if (!change || change.type === 'neutral') return null;
    return change.type === 'increase' ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decrease':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
              <div className="h-8 bg-muted animate-pulse rounded w-16" />
              <div className="h-3 bg-muted animate-pulse rounded w-24" />
            </div>
            {icon && (
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {value}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {change && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs flex items-center gap-1", getChangeColor())}
                >
                  {getChangeIcon()}
                  {change.value > 0 && change.type !== 'decrease' && '+'}
                  {change.value}%
                </Badge>
              )}
              {(description || change?.label) && (
                <p className="text-xs text-muted-foreground">
                  {change?.label || description}
                </p>
              )}
            </div>
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
