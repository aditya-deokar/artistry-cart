// components/dashboard/products/ProductBulkActions.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Edit, 
  Trash2, 
  Tag, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Upload, 
  Download,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useProductStore } from '@/store/products/productStore';
import { useProductActions } from '@/store/products/productActions';
import { toast } from 'sonner';
import { ProductStatus } from '@/types/product';

export default function ProductBulkActions() {
  const [actionType, setActionType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Form states for different actions
  const [bulkUpdateData, setBulkUpdateData] = useState({
    status: '',
    category: '',
    brand: '',
    priceAdjustment: 0,
    priceType: 'percentage', // 'percentage' | 'fixed'
    tags: '',
    warranty: '',
    cash_on_delivery: false,
  });

  const { selectedProducts, selectedCount, clearSelection } = useProductStore();
  const { bulkUpdateProducts, bulkDeleteProducts } = useProductActions();

  const handleBulkAction = async () => {
    if (selectedCount === 0) {
      toast.error('Please select products first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      switch (actionType) {
        case 'update-status':
          if (!bulkUpdateData.status) {
            toast.error('Please select a status');
            return;
          }
          await bulkUpdateProducts({
            ids: selectedProducts,
            updates: { status: bulkUpdateData.status as ProductStatus }
          });
          break;

        case 'update-category':
          if (!bulkUpdateData.category) {
            toast.error('Please enter a category');
            return;
          }
          await bulkUpdateProducts({
            ids: selectedProducts,
            updates: { category: bulkUpdateData.category }
          });
          break;

        case 'update-price':
          if (!bulkUpdateData.priceAdjustment) {
            toast.error('Please enter a price adjustment');
            return;
          }
          // Price adjustment logic would be handled in the API
          await bulkUpdateProducts({
            ids: selectedProducts,
            updates: { 
              priceAdjustmentType: bulkUpdateData.priceType,
              priceAdjustment: bulkUpdateData.priceAdjustment 
            }
          });
          break;

        case 'add-tags':
          if (!bulkUpdateData.tags) {
            toast.error('Please enter tags');
            return;
          }
          const tags = bulkUpdateData.tags.split(',').map(tag => tag.trim());
          await bulkUpdateProducts({
            ids: selectedProducts,
            updates: { tags }
          });
          break;

        case 'delete':
          await bulkDeleteProducts();
          break;

        default:
          toast.error('Please select an action');
          return;
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      // Reset form
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setActionType('');
        setBulkUpdateData({
          status: '',
          category: '',
          brand: '',
          priceAdjustment: 0,
          priceType: 'percentage',
          tags: '',
          warranty: '',
          cash_on_delivery: false,
        });
      }, 1000);

    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const renderActionForm = () => {
    switch (actionType) {
      case 'update-status':
        return (
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select 
                value={bulkUpdateData.status} 
                onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'update-category':
        return (
          <div className="space-y-4">
            <div>
              <Label>New Category</Label>
              <Input
                placeholder="Enter category name"
                value={bulkUpdateData.category}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'update-price':
        return (
          <div className="space-y-4">
            <div>
              <Label>Price Adjustment Type</Label>
              <Select 
                value={bulkUpdateData.priceType} 
                onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, priceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {bulkUpdateData.priceType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </Label>
              <Input
                type="number"
                placeholder={bulkUpdateData.priceType === 'percentage' ? 'e.g., 10 for +10%' : 'e.g., 5.00'}
                value={bulkUpdateData.priceAdjustment}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, priceAdjustment: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {bulkUpdateData.priceType === 'percentage' 
                  ? 'Use negative values to decrease prices' 
                  : 'Use negative values to decrease prices by fixed amount'
                }
              </p>
            </div>
          </div>
        );

      case 'add-tags':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tags (comma separated)</Label>
              <Textarea
                placeholder="e.g., summer, sale, trending, featured"
                value={bulkUpdateData.tags}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, tags: e.target.value }))}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Tags will be added to existing tags for each product
              </p>
            </div>
          </div>
        );

      case 'update-brand':
        return (
          <div className="space-y-4">
            <div>
              <Label>Brand Name</Label>
              <Input
                placeholder="Enter brand name"
                value={bulkUpdateData.brand}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'update-settings':
        return (
          <div className="space-y-4">
            <div>
              <Label>Warranty</Label>
              <Input
                placeholder="e.g., 1 year warranty"
                value={bulkUpdateData.warranty}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, warranty: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cod"
                checked={bulkUpdateData.cash_on_delivery}
                onCheckedChange={(checked) => setBulkUpdateData(prev => ({ ...prev, cash_on_delivery: Boolean(checked) }))}
              />
              <Label htmlFor="cod">Enable Cash on Delivery</Label>
            </div>
          </div>
        );

      case 'delete':
        return (
          <Alert className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. 
              {selectedCount} products will be permanently deleted.
            </AlertDescription>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Actions
            {selectedCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCount} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCount === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Select products from the table to perform bulk actions
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <strong>{selectedCount}</strong> products selected for bulk operation
                </p>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
              
              <Separator />

              {/* Action Selection */}
              <div className="space-y-4">
                <div>
                  <Label>Select Action</Label>
                  <Select value={actionType} onValueChange={setActionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose bulk action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update-status">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Update Status
                        </div>
                      </SelectItem>
                      <SelectItem value="update-category">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Update Category
                        </div>
                      </SelectItem>
                      <SelectItem value="update-price">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Adjust Prices
                        </div>
                      </SelectItem>
                      <SelectItem value="add-tags">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Add Tags
                        </div>
                      </SelectItem>
                      <SelectItem value="update-brand">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Update Brand
                        </div>
                      </SelectItem>
                      <SelectItem value="update-settings">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Update Settings
                        </div>
                      </SelectItem>
                      <SelectItem value="delete">
                        <div className="flex items-center gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete Products
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Form */}
                {actionType && (
                  <div className="p-4 border rounded-lg space-y-4">
                    {renderActionForm()}
                    
                    {/* Progress Bar */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Processing...</span>
                          <span className="text-sm">{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleBulkAction}
                        disabled={isProcessing}
                        className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {actionType === 'delete' ? (
                              <Trash2 className="h-4 w-4 mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {actionType === 'delete' ? 'Delete Products' : 'Apply Changes'}
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setActionType('')}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import/Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import products from CSV file for bulk creation or updates
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Choose CSV File
              </Button>
              <Button variant="link" size="sm" className="w-full">
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export your products data for backup or analysis
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Products
              </Button>
              {selectedCount > 0 && (
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected ({selectedCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
