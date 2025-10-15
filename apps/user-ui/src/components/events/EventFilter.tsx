'use client';

import { EventType } from '@/types/events';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventFilterProps {
  selectedType: EventType | 'all';
  onTypeChange: (type: EventType | 'all') => void;
}

const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'FLASH_SALE', label: 'Flash Sale' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'CLEARANCE', label: 'Clearance' },
  { value: 'NEW_ARRIVAL', label: 'New Arrivals' },
];

export function EventFilter({ selectedType, onTypeChange }: EventFilterProps) {
  return (
    <Select
      value={selectedType}
      onValueChange={(value) => onTypeChange(value as EventType | 'all')}
    >
      <SelectTrigger className="h-11">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        {eventTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
