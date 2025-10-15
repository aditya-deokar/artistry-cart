# Event Detail Page Update

## Overview
Updated the event detail page to handle the new API response structure and match the bold, modern design of the events listing page.

## API Response Changes

### New Response Structure
```typescript
{
  "success": true,
  "data": {
    "id": "68efdd2254fe541c42714211",
    "title": "Event Title",
    "description": "Event description",
    // ... other event fields
    "products": [...],
    "productDiscounts": [],
    "shop": {  // ← lowercase 'shop' instead of 'Shop'
      "id": "...",
      "name": "Shop Name",
      "slug": "shop-slug",
      "avatar": null,
      "ratings": 0,
      "bio": "Shop description"
    }
  }
}
```

### Key Changes
1. **Nested Data**: Response wrapped in `{ success, data }`
2. **Lowercase Shop**: `shop` instead of `Shop`
3. **New Fields**:
   - `sellerId`
   - `views`, `clicks`, `conversions`, `totalRevenue`
   - `productDiscounts[]`
   - `shop.avatar` and `shop.bio`

## Code Updates

### 1. API Response Handling
```typescript
queryFn: async () => {
  const res = await axiosInstance.get(`/product/api/events/${eventId}`);
  console.log('Event Detail API Response:', res.data);
  
  // Handle response structure - data might be nested
  if (res.data.data) {
    return res.data.data;
  }
  return res.data;
}
```

### 2. Shop Property Compatibility
```typescript
// Handle both Shop (uppercase) and shop (lowercase) from API
const shop = (event as any).shop || event.Shop;
```

### 3. Type Definition Updates

**Added Shop Interface:**
```typescript
export interface Shop {
  id: string;
  name: string;
  slug: string;
  avatar?: { url: string; file_id: string } | null;
  logo?: { url: string; file_id: string };
  bio?: string;
  ratings?: number;
}
```

**Updated Event Interface:**
```typescript
export interface Event {
  // ... existing fields
  sellerId?: string;
  views?: number;
  clicks?: number;
  conversions?: number;
  totalRevenue?: number;
  productDiscounts?: any[];
  
  // Support both uppercase and lowercase shop property
  Shop?: Shop;
  shop?: Shop;
  // ...
}
```

## UI Improvements

### 1. Enhanced Hero Section
- Increased spacing: `mb-16` (was mb-12)
- Better padding: `py-8 md:py-12`

### 2. Improved Products Section
**Header:**
```tsx
<h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
<p className="text-lg text-muted-foreground">
  {products.length} products in this event
</p>
```

**Grid:**
- Larger gap: `gap-8` (was gap-6)
- Better responsive layout

**Empty State:**
```tsx
<div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
  <p className="text-lg">No products are currently featured</p>
  <p className="text-sm text-muted-foreground mt-2">
    Check back soon for exciting deals!
  </p>
</div>
```

### 3. Enhanced Shop CTA Card

**Design:**
```tsx
<div className="mt-16 rounded-2xl border-2 bg-gradient-to-br from-card to-muted/20 p-8 md:p-10 shadow-lg">
```

**Features:**
- Gradient background
- Larger avatar: `h-20 w-20` (was h-16 w-16)
- Border around avatar: `border-4`
- Shop bio display
- Ratings display with star icon
- Larger text: `text-2xl font-bold`

**Shop Avatar Handling:**
```tsx
// Supports both avatar and logo
{shop.avatar?.url || shop.logo?.url ? (
  <img
    src={shop.avatar?.url || shop.logo?.url}
    className="h-20 w-20 rounded-full border-4 border-background shadow-md"
  />
) : (
  <div className="h-20 w-20 rounded-full bg-primary/10 border-4 border-primary/20">
    <span className="text-3xl font-bold text-primary">{shop.name[0]}</span>
  </div>
)}
```

