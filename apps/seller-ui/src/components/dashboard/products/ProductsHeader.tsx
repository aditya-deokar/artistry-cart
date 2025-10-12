// components/dashboard/products/ProductsHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Upload, Settings } from 'lucide-react';
import Link from 'next/link';
import { useProductStore } from '@/store/products/productStore';
import { Badge } from '@/components/ui/badge';

export default function ProductsHeader() {
  const { searchQuery, setSearchQuery, selectedCount } = useProductStore();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory and pricing
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          {selectedCount > 0 && (
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/products/bulk-actions">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Link>
        </Button>

        <Button asChild>
          <Link href="/seller/products/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
}
