'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Truck, Ban } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING':
            return 'secondary';
        case 'PROCESSING':
            return 'default'; // blue-ish usually
        case 'SHIPPED':
            return 'default';
        case 'DELIVERED':
            return 'secondary'; // green-ish if I had success variant, but secondary is usually gray/muted. I'll stick to default/secondary for now.
        case 'CANCELLED':
            return 'destructive';
        case 'PAID':
            return 'outline';
        default:
            return 'secondary';
    }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case 'SUCCEEDED':
            return 'default'; // success green ideally
        case 'PENDING':
            return 'secondary';
        case 'FAILED':
            return 'destructive';
        case 'REFUNDED':
            return 'outline';
        default:
            return 'secondary';
    }
};

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => <div className="font-mono text-xs">{row.original.id.slice(-8)}</div>,
    },
    {
        accessorKey: 'user.name',
        header: 'Customer',
    },
    {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ row }) => {
            const amount = parseFloat(row.original.totalAmount.toString());
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'payment.status', // Access nested property safely? iterating usually handles dots.
        header: 'Payment',
        cell: ({ row }) => {
            const status = row.original.payment?.status || 'PENDING';
            return <Badge variant={getPaymentStatusColor(status)}>{status}</Badge>;
        },
    },
    {
        accessorKey: 'status',
        header: 'Fulfillment',
        cell: ({ row }) => {
            const status = row.original.status;
            return <Badge variant={getStatusColor(status)}>{status}</Badge>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const order = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel Order
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
