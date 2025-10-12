// components/dashboard/discounts/DiscountUsage.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Infinity, AlertTriangle, Info } from 'lucide-react';

export default function DiscountUsage() {
  const form = useFormContext();
  
  const hasUsageLimit = form.watch('hasUsageLimit') ?? false;
  const usageLimit = form.watch('usageLimit');
  const usageLimitPerUser = form.watch('usageLimitPerUser');
  const currentUsage = form.watch('currentUsageCount') ?? 0;

  // Calculate usage percentage
  const usagePercentage = usageLimit ? Math.round((currentUsage / usageLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usage Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Usage Limit */}
          <FormField
            control={form.control}
            name="hasUsageLimit"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Set Total Usage Limit</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Limit how many times this discount can be used overall
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasUsageLimit && (
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Usage Limit *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Maximum number of times this discount can be used
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Per-User Usage Limit */}
          <FormField
            control={form.control}
            name="usageLimitPerUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Limit Per Customer</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  How many times each customer can use this discount
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Usage Display (for edit mode) */}
          {currentUsage > 0 && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Current Usage</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Used {currentUsage} {hasUsageLimit && usageLimit ? `of ${usageLimit}` : ''} times
                </span>
                {hasUsageLimit && usageLimit && (
                  <Badge variant={usagePercentage >= 90 ? 'destructive' : usagePercentage >= 70 ? 'secondary' : 'default'}>
                    {usagePercentage}%
                  </Badge>
                )}
              </div>
              
              {hasUsageLimit && usageLimit && (
                <Progress value={usagePercentage} className="h-2" />
              )}
            </div>
          )}

          {/* Usage Warnings */}
          {hasUsageLimit && usageLimit && currentUsage > 0 && (
            <div className="space-y-2">
              {usagePercentage >= 90 && (
                <Alert className="border-destructive/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This discount is almost exhausted. Only {usageLimit - currentUsage} uses remaining.
                  </AlertDescription>
                </Alert>
              )}
              
              {usagePercentage >= 70 && usagePercentage < 90 && (
                <Alert className="border-yellow-500/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This discount is {usagePercentage}% used. {usageLimit - currentUsage} uses remaining.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Usage Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Usage Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="allowCombineWithOtherDiscounts"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Allow Stacking with Other Discounts</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to use this with other discount codes
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preventAbuseChecks"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Enable Abuse Prevention</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Prevent suspicious usage patterns and rapid-fire usage
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trackUserMetrics"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Track Detailed Usage Metrics</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Collect detailed analytics about how this discount is used
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Usage Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Usage Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Limit:</span>
              <div className="font-medium flex items-center gap-1">
                {hasUsageLimit && usageLimit ? usageLimit : <Infinity className="h-4 w-4" />}
                {hasUsageLimit && usageLimit ? ' uses' : ' Unlimited'}
              </div>
            </div>
            
            <div>
              <span className="text-muted-foreground">Per Customer:</span>
              <div className="font-medium">
                {usageLimitPerUser || 1} use{(usageLimitPerUser || 1) > 1 ? 's' : ''}
              </div>
            </div>
            
            {currentUsage > 0 && (
              <>
                <div>
                  <span className="text-muted-foreground">Used So Far:</span>
                  <div className="font-medium">{currentUsage} times</div>
                </div>
                
                {hasUsageLimit && usageLimit && (
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <div className="font-medium">{usageLimit - currentUsage} uses</div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
