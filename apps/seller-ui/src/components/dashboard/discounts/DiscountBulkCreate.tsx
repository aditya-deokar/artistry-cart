// components/dashboard/discounts/DiscountBulkCreate.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Download, Upload, Wand2, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { bulkCreateDiscounts } from '@/lib/api/discounts';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/formatting';

interface BulkDiscountForm {
  count: number;
  prefix: string;
  suffix: string;
  codeLength: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  publicName: string;
  description: string;
  minimumOrderAmount: number | null;
  maximumDiscountAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number;
  validFrom: Date;
  validUntil: Date | null;
  applicableToAll: boolean;
  applicableCategories: string[];
}

export default function DiscountBulkCreate() {
  const [formData, setFormData] = useState<BulkDiscountForm>({
    count: 10,
    prefix: '',
    suffix: '',
    codeLength: 8,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    publicName: 'Bulk Discount',
    description: '',
    minimumOrderAmount: null,
    maximumDiscountAmount: null,
    usageLimit: 1,
    usageLimitPerUser: 1,
    validFrom: new Date(),
    validUntil: null,
    applicableToAll: true,
    applicableCategories: [],
  });

  const [previewCodes, setPreviewCodes] = useState<string[]>([]);
  const [createdCodes, setCreatedCodes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const bulkCreateMutation = useMutation({
    mutationFn: bulkCreateDiscounts,
    onSuccess: (data) => {
      setCreatedCodes(data);
      toast.success(`Successfully created ${data.length} discount codes!`);
      setProgress(100);
    },
    onError: (error) => {
      toast.error('Failed to create discount codes');
      console.error(error);
    },
  });

  const generatePreviewCodes = () => {
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < Math.min(formData.count, 10); i++) {
      let code = '';
      for (let j = 0; j < formData.codeLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(`${formData.prefix}${code}${formData.suffix}`);
    }
    
    setPreviewCodes(codes);
  };

  const handleCreateBulkDiscounts = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await bulkCreateMutation.mutateAsync(formData);
      clearInterval(progressInterval);
      setProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCodes = () => {
    if (createdCodes.length === 0) return;

    const csvContent = [
      ['Code', 'Type', 'Value', 'Valid From', 'Valid Until', 'Usage Limit'].join(','),
      ...createdCodes.map(code => [
        code.discountCode,
        code.discountType,
        code.discountValue,
        code.validFrom,
        code.validUntil || 'No expiration',
        code.usageLimit || 'Unlimited'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-discount-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyAllCodes = async () => {
    if (createdCodes.length === 0) return;
    
    const codesText = createdCodes.map(code => code.discountCode).join('\n');
    await navigator.clipboard.writeText(codesText);
    toast.success('All codes copied to clipboard!');
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (formData.count < 1 || formData.count > 1000) {
      errors.push('Count must be between 1 and 1000');
    }
    
    if (formData.codeLength < 4 || formData.codeLength > 20) {
      errors.push('Code length must be between 4 and 20 characters');
    }
    
    if (!formData.publicName.trim()) {
      errors.push('Public name is required');
    }
    
    if (formData.discountValue <= 0) {
      errors.push('Discount value must be greater than 0');
    }
    
    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    }

    return errors;
  };

  const formErrors = validateForm();
  const isFormValid = formErrors.length === 0;

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number of Codes</Label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.count}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    count: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
              
              <div>
                <Label>Code Length</Label>
                <Input
                  type="number"
                  min="4"
                  max="20"
                  value={formData.codeLength}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    codeLength: parseInt(e.target.value) || 8 
                  }))}
                />
              </div>
            </div>

            {/* Prefix & Suffix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prefix (Optional)</Label>
                <Input
                  placeholder="e.g., SAVE"
                  maxLength={6}
                  value={formData.prefix}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prefix: e.target.value 
                  }))}
                />
              </div>
              
              <div>
                <Label>Suffix (Optional)</Label>
                <Input
                  placeholder="e.g., 2024"
                  maxLength={6}
                  value={formData.suffix}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    suffix: e.target.value 
                  }))}
                />
              </div>
            </div>

            {/* Discount Settings */}
            <div className="space-y-4">
              <div>
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(value: any) => setFormData(prev => ({ 
                    ...prev, 
                    discountType: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {formData.discountType === 'PERCENTAGE' ? 'Discount Percentage' : 
                   formData.discountType === 'FIXED_AMOUNT' ? 'Discount Amount' : 
                   'Shipping Discount'}
                </Label>
                <Input
                  type="number"
                  step={formData.discountType === 'PERCENTAGE' ? "1" : "0.01"}
                  min="0"
                  max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    discountValue: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            {/* Naming */}
            <div>
              <Label>Public Name Template</Label>
              <Input
                value={formData.publicName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  publicName: e.target.value 
                }))}
                placeholder="Bulk Discount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Each code will be numbered (e.g., "Bulk Discount #1")
              </p>
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                placeholder="Bulk generated discount codes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage & Validity Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Restrictions */}
            <div>
              <Label>Minimum Order Amount (Optional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.minimumOrderAmount || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  minimumOrderAmount: e.target.value ? parseFloat(e.target.value) : null 
                }))}
              />
            </div>

            {formData.discountType === 'PERCENTAGE' && (
              <div>
                <Label>Maximum Discount Amount (Optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="No limit"
                  value={formData.maximumDiscountAmount || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    maximumDiscountAmount: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                />
              </div>
            )}

            {/* Usage Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    usageLimit: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="Unlimited"
                />
              </div>
              
              <div>
                <Label>Usage Per Customer</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    usageLimitPerUser: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid From</Label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom.toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    validFrom: new Date(e.target.value) 
                  }))}
                />
              </div>
              
              <div>
                <Label>Valid Until (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.validUntil?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    validUntil: e.target.value ? new Date(e.target.value) : null 
                  }))}
                />
              </div>
            </div>

            {/* Product Applicability */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Apply to All Products</Label>
                <p className="text-sm text-muted-foreground">
                  Discount applies to all products in your store
                </p>
              </div>
              <Switch
                checked={formData.applicableToAll}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  applicableToAll: checked 
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Generation */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Code Preview</TabsTrigger>
          <TabsTrigger value="summary">Configuration Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Preview</CardTitle>
                <Button onClick={generatePreviewCodes} variant="outline">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {previewCodes.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Sample codes (showing {previewCodes.length} of {formData.count}):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {previewCodes.map((code, index) => (
                      <code key={index} className="p-2 bg-muted rounded font-mono text-sm">
                        {code}
                      </code>
                    ))}
                  </div>
                  {formData.count > 10 && (
                    <p className="text-xs text-muted-foreground">
                      ...and {formData.count - 10} more codes
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Click "Generate Preview" to see sample discount codes
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Codes to Create</p>
                  <p className="text-2xl font-bold">{formData.count}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Discount Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formData.discountType === 'PERCENTAGE' 
                      ? `${formData.discountValue}%` 
                      : formData.discountType === 'FIXED_AMOUNT'
                      ? formatCurrency(formData.discountValue)
                      : 'FREE'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Usage Limit</p>
                  <p className="text-2xl font-bold">
                    {formData.usageLimit || '∞'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Min. Order</p>
                  <p className="text-2xl font-bold">
                    {formData.minimumOrderAmount 
                      ? formatCurrency(formData.minimumOrderAmount) 
                      : 'None'
                    }
                  </p>
                </div>
              </div>

              // components/dashboard/discounts/DiscountBulkCreate.tsx (continued)
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Estimated Impact
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• {formData.count} unique discount codes will be created</li>
                  <li>• Each code can be used {formData.usageLimitPerUser} time{formData.usageLimitPerUser > 1 ? 's' : ''} per customer</li>
                  <li>• Total potential uses: {formData.usageLimit ? (formData.usageLimit * formData.count) : 'Unlimited'}</li>
                  <li>• Estimated code generation time: ~{Math.ceil(formData.count / 100)} second{Math.ceil(formData.count / 100) > 1 ? 's' : ''}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Validation Errors */}
      {formErrors.length > 0 && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Please fix the following errors:</div>
            <ul className="list-disc list-inside text-sm">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Creating discount codes...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Generating {formData.count} discount codes...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {createdCodes.length > 0 && (
            <>
              <Button onClick={exportCodes} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={copyAllCodes} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy All Codes
              </Button>
            </>
          )}
        </div>

        <Button
          onClick={handleCreateBulkDiscounts}
          disabled={!isFormValid || isGenerating}
          size="lg"
          className="min-w-40"
        >
          {isGenerating ? (
            'Creating...'
          ) : (
            <>
              <Layers className="h-4 w-4 mr-2" />
              Create {formData.count} Codes
            </>
          )}
        </Button>
      </div>

      {/* Success Results */}
      {createdCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Successfully Created {createdCodes.length} Discount Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{createdCodes.length}</p>
                  <p className="text-sm text-muted-foreground">Codes Created</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formData.discountType === 'PERCENTAGE' 
                      ? `${formData.discountValue}%` 
                      : formatCurrency(formData.discountValue)
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Discount Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {createdCodes.reduce((sum, code) => sum + (code.usageLimit || 0), 0) || '∞'}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">Active</p>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {createdCodes.slice(0, 20).map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <code className="font-mono">{code.discountCode}</code>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {code.discountType}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(code.discountCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {createdCodes.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ...and {createdCodes.length - 20} more codes
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
