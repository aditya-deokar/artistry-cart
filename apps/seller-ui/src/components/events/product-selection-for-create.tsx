'use client';

import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSellerProductsForEvent } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  title: string;
  regular_price: number;
  sale_price?: number;
  current_price: number;
  stock_quantity: number;
  images?: Array<{ url: string }>;
  category?: { name: string };
}

interface ProductSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onProductsSelected: (products: Product[], productIds: string[]) => void;
}

export default function ProductSelectionDialog({
  isOpen,
  onClose,
  selectedProductIds,
  onProductsSelected,
}: ProductSelectionDialogProps) {
  const [search, setSearch] = useState('');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedProductIds);
  const [tempSelectedProducts, setTempSelectedProducts] = useState<Product[]>([]);

  const { data, isLoading } = useSellerProductsForEvent({
    search: search || undefined,
    limit: 50,
  });

  const products = data?.products || [];

  const handleToggleProduct = (product: Product) => {
    if (tempSelectedIds.includes(product.id)) {
      setTempSelectedIds(tempSelectedIds.filter((id) => id !== product.id));
      setTempSelectedProducts(tempSelectedProducts.filter((p) => p.id !== product.id));
    } else {
      setTempSelectedIds([...tempSelectedIds, product.id]);
      setTempSelectedProducts([...tempSelectedProducts, product]);
    }
  };

  const handleConfirm = () => {
    onProductsSelected(tempSelectedProducts, tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedProductIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Products for Event</DialogTitle>
          <DialogDescription>
            Choose products to include in this promotional event
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Count */}
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-gray-600">
            {tempSelectedIds.length} product{tempSelectedIds.length !== 1 ? 's' : ''} selected
          </p>
          {tempSelectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempSelectedIds([]);
                setTempSelectedProducts([]);
              }}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <Skeleton className="w-full h-32 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">No products found</p>
              <p className="text-sm text-gray-500 mt-1">
                {search ? 'Try a different search term' : 'Create products first to add them to events'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((product: Product) => {
                const isSelected = tempSelectedIds.includes(product.id);
                return (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleToggleProduct(product)}
                  >
                    <CardContent className="p-3 relative">
                      {/* Checkbox */}
                      <div className="absolute top-2 right-2 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleProduct(product)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Product Image */}
                      <div className="relative mb-2">
                        <img
                          src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                          alt={product.title}
                          className="w-full h-32 object-cover rounded"
                        />
                        {product.stock_quantity <= 0 && (
                          <Badge variant="destructive" className="absolute bottom-2 left-2 text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <h4 className="text-sm font-medium line-clamp-1 mb-1">{product.title}</h4>
                      
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                      )}

                      <div className="flex items-center gap-2">
                        {product.sale_price ? (
                          <>
                            <span className="text-sm font-bold text-green-600">
                              ₹{product.sale_price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product.regular_price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">
                            ₹{product.regular_price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {product.stock_quantity}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={tempSelectedIds.length === 0}>
            Add {tempSelectedIds.length} Product{tempSelectedIds.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
