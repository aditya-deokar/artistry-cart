'use client';

import { useState } from 'react';
import EventProductSelector from './EventProductSelector';

interface EventProductManagerProps {
  eventId: string;
}

export default function EventProductManager({
  eventId,
}: EventProductManagerProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  return (
    <EventProductSelector
      eventId={eventId}
      selectedProducts={selectedProducts}
      onProductsChange={setSelectedProducts}
    />
  );
}
