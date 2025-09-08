'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Copy, Users, Eye, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiscountCode, PaginationData } from '@/types';

import { toast } from 'sonner';
import { useDeleteDiscount, useUpdateDiscount } from '@/hooks/useDiscounts';
import EditDiscountDialog from './edit-discount-dialog';
import DiscountUsageDialog from './discount-usage-dialog';

interface DiscountsTableProps {
  data: DiscountCode[];
  pagination?: PaginationData;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export default function DiscountsTable({
  data,
  pagination,
  onPageChange,
  currentPage,
}: DiscountsTableProps) {
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [viewingUsage, setViewingUsage] = useState<DiscountCode | null>(null);
  
  const deleteDiscount = useDeleteDiscount();
  const updateDiscount = useUpdateDiscount();

  const getStatusBadge = (discount: DiscountCode) => {
    if (!discount.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (discount.validUntil && new Date(discount.validUntil) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (discount.usageLimit && discount.currentUsageCount >= discount.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
  };

  const getDiscountTypeBadge = (type: string) => {
    const config = {
      PERCENTAGE: { variant: 'default' as const, label: 'Percentage', color: 'bg-blue-100 text-blue-800' },
      FIXED_AMOUNT: { variant: 'secondary' as const, label: 'Fixed Amount', color: 'bg-purple-100 text-purple-800' },
      FREE_SHIPPING: { variant: 'outline' as const, label: 'Free Shipping', color: 'bg-green-100 text-green-800' },
    };

    const typeConfig = config[type as keyof typeof config] || { variant: 'outline' as const, label: type, color: 'bg-gray-100 text-gray-800' };

    return <Badge variant={typeConfig.variant} className={typeConfig.color}>{typeConfig.label}</Badge>;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Discount code copied to clipboard!');
  };

  const toggleDiscountStatus = async (discount: DiscountCode) => {
    try {
      await updateDiscount.mutateAsync({
        discountId: discount.id,
        data: { isActive: !discount?.isActive }
      });
      toast.success(`Discount ${discount.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update discount status');
    }
  };

  const handleDelete = async (discount: DiscountCode) => {
    if (discount.currentUsageCount > 0) {
      toast.error('Cannot delete discount code that has been used');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${discount.publicName}"? This action cannot be undone.`)) {
      try {
        await deleteDiscount.mutateAsync(discount.id);
        toast.success('Discount code deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete discount code');
      }
    }
  };

  const columns: ColumnDef<DiscountCode>[] = [
    {
      accessorKey: 'publicName',
      header: 'Discount Details',
      cell: ({ row }) => {
        const discount = row.original;
        return (
          <div className="space-y-2">
            <div className="font-medium text-gray-900">{discount.publicName}</div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                {discount.discountCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(discount.discountCode)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            {discount.description && (
              <div className="text-sm text-gray-500 truncate max-w-60">
                {discount.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'discountType',
      header: 'Type',
      cell: ({ row }) => getDiscountTypeBadge(row.getValue('discountType')),
    },
    {
      accessorKey: 'discountValue',
      header: 'Value',
      cell: ({ row }) => {
        const discount = row.original;
        if (discount.discountType === 'PERCENTAGE') {
          return (
            <div className="font-medium text-blue-600">
              {discount.discountValue}%
            </div>
          );
        } else if (discount.discountType === 'FIXED_AMOUNT') {
          return (
            <div className="font-medium text-purple-600">
              ₹{discount.discountValue.toLocaleString()}
            </div>
          );
        } else {
          return (
            <div className="font-medium text-green-600">
              Free Shipping
            </div>
          );
        }
      },
    },
    {
      accessorKey: 'minimumOrderAmount',
      header: 'Min. Order',
      cell: ({ row }) => {
        const minOrder = row.getValue('minimumOrderAmount') as number;
        return minOrder ? (
          <span className="text-primary">₹{minOrder.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">No minimum</span>
        );
      },
    },
    {
      accessorKey: 'currentUsageCount',
      header: 'Usage Stats',
      cell: ({ row }) => {
        const discount = row.original;
        const usagePercentage = discount.usageLimit 
          ? (discount.currentUsageCount / discount.usageLimit) * 100
          : 0;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {discount.currentUsageCount}
                {discount.usageLimit && `/${discount.usageLimit}`}
              </span>
            </div>
            {discount.usageLimit && (
              <div className="w-full bg-background rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            )}
            {discount.usageLimitPerUser && (
              <div className="text-xs text-gray-500">
                Max {discount.usageLimitPerUser}/user
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'validUntil',
      header: 'Validity',
      cell: ({ row }) => {
        const discount = row.original;
        const now = new Date();
        const validFrom = new Date(discount.validFrom);
        const validUntil = discount.validUntil ? new Date(discount.validUntil) : null;

        return (
          <div className="space-y-1 text-sm">
            <div className="text-gray-600">
              From: {format(validFrom, 'MMM dd, yyyy')}
            </div>
            {validUntil ? (
              <div className={validUntil < now ? 'text-red-600' : 'text-gray-600'}>
                Until: {format(validUntil, 'MMM dd, yyyy')}
              </div>
            ) : (
              <div className="text-green-600">No expiry</div>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const discount = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => copyToClipboard(discount.discountCode)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setViewingUsage(discount)}>
                <Eye className="mr-2 h-4 w-4" />
                View Usage History
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setEditingDiscount(discount)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Discount
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => toggleDiscountStatus(discount)}>
                {discount.isActive ? (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => handleDelete(discount)}
                disabled={discount.currentUsageCount > 0}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
                {discount.currentUsageCount > 0 && (
                  <span className="text-xs ml-2">(Used)</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/80 bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-primary font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-accent">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-primary/80">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="w-8 h-8 text-gray-400" />
                    <span>No discount codes found.</span>
                    <span className="text-sm">Create your first discount code to get started.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalCount > 0 && (
        <div className="flex items-center justify-between bg-background px-4 py-3 border border-border rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalCount)} of {pagination.totalCount} discount codes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className=" "
            >
              Previous
            </Button>
            <span className="text-sm ">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className=" "
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {editingDiscount && (
        <EditDiscountDialog
          discount={editingDiscount}
          isOpen={true}
          onClose={() => setEditingDiscount(null)}
        />
      )}

      {viewingUsage && (
        <DiscountUsageDialog
          discount={viewingUsage}
          isOpen={true}
          onClose={() => setViewingUsage(null)}
        />
      )}
    </div>
  );
}
