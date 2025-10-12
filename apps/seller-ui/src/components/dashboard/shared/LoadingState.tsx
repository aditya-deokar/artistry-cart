// components/dashboard/shared/LoadingState.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  rows?: number;
  className?: string;
}

export function LoadingState({
  variant = 'skeleton',
  size = 'md',
  text = "Loading...",
  fullScreen = false,
  rows = 5,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "min-h-screen w-full",
    !fullScreen && "py-12",
    className
  );

  if (variant === 'spinner') {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          {text && <p className="text-muted-foreground text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-3">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-primary rounded-full animate-pulse",
                  size === 'sm' && "w-2 h-2",
                  size === 'md' && "w-3 h-3",
                  size === 'lg' && "w-4 h-4"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
          {text && <p className="text-muted-foreground text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center space-y-3">
          <div className={cn(
            "bg-muted rounded-lg animate-pulse",
            size === 'sm' && "w-16 h-16",
            size === 'md' && "w-24 h-24",
            size === 'lg' && "w-32 h-32"
          )} />
          {text && <p className="text-muted-foreground text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  // Skeleton variant (default)
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {[...Array(rows)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
