// components/dashboard/shared/ChartContainer.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, Maximize2, RefreshCw } from 'lucide-react';

interface ChartContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  timeRangeOptions?: Array<{ value: string; label: string }>;
  selectedTimeRange?: string;
  onTimeRangeChange?: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  loading?: boolean;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  height = 400,
  timeRangeOptions,
  selectedTimeRange,
  onTimeRangeChange,
  onRefresh,
  onExport,
  onFullscreen,
  loading = false,
}: ChartContainerProps) {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description || timeRangeOptions || onRefresh || onExport || onFullscreen) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            {title && <CardTitle className="text-base font-medium">{title}</CardTitle>}
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {timeRangeOptions && (
              <Select value={selectedTimeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            )}
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {onFullscreen && (
              <Button variant="outline" size="sm" onClick={onFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(!title && !description && "pt-6")}>
        <div 
          className="w-full relative"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
}
