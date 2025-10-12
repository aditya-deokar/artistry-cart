// components/dashboard/discounts/DiscountPreview.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Copy, Percent, DollarSign, Calendar, Users, ShoppingCart, Calculator } from 'lucide-react';
import { DiscountCode } from '@/types/discount';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DiscountPreviewProps {
  discount: DiscountCode;
  trigger?: React.ReactNode;
}

export default function DiscountPreview({ discount, trigger }: DiscountPreviewProps) {
  const [selectedView, setSelectedView] = useState<'customer' | 'admin'>('customer');
  const [testOrderAmount, setTestOrderAmount] = useState(100);

  // Calculate discount for test order
  const calculateDiscount = (orderAmount: number) => {
    if (!discount) return { discountAmount: 0, finalAmount: orderAmount };

    let discountAmount = 0;

    switch (discount.discountType) {
      case 'PERCENTAGE':
        discountAmount = (orderAmount * discount.discountValue) / 100;
        if (discount.maximumDiscountAmount && discountAmount > discount.maximumDiscountAmount) {
          discountAmount = discount.maximumDiscountAmount;
        }
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(discount.discountValue, orderAmount);
        break;
      case 'FREE_SHIPPING':
        discountAmount = 10; // Assumed shipping cost
        break;
    }

    // Check minimum order amount
    if (discount.minimumOrderAmount && orderAmount < discount.minimumOrderAmount) {
      return { discountAmount: 0, finalAmount: orderAmount, error: 'Minimum order amount not met' };
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);
    return { discountAmount, finalAmount };
  };

  const testResult = calculateDiscount(testOrderAmount);

  const copyDiscountCode = async () => {
    await navigator.clipboard.writeText(discount.discountCode);
    toast.success('Discount code copied to clipboard!');
  };

  const getDiscountTypeIcon = () => {
    switch (discount.discountType) {
      case 'PERCENTAGE':
        return <Percent className="h-5 w-5" />;
      case 'FIXED_AMOUNT':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    if (!discount.isActive) return 'bg-gray-500';
    if (discount.validUntil && new Date(discount.validUntil) < new Date()) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!discount.isActive) return 'Inactive';
    if (discount.validUntil && new Date(discount.validUntil) < new Date()) return 'Expired';
    return 'Active';
  };

  // Customer View Component
  const CustomerView = () => (
    <div className="space-y-6">
      {/* Discount Banner */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">{discount.publicName}</h2>
        {discount.description && (
          <p className="text-lg opacity-90 mb-4">{discount.description}</p>
        )}
        
        <div className="text-5xl font-bold mb-4">
          {discount.discountType === 'PERCENTAGE' 
            ? `${discount.discountValue}% OFF` 
            : discount.discountType === 'FIXED_AMOUNT'
            ? `${formatCurrency(discount.discountValue)} OFF`
            : 'FREE SHIPPING'
          }
        </div>

        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
          <span className="text-sm opacity-75">Use code:</span>
          <code className="text-xl font-mono font-bold tracking-wider">
            {discount.discountCode}
          </code>
          <Button variant="secondary" size="sm" onClick={copyDiscountCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Discount Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">How it works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discount.minimumOrderAmount && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Minimum Purchase</p>
                  <p className="text-sm text-muted-foreground">
                    Spend at least {formatCurrency(discount.minimumOrderAmount)}
                  </p>
                </div>
              </div>
            )}

            {discount.maximumDiscountAmount && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Maximum Savings</p>
                  <p className="text-sm text-muted-foreground">
                    Save up to {formatCurrency(discount.maximumDiscountAmount)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Valid Until</p>
                <p className="text-sm text-muted-foreground">
                  {discount.validUntil ? formatDate(discount.validUntil) : 'No expiration'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Usage Limit</p>
                <p className="text-sm text-muted-foreground">
                  {discount.usageLimitPerUser} use per customer
                </p>
              </div>
            </div>
          </div>

          {/* Discount Calculator */}
          <div className="mt-6 p-4 border-2 border-dashed rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Your Savings
            </h4>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="orderAmount">Order Amount</Label>
                <Input
                  id="orderAmount"
                  type="number"
                  step="0.01"
                  value={testOrderAmount}
                  onChange={(e) => setTestOrderAmount(parseFloat(e.target.value) || 0)}
                  placeholder="100.00"
                />
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">You save:</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(testResult.discountAmount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Final: {formatCurrency(testResult.finalAmount)}
                </div>
              </div>
            </div>

            {testResult.error && (
              <p className="text-sm text-red-600 mt-2">{testResult.error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Admin View Component
  const AdminView = () => (
    <div className="space-y-6">
      {/* Discount Configuration */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Discount Configuration</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Public Name:</span>
                <p className="font-medium">{discount.publicName}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Discount Code:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-muted px-2 py-1 rounded">
                    {discount.discountCode}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyDiscountCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Type:</span>
                <div className="flex items-center gap-2">
                  {getDiscountTypeIcon()}
                  <span className="font-medium">
                    {discount.discountType.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Value:</span>
                <p className="font-medium text-green-600">
                  {discount.discountType === 'PERCENTAGE' 
                    ? `${discount.discountValue}%` 
                    : discount.discountType === 'FIXED_AMOUNT'
                    ? formatCurrency(discount.discountValue)
                    : 'FREE'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={`${getStatusColor()} text-white ml-2`}>
                  {getStatusText()}
                </Badge>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Valid From:</span>
                <p className="font-medium">{formatDate(discount.validFrom)}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Valid Until:</span>
                <p className="font-medium">
                  {discount.validUntil ? formatDate(discount.validUntil) : 'No expiration'}
                </p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Usage:</span>
                <p className="font-medium">
                  {discount.currentUsageCount}
                  {discount.usageLimit ? ` / ${discount.usageLimit}` : ''} uses
                </p>
              </div>
            </div>
          </div>

          {discount.description && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Description:</span>
              <p className="text-sm mt-1">{discount.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditions & Restrictions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Conditions & Restrictions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Minimum Order:</span>
              <p className="font-medium">
                {discount.minimumOrderAmount 
                  ? formatCurrency(discount.minimumOrderAmount) 
                  : 'No minimum'
                }
              </p>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Maximum Discount:</span>
              <p className="font-medium">
                {discount.maximumDiscountAmount 
                  ? formatCurrency(discount.maximumDiscountAmount) 
                  : 'No limit'
                }
              </p>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Usage Per Customer:</span>
              <p className="font-medium">{discount.usageLimitPerUser || 1} times</p>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Product Scope:</span>
              <p className="font-medium">
                {discount.applicableToAll ? 'All Products' : 'Selected Products'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Calculator */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Discount Calculator</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminOrderAmount">Test Order Amount</Label>
              <Input
                id="adminOrderAmount"
                type="number"
                step="0.01"
                value={testOrderAmount}
                onChange={(e) => setTestOrderAmount(parseFloat(e.target.value) || 0)}
                className="max-w-xs"
              />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Original Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(testOrderAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discount Amount</p>
                  <p className="text-lg font-bold text-green-600">
                    -{formatCurrency(testResult.discountAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Final Amount</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(testResult.finalAmount)}
                  </p>
                </div>
              </div>
              
              {testResult.error && (
                <p className="text-sm text-red-600 text-center mt-2">{testResult.error}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Discount Preview</span>
            <div className="flex gap-2">
              <Button
                variant={selectedView === 'customer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('customer')}
              >
                Customer View
              </Button>
              <Button
                variant={selectedView === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('admin')}
              >
                Admin View
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {selectedView === 'customer' ? <CustomerView /> : <AdminView />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
