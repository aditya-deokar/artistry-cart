# Events Page - New Bold Design with Big Cards

## Overview
Redesigned the events page with a bold, modern aesthetic featuring larger cards and upcoming events moved to the bottom.

## Key Design Changes

### 1. Hero Section - Bold & Impactful
**Features:**
- Gradient background (primary to purple)
- Large, bold typography (5xl → 7xl)
- "Live Events" badge with pulse animation
- Primary color accent on "Events & Deals"
- Larger stats with better spacing
- More vertical padding (py-16 → py-24)

```tsx
<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
  Discover Amazing
  <br />
  <span className="text-primary">Events & Deals</span>
</h1>
```

### 2. Layout Structure
**Order Changed:**
1. Hero Section (top)
2. Browse Events with filters
3. Active Events Grid (main content)
4. Upcoming Events (bottom) ← Moved here

**Benefits:**
- Users see active events first
- Better content priority
- Upcoming events don't distract from main content
- Natural flow from active → upcoming

### 3. Event Cards - Significantly Larger

**Previous Size:**
- Grid: `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Image: `aspect-[16/9]`
- Padding: `p-4`
- Border: `border` with `rounded-lg`

**New Size:**
- Grid: `sm:grid-cols-2 lg:grid-cols-3` (removed 4-col)
- Image: `aspect-[4/3]` (taller images)
- Padding: `p-6` (50% more space)
- Border: `border-2` with `rounded-xl`
- Gap: `gap-8` (larger spacing between cards)

### 4. Enhanced Card Design

**Visual Improvements:**
```tsx
// Hover Effects
hover:shadow-xl              // Stronger shadow
hover:-translate-y-1         // Lift effect
group-hover:scale-110        // Image zoom (was 105)

// Image Overlay
<div className="bg-gradient-to-t from-black/60 via-black/0" />

// Backdrop Blur on Badges
backdrop-blur-md
```

**Typography:**
- Title: `text-xl font-bold` (was lg, semibold)
- Description: Better line-height with `leading-relaxed`
- Shop name: `text-sm font-medium` (was xs)
- Better date formatting with full month name

**Spacing:**
- Card padding: `p-6` (was p-4)
- Content spacing: `space-y-4` (was space-y-3)
- Shop avatar: `h-8 w-8` (was h-5 w-5)
- Icons: `h-4 w-4` (was h-3 w-3)

### 5. Interactive Elements

**Enhanced Badges:**
```tsx
// Discount badge - larger
px-3 py-1.5 text-sm  // was px-2 py-1 text-xs

// Coming Soon badge - more prominent
backdrop-blur-md bg-primary/90 shadow-lg
```

**Info Cards:**
```tsx
// Countdown display
<div className="p-3 rounded-lg bg-muted/50">
  // Contained, card-like appearance
</div>

// Shop info with better avatar
<img className="h-8 w-8 rounded-full border-2 border-background shadow-sm" />
```

### 6. Upcoming Events Section

**Location:** Moved to bottom of page (after pagination)

**Design:**
- Centered header with badge
- Muted background (`bg-muted/30`)
- Border-top separator
- Same large card size as active events
- 3-column grid max

**Header:**
```tsx
<div className="text-center max-w-2xl mx-auto">
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background mb-4">
    <Calendar className="h-4 w-4 text-primary" />
    <span className="text-sm font-medium">Coming Soon</span>
  </div>
  <h2 className="text-3xl md:text-4xl font-bold mb-3">Upcoming Events</h2>
  <p className="text-muted-foreground">
    Don't miss out on these exciting events launching soon
  </p>
</div>
```

### 7. Filter Section

**Improved Layout:**
```tsx
// Desktop: Search on the left, filter on the right
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  <h2>Browse Events</h2>
  <div className="flex flex-col sm:flex-row gap-3">
    <Input className="sm:w-80" />  // Fixed width search
    <EventFilter className="sm:min-w-[180px]" />
  </div>
