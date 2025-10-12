// components/dashboard/shared/DashboardCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  headerAction,
  footer,
}: DashboardCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            {title && <CardTitle className="text-lg font-medium">{title}</CardTitle>}
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && !headerAction && "pt-6")}>
        {children}
      </CardContent>
      {footer && (
        <div className="border-t px-6 py-3 bg-muted/50 rounded-b-lg">
          {footer}
        </div>
      )}
    </Card>
  );
}
