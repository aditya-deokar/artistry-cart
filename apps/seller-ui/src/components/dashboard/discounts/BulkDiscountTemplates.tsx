'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const templates = [
  {
    name: 'Flash Sale',
    type: 'PERCENTAGE',
    value: '15% off',
    notes: 'Short campaign discounts for limited-time promotions.',
  },
  {
    name: 'VIP Offer',
    type: 'FIXED_AMOUNT',
    value: '$25 off',
    notes: 'Higher-value incentives for loyal or high-intent buyers.',
  },
  {
    name: 'Free Shipping Push',
    type: 'FREE_SHIPPING',
    value: 'Shipping waived',
    notes: 'Useful when you want to reduce checkout friction quickly.',
  },
];

export default function BulkDiscountTemplates() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.name}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{template.name}</h3>
              <Badge variant="outline">{template.type}</Badge>
            </div>
            <p className="text-lg font-medium">{template.value}</p>
            <p className="text-sm text-muted-foreground">{template.notes}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
