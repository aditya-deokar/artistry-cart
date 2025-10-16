# Upcoming Events Feature

## Overview
Added a dedicated "Upcoming Events" section to the events page that showcases events that haven't started yet, giving users a preview of future sales and promotions.

## Features Implemented

### 1. Upcoming Events Section
- **Location**: Between hero section and active events listing
- **Design**: Premium glass morphism card with gradient backgrounds
- **Visibility**: Only shows when there are upcoming events available

### 2. API Integration
```typescript
// Fetches events where is_active=false
const { data: upcomingData, isLoading: upcomingLoading } = useQuery<EventsResponse>({
  queryKey: ['upcoming-events'],
  queryFn: async () => {
    const res = await axiosInstance.get(`/product/api/events?limit=6&is_active=false`);
    const allEvents = res.data.events || [];
    // Filter for events that haven't started yet
    const now = new Date();
    const upcoming = allEvents.filter((event: any) => {
      const startDate = new Date(event.starting_date);
      return startDate > now;
    });
    return { ...res.data, events: upcoming };
  },
  staleTime: 1000 * 60 * 5,
});
```

### 3. Enhanced EventCard Component
- Added `upcoming?: boolean` prop to enable special styling
- **Upcoming Event Styling**:
  - Gradient background from card to primary color
  - Enhanced border with primary color
  - "Coming Soon" badge with gradient from primary to purple
  - Countdown timer showing "Starts in: X days, Y hours"
  - Slightly reduced image opacity for visual distinction

### 4. Visual Design Elements
- **Section Header**:
  - Calendar icon badge with "Coming Soon" label
  - Large gradient title "Upcoming Events"
  - Descriptive subtitle
  
- **Background Effects**:
  - Grid pattern overlay
  - Animated blur circles
  - Gradient background

- **Loading States**:
  - 3 skeleton cards with pulse animation
  - Staggered animation delays

- **Grid Layout**:
  - 1 column on mobile
  - 2 columns on tablet
  - 3 columns on desktop
  - Shows up to 6 upcoming events

### 5. Animations
- Fade in up animation for upcoming events section
- Staggered card animations (100ms delay per card)
- Smooth transitions on hover

## Files Modified

### `apps/user-ui/src/app/(pages)/events/page.tsx`
- Added `upcomingData` query for fetching upcoming events
- Added upcoming events section UI
- Updated "Browse Events" header to "Active Events" for clarity

### `apps/user-ui/src/components/events/EventCard.tsx`
- Added `upcoming` prop to interface
- Enhanced styling for upcoming events
- Added "Starts in" countdown for upcoming events
- Gradient "Coming Soon" badge for upcoming events

### `apps/user-ui/src/app/global.css`
- Added `@keyframes fadeInUp` animation
- Added `.animate-fadeInUp` utility class

## User Experience

### For Upcoming Events:
1. User visits events page
2. Sees hero section with active events stats
3. **NEW**: Upcoming Events section appears with gradient design
4. Each upcoming event shows:
   - "Coming Soon" gradient badge
   - Countdown to start time
   - Event details and banner
   - Special gradient border effect
5. Can click to view full event details

### For Active Events:
1. Continues to scroll to see active events
2. Uses filters and search to find specific events
3. Pagination for browsing all active events

## Technical Details

### Date Filtering Logic
```typescript
const now = new Date();
const upcoming = allEvents.filter((event: any) => {
  const startDate = new Date(event.starting_date);
  return startDate > now; // Event hasn't started yet
});
```

### Conditional Rendering
```tsx
{upcomingEvents.length > 0 && (
  // Upcoming events section only shows if there are upcoming events
)}
```

### Countdown Timer
- For upcoming events: Shows "Starts in: [countdown]"
- For active events: Shows "Ends in: [countdown]"
- Uses existing `CountdownTimer` component

## Styling Highlights

### Upcoming Event Card
```tsx
className={`group relative overflow-hidden rounded-xl border transition-all hover:shadow-lg ${
  upcoming 
    ? 'bg-gradient-to-br from-card via-card to-primary/5 border-primary/30 hover:border-primary/60' 
    : 'bg-card hover:border-primary/50'
}`}
```

### Coming Soon Badge
```tsx
className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold backdrop-blur-sm ${
  upcoming 
    ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/50' 
    : 'bg-yellow-500/90 text-white'
}`}
```

## Benefits

1. **Increased Engagement**: Users can plan ahead for future sales
2. **Better UX**: Clear separation between active and upcoming events
3. **Visual Appeal**: Premium design matches award-winning websites
4. **Anticipation**: Countdown timers build excitement
5. **Discovery**: Users see what's coming without having to search

## Future Enhancements

- Add "Remind Me" button for upcoming events
- Email notifications when events start
- Calendar integration (Add to Calendar button)
- Filter upcoming events by type
- Show more than 6 upcoming events with "View All" button