**Shop Info:**
```tsx
<div>
  <h3 className="text-2xl font-bold mb-1">{shop.name}</h3>
  <p className="text-muted-foreground">
    {shop.bio || 'Event hosted by this shop'}
  </p>
  {shop.ratings !== undefined && shop.ratings > 0 && (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-yellow-500 text-lg">★</span>
      <span className="ml-1 font-semibold">{shop.ratings.toFixed(1)}</span>
    </div>
  )}
</div>
```

### 4. Improved Loading State

**Enhanced Skeleton:**
```tsx
<div className="space-y-12 animate-pulse">
  {/* Back button skeleton */}
  <div className="h-10 w-32 bg-muted rounded-lg" />
  
  {/* Hero skeleton with details */}
  <div className="space-y-6">
    <div className="h-96 bg-muted rounded-2xl" />
    <div className="space-y-3">
      <div className="h-8 w-2/3 bg-muted rounded" />
      <div className="h-6 w-1/2 bg-muted rounded" />
    </div>
  </div>
  
  {/* Products grid skeleton */}
  <div>
    <div className="h-10 w-64 bg-muted rounded mb-6" />
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* 8 product skeletons */}
    </div>
  </div>
</div>
```

### 5. Enhanced Error State

```tsx
<div className="text-center py-32">
  <Calendar className="mx-auto h-20 w-20 text-muted-foreground/50 mb-6" />
  <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Not Found</h2>
  <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
    The event you're looking for doesn't exist or has been removed.
  </p>
  <Link href="/events">
    <Button size="lg" className="px-8">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Events
    </Button>
  </Link>
</div>
```

## Spacing & Layout Changes

### Before → After
```
py-8          → py-8 md:py-12
mb-6          → mb-8
mb-12         → mb-16
mt-12         → mt-16
p-6 md:p-8    → p-8 md:p-10
gap-6         → gap-8
h-16 w-16     → h-20 w-20
text-xl       → text-2xl
text-2xl      → text-3xl md:text-4xl
```

## Backward Compatibility

The code supports both old and new API response formats:

```typescript
// Response handling
if (res.data.data) {
  return res.data.data;  // New format
}
return res.data;         // Old format

// Shop property
const shop = (event as any).shop || event.Shop;  // Both cases
```

## Design Consistency

All improvements align with the events listing page design:
- ✅ Larger spacing and padding
- ✅ Bold typography (3xl → 4xl headings)
- ✅ Gradient backgrounds
- ✅ Border-2 for prominence
- ✅ Enhanced shadows (shadow-lg)
- ✅ Larger icons and avatars
- ✅ Better empty states
- ✅ Improved loading skeletons

## Console Logging

Added debug logging to help identify API response structure:
```typescript
console.log('Event Detail API Response:', res.data);
```

## Files Modified

1. **`apps/user-ui/src/app/(pages)/events/[eventId]/page.tsx`**
   - Updated API response handling
   - Enhanced UI design
   - Better loading and error states
   - Shop property compatibility

2. **`apps/user-ui/src/types/events.ts`**
   - Added `Shop` interface
   - Updated `Event` interface with new fields
   - Added support for both `shop` and `Shop` properties

## Testing Checklist

- [ ] Event detail page loads correctly
- [ ] Products grid displays properly
- [ ] Shop information shows with avatar/bio
- [ ] Shop ratings display when > 0
- [ ] "Visit Shop" button works
- [ ] Loading skeleton appears correctly
- [ ] Error state displays properly
- [ ] Back button navigation works
- [ ] Responsive design on mobile/tablet
- [ ] Works with both old and new API formats

## Future Enhancements

- [ ] Add social sharing buttons
- [ ] Show event statistics (views, clicks)
- [ ] Add "Similar Events" section
- [ ] Implement product filtering within event
- [ ] Add countdown timer in hero
- [ ] Show discount badges on products
- [ ] Add breadcrumb navigation
- [ ] Implement event favoriting
