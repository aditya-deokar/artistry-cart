// components/dashboard/discounts/DiscountTable.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useDiscountStore } from '@/store/discounts/discountStore';
import { getSellerDiscountCodes } from '@/lib/api/discounts';
import { DataTable } from '@/components/dashboard/shared/DataTable';
import { LoadingState } from '@/components/dashboard/shared/LoadingState';
import { EmptyState } from '@/components/dashboard/shared/EmptyState';
import { ColumnDef } from '@tanstack/react-table';
import { DiscountCode } from '@/types/discount';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Edit, Eye, Trash2, Percent, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

export default function DiscountsTable() {
  const { searchQuery, filters, page, limit, selectedDiscounts, toggleDiscountSelection } = useDiscountStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-discounts', { searchQuery, filters, page, limit }],
    queryFn: () => getSellerDiscountCodes({ 
      search: searchQuery,
      ...filters,
      page,
      limit 
    }),
  });

  const columns: ColumnDef<DiscountCode>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedDiscounts.includes(row.original.id)}
          onCheckedChange={() => toggleDiscountSelection(row.original.id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'publicName',
      header: 'Discount Name',
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link 
            href={`/seller/discounts/${row.original.id}`}
            className="font-medium hover:text-primary"
          >
            {row.original.publicName}
          </Link>
          <div className="text-sm text-muted-foreground">
            Code: <code className="font-mono">{row.original.discountCode}</code>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'discountType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          {row.original.discountType === 'PERCENTAGE' ? (
            <Percent className="h-3 w-3" />
          ) : (
            <DollarSign className="h-3 w-3" />
          )}
          {row.original.discountType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'discountValue',
      header: 'Value',
      cell: ({ row }) => (
        <div className="font-medium text-green-600">
          {row.original.discountType === 'PERCENTAGE' 
            ? `${row.original.discountValue}%` 
            : row.original.discountType === 'FIXED_AMOUNT'
            ? formatCurrency(row.original.discountValue)
            : 'FREE'
          }
        </div>
      ),
    },
    {
      accessorKey: 'usage',
      header: 'Usage',
      cell: ({ row }) => {
        const usage = row.original.currentUsageCount;
        const limit = row.original.usageLimit;
        const percentage = limit ? Math.round((usage / limit) * 100) : 0;
        
        return (
          <div className="space-y-1">
            <div className="text-sm">
              {usage}{limit ? ` / ${limit}` : ''}
            </div>
            {limit && (
              <Progress value={percentage} className="h-1 w-16" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'validFrom',
      header: 'Valid Period',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.validFrom)}</div>
          {row.original.validUntil && (
            <div className="text-muted-foreground">
              to {formatDate(row.original.validUntil)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        const isExpired = row.original.validUntil && new Date(row.original.validUntil) < new Date();
        
        return (
          <Badge 
            variant={
              !isActive ? 'secondary' : 
              isExpired ? 'destructive' : 
              'default'
            }
          >
            {!isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const copyCode = async () => {
          await navigator.clipboard.writeText(row.original.discountCode);
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/seller/discounts/${row.original.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/seller/discounts/${row.original.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error loading discounts</div>;
  if (!data?.discounts?.length) return <EmptyState entity="discount codes" />;

  return (
    <DataTable
      columns={columns}
      data={data.discounts}
      searchKey="publicName"
      pagination={{
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }}
    />
  );
}
