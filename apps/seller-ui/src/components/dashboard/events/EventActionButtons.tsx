'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EventActionButtonsProps {
  eventId: string;
}

export default function EventActionButtons({
  eventId,
}: EventActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href={`/seller/events/${eventId}/products`}>Manage Products</Link>
      </Button>
      <Button asChild>
        <Link href={`/seller/events/${eventId}/edit`}>Edit Event</Link>
      </Button>
    </div>
  );
}