</div>
```

## Grid Comparison

### Old Layout (4 columns on XL)
```
┌────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │  XL screens
├────┼────┼────┼────┤
│ 5  │ 6  │ 7  │ 8  │
└────┴────┴────┴────┘
```
- Smaller cards
- More cards per row
- Less visual impact

### New Layout (3 columns max)
```
┌──────┬──────┬──────┐
│  1   │  2   │  3   │  All large screens
├──────┼──────┼──────┤
│  4   │  5   │  6   │  
└──────┴──────┴──────┘
```
- Bigger cards
- More prominent images
- Better focus on each event

## Responsive Breakpoints

### Mobile (< 640px)
- Single column grid
- Stacked filters
- Full-width search
- Cards stack vertically

### Tablet (640px - 1024px)
- 2-column grid
- Side-by-side search & filter
- Cards in rows of 2

### Desktop (>= 1024px)
- 3-column grid (was 4)
- Horizontal filter layout
- Larger card images
- More breathing room

## Card Dimensions

### Image Aspect Ratios
- **Active Events**: `aspect-[4/3]` (more square, taller)
- **Old Design**: `aspect-[16/9]` (wider, shorter)

### Padding Scale
```
Hero:        py-16 md:py-24  (was py-12 md:py-16)
Sections:    py-12 md:py-16  (consistent)
Cards:       p-6             (was p-4)
Grid Gap:    gap-8           (was gap-6)
```

## Color & Visual Hierarchy

### Hero
- Subtle gradient background
- Primary color for emphasis text
- Green pulse dot for "live" indicator

### Cards
- Border-2 for prominence
- Shadow-xl on hover
- Gradient overlay on image hover
- Backdrop blur on status badges

### Upcoming Section
- Muted background to differentiate
- Centered layout for emphasis
- Border-top separator

## Animation & Transitions

**Card Hover:**
```tsx
transition-all duration-300
hover:shadow-xl
hover:-translate-y-1
```

**Image Zoom:**
```tsx
transition-transform duration-500
group-hover:scale-110
```

**Fade In:**
```tsx
animation: 'fadeInUp 0.5s ease-out forwards'
animationDelay: `${index * 50}ms`
```

## Typography Scale

### Hero
- H1: `text-5xl md:text-6xl lg:text-7xl` (huge)
- Subtitle: `text-xl` (large)
- Stats: `text-2xl` (prominent)

### Section Headers
- H2: `text-2xl md:text-3xl` (bold)

### Cards
- Title: `text-xl font-bold`
- Description: `text-sm leading-relaxed`
- Meta: `text-sm`
- Shop: `text-sm font-medium`

## Benefits of New Design

1. **More Visual Impact**: Larger cards grab attention
2. **Better Content Priority**: Active events shown first
3. **Improved Readability**: Larger text, better spacing
4. **Stronger Hierarchy**: Clear sections with proper separation
5. **Better Mobile Experience**: Fewer columns = bigger cards on mobile
6. **More Professional**: Bold, confident design
7. **Better Image Showcase**: Taller aspect ratio shows products better
8. **Clearer CTAs**: Larger badges and buttons
9. **Improved Scannability**: More white space, clear sections
10. **Modern Aesthetic**: Contemporary card design with strong shadows

## Component Files Modified

1. **`apps/user-ui/src/app/(pages)/events/page.tsx`**
   - Reordered sections (upcoming moved to bottom)
   - Updated hero design
   - Changed grid to 3 columns max
   - Improved filter layout

2. **`apps/user-ui/src/components/events/EventCard.tsx`**
   - Increased card size (p-4 → p-6)
   - Changed image aspect ratio (16/9 → 4/3)
   - Enhanced hover effects
   - Larger typography
   - Better info card designs
   - Backdrop blur on badges

## Performance Notes

- Slightly larger images due to aspect ratio change
- More DOM elements per card (info containers)
- Heavier animations (scale-110 vs scale-105)
- Overall still performant with proper image optimization

## Future Enhancements

- [ ] Add image lazy loading
- [ ] Implement card skeleton with correct aspect ratio
- [ ] Add "View All Upcoming" button if > 6 events
- [ ] Consider masonry layout for varied heights
- [ ] Add filter animations
- [ ] Implement infinite scroll option
