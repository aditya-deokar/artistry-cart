// components/dashboard/discounts/DiscountActionButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Copy, BarChart3, Trash2, MoreVertical, Eye, Share } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDiscount } from '@/lib/api/discounts';

interface DiscountActionButtonsProps {
  discountId: string;
}

export default function DiscountActionButtons({ discountId }: DiscountActionButtonsProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      toast.success('Discount code deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['seller-discounts'] });
    },
    onError: () => {
      toast.error('Failed to delete discount code');
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      deleteMutation.mutate(discountId);
    }
  };

  const shareDiscount = async () => {
    const url = `${window.location.origin}/discount/${discountId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Discount link copied to clipboard');
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href={`/seller/discounts/${discountId}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>

      <Button variant="outline" asChild>
        <Link href={`/seller/discounts/${discountId}/usage`}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
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
            <Link href={`/seller/discounts/${discountId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareDiscount}>
            <Share className="h-4 w-4 mr-2" />
            Share Discount
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Discount
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
