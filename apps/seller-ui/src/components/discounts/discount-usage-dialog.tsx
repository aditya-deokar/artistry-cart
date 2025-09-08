'use client';

import { format } from 'date-fns';
import { Users, Calendar, DollarSign, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscountCode } from '@/types';

interface DiscountUsageDialogProps {
  discount: DiscountCode;
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscountUsageDialog({ discount, isOpen, onClose }: DiscountUsageDialogProps) {
  const totalSavings = discount.usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Usage History: {discount.discountCode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{discount.currentUsageCount}</div>
                {discount.usageLimit && (
                  <p className="text-xs text-muted-foreground">
                    of {discount.usageLimit} limit
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalSavings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Given to customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {discount.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {discount.validUntil && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {format(new Date(discount.validUntil), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              {discount.usageHistory.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Discount Applied</TableHead>
                        <TableHead>Used Date</TableHead>
                        <TableHead>Order ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discount.usageHistory.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{usage.user.name}</div>
                                <div className="text-sm text-gray-500">{usage.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ₹{usage.discountAmount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(usage.usedAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(usage.usedAt), 'HH:mm')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              #{usage.id.slice(-8)}
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No usage history yet</p>
                  <p className="text-sm">This discount code hasn't been used by any customers.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discount Details */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Display Name:</strong> {discount.publicName}
                </div>
                <div>
                  <strong>Type:</strong> {discount.discountType.replace('_', ' ')}
                </div>
                <div>
                  <strong>Value:</strong>{' '}
                  {discount.discountType === 'PERCENTAGE' && `${discount.discountValue}%`}
                  {discount.discountType === 'FIXED_AMOUNT' && `₹${discount.discountValue}`}
                  {discount.discountType === 'FREE_SHIPPING' && 'Free Shipping'}
                </div>
                <div>
                  <strong>Min. Order:</strong>{' '}
                  {discount.minimumOrderAmount ? `₹${discount.minimumOrderAmount}` : 'No minimum'}
                </div>
                {discount.maximumDiscountAmount && (
                  <div>
                    <strong>Max Discount:</strong> ₹{discount.maximumDiscountAmount}
                  </div>
                )}
                {discount.usageLimitPerUser && (
                  <div>
                    <strong>Per User Limit:</strong> {discount.usageLimitPerUser} uses
                  </div>
                )}
                <div>
                  <strong>Created:</strong> {format(new Date(discount.createdAt), 'MMM dd, yyyy')}
                </div>
                <div>
                  <strong>Shop:</strong> {discount.shop.name}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
