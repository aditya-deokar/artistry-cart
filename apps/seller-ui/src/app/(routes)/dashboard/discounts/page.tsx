'use client';

import { useState, Suspense } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useSellerDiscounts } from '@/hooks/useDiscounts';
import CreateDiscountDialog from '@/components/discounts/CreateDiscountDialog';
import DiscountsTableSkeleton from '@/components/discounts/discounts-table-skeleton';
import DiscountsTable from '@/components/discounts/DiscountsTable';

function DiscountsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'expired' | 'scheduled' | 'all'>('all');
  const [discountType, setDiscountType] = useState('ALL');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error } = useSellerDiscounts({
    page,
    limit: 10,
    status: status !== 'all' ? status : undefined,
    discount_type: discountType !== 'ALL' ? discountType : undefined,
    search: debouncedSearch || undefined,
  });

  if (error) {
    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-600 mt-2">
            Create and manage discount codes for your customers
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Discount Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Discount Codes</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search discount codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={status} onValueChange={(value) => setStatus(value as 'active' | 'expired' | 'scheduled' | 'all')} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Codes</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value={status} className="mt-6">
              {isLoading ? (
                <DiscountsTableSkeleton />
                // <div>loading</div>
              ) : (
                <DiscountsTable
                  data={data?.discountCodes || []}
                  pagination={data?.pagination}
                  onPageChange={setPage}
                  currentPage={page}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateDiscountDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

export default function DiscountsPage() {
  return (
    <Suspense fallback={<DiscountsTableSkeleton />}>
      <DiscountsContent />
    </Suspense>
  );
}
