// components/dashboard/products/ProductTable.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useProductStore } from '@/store/products/productStore';
import { getSellerProducts } from '@/lib/api/products';
import { DataTable } from '@/components/dashboard/shared/DataTable';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { EmptyState } from '@/components/dashboard/shared/EmptyState';
import { columns } from './ProductColumns';

export default function ProductsTable() {
  const { searchQuery, filters, page, limit } = useProductStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-products', { searchQuery, filters, page, limit }],
    queryFn: () => getSellerProducts({ 
      search: searchQuery,
      ...filters,
      page,
      limit 
    }),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error loading products</div>;
  if (!data?.products?.length) return <EmptyState entity="products" />;

  return (
    <DataTable
      columns={columns}
      data={data.products}
      searchKey="title"
      pagination={{
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }}
    />
  );
}
