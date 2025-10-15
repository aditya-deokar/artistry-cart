'use client';

import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { useSellerProductsForEvent } from '@/hooks/useEvents';


interface Product {
  id: string;
  title: string;
  images: any[];
  regular_price: number;
  current_price: number;
  sale_price?: number;
  stock: number;
  category: string;
  eventId?: string | null;
  event?: {
    id: string;
    title: string;
    ending_date: Date;
  };
}

interface ProductSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: string[];
  onProductsChange: (productIds: string[]) => void;
  eventId?: string; // For editing existing events
}

export default function ProductSelectionDialog({
  isOpen,
  onClose,
  selectedProducts,
  onProductsChange,
  eventId
}: ProductSelectionDialogProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useSellerProductsForEvent({
    search: debouncedSearch || undefined,
    page,
    limit: 20
  });

  const toggleProduct = (productId: string) => {
    const isSelected = selectedProducts.includes(productId);
    if (isSelected) {
      onProductsChange(selectedProducts.filter(id => id !== productId));
    } else {
      onProductsChange([...selectedProducts, productId]);
    }
  };

  const toggleSelectAll = () => {
    const availableProducts = data?.products?.filter((p: Product) => 
      !p.eventId || p.eventId === eventId
    ) || [];
    
    if (selectedProducts.length === availableProducts.length) {
      onProductsChange([]);
    } else {
      onProductsChange(availableProducts.map((p: Product) => p.id));
    }
  };

  const getProductImage = (product: Product) => {
    return product.images && product.images.length > 0 
      ? product.images[0].url || product.images[0] 
      : '/placeholder-product.jpg';
  };

  const isProductDisabled = (product: Product) => {
    return product.eventId && product.eventId !== eventId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Products for Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Controls */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={data?.products && selectedProducts.length === data.products.filter((p: Product) => !isProductDisabled(p)).length}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All Available ({data?.products?.filter((p: Product) => !isProductDisabled(p)).length || 0})
                </label>
              </div>

              <Badge variant="outline">
                {selectedProducts.length} selected
              </Badge>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="bg-gray-200 h-32 rounded mb-3"></div>
                      <div className="space-y-2">
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data?.products?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.products.map((product: Product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  const isDisabled = isProductDisabled(product);

                  return (
                    <Card 
                      key={product.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : isDisabled 
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => !isDisabled && toggleProduct(product.id)}
                    >
                      <CardContent className="p-4">
                        <div className="relative">
                          <img
                            src={getProductImage(product)}
                            alt={product.title}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                          {!isDisabled && (
                            <Checkbox
                              checked={isSelected}
                              className="absolute top-2 right-2 bg-white"
                              
                            />
                          )}
                          {isDisabled && (
                            <Badge className="absolute top-2 right-2 bg-orange-500">
                              In Event
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {product.title}
                          </h4>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              {product.current_price < product.regular_price ? (
                                <>
                                  <span className="text-sm font-semibold text-green-600">
                                    ₹{product.current_price.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through">
                                    ₹{product.regular_price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-semibold">
                                  ₹{product.regular_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <Badge variant="outline" className="text-xs">
                              {product.stock} in stock
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                            
                            {isDisabled && product.event && (
                              <Badge variant="outline" className="text-xs text-orange-600">
                                {product.event.title}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No products found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or add some products first
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedProducts.length} products selected
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Apply Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
