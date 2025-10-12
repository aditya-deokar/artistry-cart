// components/dashboard/discounts/DiscountValidation.tsx
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Calendar, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { validateDiscountCode } from '@/lib/api/discounts';
import { toast } from 'sonner';

export default function DiscountValidation() {
  const form = useFormContext();
  const [testOrderData, setTestOrderData] = useState({
    orderAmount: 100,
    productIds: [],
    userId: 'test-user'
  });
  const [validationResult, setValidationResult] = useState(null);

  const discountCode = form.watch('discountCode');
  const validFrom = form.watch('validFrom');
  const validUntil = form.watch('validUntil');
  const isActive = form.watch('isActive');

  const validateMutation = useMutation({
    mutationFn: ({ code, testData }: { code: string; testData: any }) =>
      validateDiscountCode(code),
    onSuccess: (result) => {
      setValidationResult(result);
      toast.success('Validation completed');
    },
    onError: (error: any) => {
      toast.error('Validation failed: ' + error.message);
      setValidationResult({ valid: false, errors: [error.message] });
    }
  });

  const runValidation = () => {
    if (!discountCode) {
      toast.error('Please enter a discount code first');
      return;
    }
    
    validateMutation.mutate({
      code: discountCode,
      testData: testOrderData
    });
  };

  const getValidityStatus = () => {
    if (!isActive) {
      return { status: 'inactive', message: 'Discount is inactive', color: 'destructive' };
    }

    const now = new Date();
    const start = validFrom ? new Date(validFrom) : null;
    const end = validUntil ? new Date(validUntil) : null;

    if (start && now < start) {
      return { status: 'scheduled', message: 'Not yet active', color: 'secondary' };
    }

    if (end && now > end) {
      return { status: 'expired', message: 'Expired', color: 'destructive' };
    }

    return { status: 'active', message: 'Active', color: 'default' };
  };

  const validityStatus = getValidityStatus();

  return (
    <div className="space-y-6">
      {/* Validity Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Validity Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valid From */}
          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid From *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valid Until */}
          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    min={validFrom ? format(new Date(validFrom), "yyyy-MM-dd'T'HH:mm") : undefined}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Leave empty for no expiration date
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Display */}
          <div className="flex items-center gap-2">
            <Badge variant={validityStatus.color as any} className="flex items-center gap-1">
              {validityStatus.status === 'active' && <CheckCircle className="h-3 w-3" />}
              {validityStatus.status === 'scheduled' && <Clock className="h-3 w-3" />}
              {validityStatus.status === 'expired' && <AlertTriangle className="h-3 w-3" />}
              {validityStatus.status === 'inactive' && <AlertTriangle className="h-3 w-3" />}
              {validityStatus.message}
            </Badge>
          </div>

          {/* Active Status */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Activate Discount</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable this discount code for customer use
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

      {/* Test & Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Test Discount Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test your discount code with sample order data to ensure it works correctly
          </p>

          {/* Test Order Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Test Order Amount</label>
              <Input
                type="number"
                step="0.01"
                value={testOrderData.orderAmount}
                onChange={(e) => setTestOrderData(prev => ({
                  ...prev,
                  orderAmount: parseFloat(e.target.value) || 0
                }))}
                placeholder="100.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test User ID</label>
              <Input
                value={testOrderData.userId}
                onChange={(e) => setTestOrderData(prev => ({
                  ...prev,
                  userId: e.target.value
                }))}
                placeholder="test-user-id"
              />
            </div>
          </div>

          {/* Run Test */}
          <Button 
            onClick={runValidation} 
            disabled={validateMutation.isPending || !discountCode}
            className="w-full"
          >
            {validateMutation.isPending ? 'Testing...' : 'Test Discount Code'}
          </Button>

          {/* Validation Results */}
          {validationResult && (
            <Alert className={validationResult.valid ? 'border-green-500' : 'border-destructive'}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {validationResult.valid ? (
                  <div>
                    <div className="font-medium text-green-700">Validation Successful</div>
                    {validationResult.discountAmount && (
                      <div className="text-sm">
                        Discount Amount: ${validationResult.discountAmount.toFixed(2)}
                      </div>
                    )}
                    {validationResult.finalAmount && (
                      <div className="text-sm">
                        Final Order Amount: ${validationResult.finalAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-destructive">Validation Failed</div>
                    {validationResult.errors && validationResult.errors.length > 0 && (
                      <ul className="text-sm list-disc list-inside mt-1">
                        {validationResult.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Anti-Fraud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="preventBotUsage"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Prevent Bot Usage</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable additional checks to prevent automated abuse
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
            name="requireEmailVerification"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Require Email Verification</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Only allow verified email addresses to use this discount
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
            name="rateLimitPerIp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Limit Per IP (attempts per hour)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Limit discount attempts per IP address to prevent abuse
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Validation Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Code Status:</span>
              <Badge variant={validityStatus.color as any}>
                {validityStatus.message}
              </Badge>
            </div>
            
            {validFrom && (
              <div className="flex items-center justify-between">
                <span>Valid From:</span>
                <span>{format(new Date(validFrom), 'PPp')}</span>
              </div>
            )}
            
            {validUntil && (
              <div className="flex items-center justify-between">
                <span>Valid Until:</span>
                <span>{format(new Date(validUntil), 'PPp')}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span>Security:</span>
              <span>{form.watch('preventBotUsage') ? 'Enhanced' : 'Standard'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
