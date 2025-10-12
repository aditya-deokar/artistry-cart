// components/dashboard/events/EventProductSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, Filter, X, Plus, Minus } from 'lucide-react';
import { getSellerProductsForEvent } from '@/lib/api/events';
import { getCategories } from '@/lib/api/products';
import { formatCurrency } from '@/lib/utils/formatting';
import { Product } from '@/types/product';
import { DataTable } from '@/components/dashboard/shared/DataTable';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import Image from 'next/image';

interface EventProductSelectorProps {
  selectedProducts: string[];
  onProductsChange: (productIds: string[]) => void;
  eventId?: string;
}

export default function EventProductSelector({
  selectedProducts,
  onProductsChange,
  eventId
}: EventProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products-for-event'],
    queryFn: getSellerProductsForEvent,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Filter products based on search and filters
  const filteredProducts = products?.filter((product: Product) => {
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter && product.category !== categoryFilter) {
      return false;
    }
    if (priceFilter === 'low' && product.current_price > 100) {
      return false;
    }
    if (priceFilter === 'high' && product.current_price <= 100) {
      return false;
    }
    return true;
  }) || [];

  const toggleProduct = (productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    onProductsChange(newSelection);
  };

  const selectAll = () => {
    onProductsChange(filteredProducts.map((p: Product) => p.id));
  };

  const clearAll = () => {
    onProductsChange([]);
  };

  const toggleCategory = (category: string) => {
    const categoryProducts = filteredProducts
      .filter((p: Product) => p.category === category)
      .map((p: Product) => p.id);
    
    const allCategorySelected = categoryProducts.every(id => selectedProducts.includes(id));
    
    if (allCategorySelected) {
      // Remove all category products
      onProductsChange(selectedProducts.filter(id => !categoryProducts.includes(id)));
    } else {
      // Add all category products
      const newSelection = [...new Set([...selectedProducts, ...categoryProducts])];
      onProductsChange(newSelection);
    }
  };

  if (isLoading) return <LoadingState />;

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className={`cursor-pointer transition-all ${
      selectedProducts.includes(product.id) ? 'ring-2 ring-primary' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selectedProducts.includes(product.id)}
            onCheckedChange={() => toggleProduct(product.id)}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {product.images[0]?.url && (
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium line-clamp-1">{product.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {product.category} • {product.stock} in stock
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatCurrency(product.current_price)}</span>
                {product.is_on_discount && (
                  <Badge variant="secondary" className="text-xs">Sale</Badge>
                )}
              </div>
              
              <Badge variant="outline" className="text-xs">
                {product.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Group products by category
  const productsByCategory = filteredProducts.reduce((acc: any, product: Product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Products for Event
              {selectedProducts.length > 0 && (
                <Badge variant="secondary">{selectedProducts.length} selected</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(view === 'grid' ? 'table' : 'grid')}
              >
                {view === 'grid' ? 'Table View' : 'Grid View'}
              </Button>
              
              {selectedProducts.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
              
              <Button size="sm" onClick={selectAll}>
                <Plus className="h-4 w-4 mr-1" />
                Select All Filtered
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categoriesData?.categories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Price</SelectItem>
                <SelectItem value="low">Under $100</SelectItem>
                <SelectItem value="high">Over $100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      <Tabs value={view === 'grid' ? 'grid' : 'table'} className="space-y-4">
        <TabsContent value="grid">
          {/* Category-grouped Grid View */}
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([category, categoryProducts]: [string, any]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {(categoryProducts as Product[]).length} products
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCategory(category)}
                      >
                        {(categoryProducts as Product[]).every(p => selectedProducts.includes(p.id))
                          ? <Minus className="h-4 w-4 mr-1" />
                          : <Plus className="h-4 w-4 mr-1" />
                        }
                        {(categoryProducts as Product[]).every(p => selectedProducts.includes(p.id))
                          ? 'Deselect All'
                          : 'Select All'
                        }
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(categoryProducts as Product[]).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent>
              <DataTable
                columns={[
                  {
                    id: 'select',
                    header: ({ table }) => (
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => {
                          if (value) {
                            const pageProductIds = table.getRowModel().rows.map(row => row.original.id);
                            onProductsChange([...new Set([...selectedProducts, ...pageProductIds])]);
                          } else {
                            const pageProductIds = table.getRowModel().rows.map(row => row.original.id);
                            onProductsChange(selectedProducts.filter(id => !pageProductIds.includes(id)));
                          }
                        }}
                      />
                    ),
                    cell: ({ row }) => (
                      <Checkbox
                        checked={selectedProducts.includes(row.original.id)}
                        onCheckedChange={() => toggleProduct(row.original.id)}
                      />
                    ),
                  },
                  {
                    accessorKey: 'title',
                    header: 'Product',
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        {row.original.images[0]?.url && (
                          <div className="relative w-8 h-8 rounded overflow-hidden">
                            <Image
                              src={row.original.images[0].url}
                              alt={row.original.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="font-medium">{row.original.title}</span>
                      </div>
                    ),
                  },
                  {
                    accessorKey: 'category',
                    header: 'Category',
                  },
                  {
                    accessorKey: 'current_price',
                    header: 'Price',
                    cell: ({ row }) => formatCurrency(row.original.current_price),
                  },
                  {
                    accessorKey: 'stock',
                    header: 'Stock',
                  },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge variant="outline">{row.original.status}</Badge>
                    ),
                  },
                ]}
                data={filteredProducts}
                searchKey="title"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedProducts.length} products selected for this event
                </p>
                <p className="text-sm text-muted-foreground">
                  These products will be included in your promotional event
                </p>
              </div>
              <Button variant="outline" onClick={clearAll}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
