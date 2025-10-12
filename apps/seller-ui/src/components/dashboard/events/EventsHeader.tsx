// components/dashboard/events/EventsHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Upload, Calendar, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { useEventStore } from '@/store/events/eventStore';

export default function EventsHeader() {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCount, 
    view, 
    setView, 
    activeEvents, 
    upcomingEvents 
  } = useEventStore();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Events
        </h1>
        <p className="text-muted-foreground">
          Manage your promotional events and sales campaigns
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="default">{activeEvents.length} Active</Badge>
          <Badge variant="secondary">{upcomingEvents.length} Upcoming</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          {selectedCount > 0 && (
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
          )}
        </div>

        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Grid
              </div>
            </SelectItem>
            <SelectItem value="table">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Table
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href="/seller/events/templates">
            Templates
          </Link>
        </Button>

        <Button asChild>
          <Link href="/seller/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>
    </div>
  );
}
