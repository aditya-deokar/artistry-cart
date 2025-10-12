// components/dashboard/shared/DateRangePicker.tsx
'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export interface DateRangePreset {
  label: string;
  value: string;
  range: DateRange;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  presets?: DateRangePreset[];
  showPresets?: boolean;
  className?: string;
  disabled?: boolean;
}

const defaultPresets: DateRangePreset[] = [
  {
    label: "Today",
    value: "today",
    range: { from: new Date(), to: new Date() }
  },
  {
    label: "Yesterday",
    value: "yesterday",
    range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) }
  },
  {
    label: "Last 7 days",
    value: "last7days",
    range: { from: subDays(new Date(), 6), to: new Date() }
  },
  {
    label: "Last 30 days",
    value: "last30days",
    range: { from: subDays(new Date(), 29), to: new Date() }
  },
  {
    label: "This month",
    value: "thismonth",
    range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
  },
  {
    label: "Last month",
    value: "lastmonth",
    range: { 
      from: startOfMonth(subDays(startOfMonth(new Date()), 1)), 
      to: endOfMonth(subDays(startOfMonth(new Date()), 1)) 
    }
  },
  {
    label: "This year",
    value: "thisyear",
    range: { from: startOfYear(new Date()), to: endOfYear(new Date()) }
  }
];

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  presets = defaultPresets,
  showPresets = true,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return placeholder;
    }

    if (range.from && !range.to) {
      return format(range.from, "LLL dd, y");
    }

    if (range.from && range.to) {
      if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
        return format(range.from, "LLL dd, y");
      }
      return `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`;
    }

    return placeholder;
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    onChange(preset.range);
    setIsOpen(false);
  };

  const getCurrentPreset = () => {
    if (!value?.from || !value?.to) return null;
    
    return presets.find(preset => {
      const presetFrom = format(preset.range.from!, 'yyyy-MM-dd');
      const presetTo = format(preset.range.to!, 'yyyy-MM-dd');
      const valueFrom = format(value.from, 'yyyy-MM-dd');
      const valueTo = format(value.to, 'yyyy-MM-dd');
      
      return presetFrom === valueFrom && presetTo === valueTo;
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-auto justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
          <ChevronDown className="ml-auto h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets Sidebar */}
          {showPresets && presets.length > 0 && (
            <div className="border-r p-3 min-w-[160px]">
              <div className="space-y-1">
                <h4 className="font-medium text-sm mb-2">Presets</h4>
                {presets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm h-8",
                      getCurrentPreset()?.value === preset.value && "bg-accent"
                    )}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              className="rounded-md"
            />
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-3 border-t mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
              
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={!value?.from}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
