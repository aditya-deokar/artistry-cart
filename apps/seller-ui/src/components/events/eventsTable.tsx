'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Calendar, ExternalLink } from 'lucide-react';
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
import { Event, PaginationData } from '@/types';


import { toast } from 'sonner';
import Link from 'next/link';
import { useDeleteEvent } from '@/hooks/useEvents';
import EditEventDialog from './edit-event-dialog';

interface EventsTableProps {
  data: Event[];
  pagination?: PaginationData;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export default function EventsTable({
  data,
  pagination,
  onPageChange,
  currentPage,
}: EventsTableProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const deleteEvent = useDeleteEvent();

  const getEventStatusBadge = (event: Event) => {
    const now = new Date();
    const start = new Date(event.starting_date);
    const end = new Date(event.ending_date);

    if (now < start) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (event.is_active) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const getEventTypeBadge = (type: string) => {
    const config = {
      FLASH_SALE: { variant: 'destructive' as const, label: 'Flash Sale' },
      SEASONAL: { variant: 'default' as const, label: 'Seasonal' },
      CLEARANCE: { variant: 'secondary' as const, label: 'Clearance' },
      NEW_ARRIVAL: { variant: 'outline' as const, label: 'New Arrival' },
    };

    const typeConfig = config[type as keyof typeof config] || { variant: 'outline' as const, label: type };

    return <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>;
  };

  const handleDelete = async (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      try {
        await deleteEvent.mutateAsync(event.id);
        toast.success('Event deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'title',
      header: 'Event Details',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-primary">{event.title}</div>
            <div className="text-sm text-gray-500 truncate max-w-60">
              {event.description}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'event_type',
      header: 'Type',
      cell: ({ row }) => getEventTypeBadge(row.getValue('event_type')),
    },
    {
      accessorKey: 'discount_percent',
      header: 'Discount',
      cell: ({ row }) => {
        const discount = row.getValue('discount_percent') as number;
        return discount ? `${discount}%` : <span className="text-gray-400">N/A</span>;
      },
    },
    {
      accessorKey: 'starting_date',
      header: 'Duration',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(event.starting_date), 'MMM dd, yyyy')}
            </div>
            <div className="text-gray-500 text-xs">
              to {format(new Date(event.ending_date), 'MMM dd, yyyy')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'products',
      header: 'Products',
      cell: ({ row }) => {
        const products = row.getValue('products') as Event['products'];
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {products?.length || 0} products
          </Badge>
        );
      },
    },
    {
      accessorKey: 'views',
      header: 'Analytics',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-sm space-y-1">
            <div className="text-gray-900">{event.views.toLocaleString()} views</div>
            <div className="text-gray-500">{event.clicks.toLocaleString()} clicks</div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => getEventStatusBadge(row.original),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const event = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`} className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(event)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
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
      <div className="rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/70">
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
                <TableRow key={row.id} className="border-border hover:bg-background/50">
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                  No events found. Create your first event to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalCount > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalCount)} of {pagination.totalCount} events
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="text-gray-600 border-gray-300"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="text-gray-600 border-gray-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          isOpen={true}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}
