// components/dashboard/discounts/DiscountsHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Upload, Ticket, LayoutGrid, List, Layers } from 'lucide-react';
import Link from 'next/link';
import { useDiscountStore } from '@/store/discounts/discountStore';

export default function DiscountsHeader() {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCount, 
    view, 
    setView, 
    activeDiscounts, 
    expiredDiscounts,
    inactiveDiscounts
  } = useDiscountStore();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ticket className="h-8 w-8" />
          Discount Codes
        </h1>
        <p className="text-muted-foreground">
          Create and manage discount codes for your customers
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="default">{activeDiscounts.length} Active</Badge>
          <Badge variant="destructive">{expiredDiscounts.length} Expired</Badge>
          <Badge variant="secondary">{inactiveDiscounts.length} Inactive</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search discount codes..."
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

        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Grid
              </div>
            </SelectItem>
            <SelectItem value="table">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Table
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/discounts/bulk-create">
            <Layers className="h-4 w-4 mr-2" />
            Bulk Create
          </Link>
        </Button>

        <Button asChild>
          <Link href="/seller/discounts/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Discount
          </Link>
        </Button>
      </div>
    </div>
  );
}
