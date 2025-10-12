// components/dashboard/products/ProductPreview.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';

interface ProductPreviewProps {
  product: Product;
  trigger?: React.ReactNode;
}

export default function ProductPreview({ product, trigger }: ProductPreviewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');

  const discountPercent = product.is_on_discount && product.sale_price 
    ? ((product.regular_price - product.sale_price) / product.regular_price * 100).toFixed(0)
    : null;

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
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Preview</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {product.images[selectedImage]?.url ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image available
                </div>
              )}
              
              {product.is_on_discount && discountPercent && (
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {discountPercent}% OFF
                  </Badge>
                </div>
              )}
              
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0",
                      index === selectedImage ? "border-primary" : "border-transparent"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.ratings}</span>
                  <span className="text-muted-foreground">
                    ({product.totalSales || 0} sold)
                  </span>
                </div>
                
                <Badge variant="outline">{product.category}</Badge>
                
                {product.brand && (
                  <Badge variant="secondary">{product.brand}</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(product.current_price)}
                </span>
                
                {product.is_on_discount && product.regular_price !== product.current_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.regular_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Variations */}
            {(product.colors.length > 0 || product.sizes.length > 0) && (
              <div className="space-y-4">
                {product.colors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Color: {selectedColor}</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "px-4 py-2 rounded-md border text-sm transition-colors",
                            color === selectedColor
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Size: {selectedSize}</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "px-4 py-2 rounded-md border text-sm transition-colors",
                            size === selectedSize
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1" disabled={product.stock === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Free Shipping</div>
                <div className="text-xs text-muted-foreground">On orders $50+</div>
              </div>
              
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Secure Payment</div>
                <div className="text-xs text-muted-foreground">SSL Protected</div>
              </div>
              
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-sm font-medium">Easy Returns</div>
                <div className="text-xs text-muted-foreground">30 day policy</div>
              </div>
            </div>

            {/* Product Information Tabs */}
            <Tabs defaultValue="description" className="mt-6">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                {product.warranty && (
                  <TabsTrigger value="warranty">Warranty</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      
                      {product.detailed_description && (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: product.detailed_description 
                          }} 
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Category:</span>
                          <p className="font-medium">{product.category}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Sub Category:</span>
                          <p className="font-medium">{product.subCategory}</p>
                        </div>
                        
                        {product.brand && (
                          <div>
                            <span className="text-sm text-muted-foreground">Brand:</span>
                            <p className="font-medium">{product.brand}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <p className="font-medium">{product.stock} units</p>
                        </div>
                      </div>
                      
                      {product.custom_specifications && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Custom Specifications</h4>
                          <div className="space-y-2">
                            {Object.entries(product.custom_specifications).map(([key, value]) => (
                              <div key={key} className="grid grid-cols-2 gap-4">
                                <span className="text-sm text-muted-foreground">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {product.warranty && (
                <TabsContent value="warranty" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground">{product.warranty}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
