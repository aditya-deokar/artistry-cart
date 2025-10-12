// components/dashboard/products/ProductCard.tsx
'use client';

import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, MoreVertical, Trash2, Copy, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/formatting';
import { useProductStore } from '@/store/products/productStore';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  selectable?: boolean;
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onView,
  selectable = false 
}: ProductCardProps) {
  const { selectedProducts, toggleProductSelection } = useProductStore();
  const isSelected = selectedProducts.includes(product.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const primaryImage = product.images?.[0]?.url || '/placeholder-product.jpg';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleProductSelection(product.id)}
            className="bg-white border-2"
          />
        </div>
      )}
      
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge 
            className={`${getStatusColor(product.status)} text-white text-xs`}
          >
            {product.status}
          </Badge>
          {product.is_on_discount && (
            <Badge variant="destructive" className="text-xs">
              Sale
            </Badge>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-2 hover:text-primary cursor-pointer">
            <Link href={`/seller/products/${product.id}`}>
              {product.title}
            </Link>
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatCurrency(product.current_price)}
            </span>
            {product.sale_price && product.regular_price !== product.current_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.regular_price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Stock: {product.stock}</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{product.totalSales || 0} sold</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            {product.brand && (
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(product.id)}
            asChild
          >
            <Link href={`/seller/products/${product.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(product.id)}
            asChild
          >
            <Link href={`/seller/products/${product.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/seller/products/${product.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/products/${product.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(product.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
