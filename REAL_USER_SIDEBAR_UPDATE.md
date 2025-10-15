# Real User Data Integration - Sidebar Footer

## Overview
Updated the app sidebar to display real seller information from the backend API, including seller name, email, avatar, shop details, and logo. The sidebar now dynamically loads and displays authenticated user data.

## Changes Made

### 1. **Integrated `useSeller` Hook** (`apps/seller-ui/src/shared/sidebar/app-sidebar/index.tsx`)

**Added Imports:**
```typescript
import useSeller from "@/hooks/useSeller";
import { Skeleton } from "@/components/ui/skeleton";
```

**Fetches Real Data:**
- Seller profile information
- Shop details and logo
- User avatar
- Email and name

### 2. **Dynamic Header with Shop Logo**

**Features:**
- ✅ Displays shop logo if available
- ✅ Shows shop name from backend
- ✅ Fallback to Store icon if no logo
- ✅ Loading skeleton during data fetch
- ✅ Graceful error handling

**States:**

**Loading State:**
```
┌──────────────────────────┐
│ [░░░░]  ░░░░░░░░░       │
│         ░░░░░░          │
└──────────────────────────┘
```

**With Shop Logo:**
```
┌──────────────────────────┐
│ [🖼️]   Shop Name         │
│        Seller Dashboard  │
└──────────────────────────┘
```

**Without Logo (Fallback):**
```
┌──────────────────────────┐
│ [🏪]   Shop Name         │
│        Seller Dashboard  │
└──────────────────────────┘
```

### 3. **Dynamic User Footer Section**

**Features:**
- ✅ Real user avatar (with fallback to initials)
- ✅ Seller name from backend
- ✅ Seller email from backend
- ✅ Initials generator for avatar fallback
- ✅ Loading skeleton during fetch
- ✅ Truncated text for long names/emails

**Avatar Priority:**
1. User's personal avatar (`seller.avatar.url`)
2. Shop logo (`seller.shop.logo.url`)
3. Initials fallback (first letters of name)

**Initials Logic:**
```typescript
const getInitials = (name?: string) => {
  if (!name) return "SC"; // Default
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase(); // "John Doe" → "JD"
  }
  return name.substring(0, 2).toUpperCase(); // "John" → "JO"
};
```

### 4. **Enhanced Dropdown Menu**

**Added Shop Information:**
```
┌─────────────────────────────┐
│  John Doe                   │
│  john@example.com           │
│  Shop: Artisan Crafts       │ ← NEW
├─────────────────────────────┤
│  👤 Profile Settings        │
│  🏪 Shop Settings           │ ← NEW
│  ⚙️ Dashboard Settings      │
├─────────────────────────────┤
│  🚪 Log out                 │
└─────────────────────────────┘
```

**New Menu Items:**
- "Shop Settings" - Added for shop management
- Shop name display in header section
- Better visual hierarchy

### 5. **Loading States**

**Header Loading:**
```tsx
{isLoading ? (
  <>
    <Skeleton className="size-10 rounded-xl" />
    <div className="flex flex-col gap-1">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </>
) : (
  // Real content
)}
```

**Footer Loading:**
```tsx
{isLoading ? (
  <div className="flex items-center gap-3 p-2">
    <Skeleton className="size-8 rounded-lg" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
) : (
  // Real user info
)}
```

## Data Structure

### Seller Profile Interface
```typescript
interface SellerProfile {
  id: string;
  name: string;                    // ✅ Displayed in footer
  email: string;                   // ✅ Displayed in footer
  phone?: string;
  avatar?: {                       // ✅ Used for avatar image
    url: string;
    file_id: string;
  };
  shop: {
    id: string;
    name: string;                  // ✅ Displayed in header
    slug: string;
    description?: string;
    logo?: {                       // ✅ Used in header
      url: string;
      file_id: string;
    };
    banner?: {
      url: string;
      file_id: string;
    };
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    website?: string;
    social?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      pinterest?: string;
    };
    isVerified: boolean;
    ratings: number;
    productCount: number;
    createdAt: string;
  };
  isActive: boolean;
  createdAt: string;
}
```

## API Integration

**Endpoint:** `GET /auth/api/logged-in-seller`

**React Query Configuration:**
```typescript
useQuery<SellerProfile, Error>({
  queryKey: ["seller"],
  queryFn: fetchSeller,
  staleTime: 1000 * 60 * 5,      // 5 minutes cache
  retry: 1,
  refetchOnWindowFocus: true,
});
```

**Features:**
- ✅ Automatic caching (5 minutes)
- ✅ Refetch on window focus
- ✅ Single retry on failure
- ✅ Loading states
- ✅ Error handling

## Visual Examples

### Complete User Footer Flow

**1. Loading State**
```
┌──────────────────────────────┐
│ [░░] ░░░░░░░░     ›         │
│      ░░░░░░░░░░             │
└──────────────────────────────┘
```

**2. Loaded with Data**
```
┌──────────────────────────────┐
│ [JD] John Doe       ›        │
│      john@shop.com           │
└──────────────────────────────┘
```

**3. Clicked (Dropdown Open)**
```
┌──────────────────────────────┐
│ [JD] John Doe       ›        │ ← Active
│      john@shop.com           │
└──────────────────────────────┘
   ┌──────────────────────────┐
   │ John Doe                 │
   │ john@shop.com            │
   │ Shop: Artisan Crafts     │
   ├──────────────────────────┤
   │ 👤 Profile Settings      │
   │ 🏪 Shop Settings         │
   │ ⚙️ Dashboard Settings    │
   ├──────────────────────────┤
   │ 🚪 Log out               │
   └──────────────────────────┘
```

### Complete Header Flow

**1. Loading State**
```
┌──────────────────────────────┐
│ [░░░░]  ░░░░░░░░░           │
│         ░░░░░░              │
└──────────────────────────────┘
```

**2. With Shop Logo**
```
┌──────────────────────────────┐
│ [LOGO]  My Artisan Shop     │
│         Seller Dashboard     │
└──────────────────────────────┘
```

**3. Without Logo (Store Icon)**
```
┌──────────────────────────────┐
│ [🏪]   My Artisan Shop       │
│        Seller Dashboard      │
└──────────────────────────────┘
```

## Responsive Features

### Text Truncation
```tsx
<span className="font-semibold truncate max-w-[140px]">
  {seller?.name || "Seller"}
</span>
```

**Long names are truncated:**
- "John Doe" → "John Doe"
- "Alexander Christopher Thompson" → "Alexander Christo..."

### Avatar Sizes
- **Footer Avatar**: 8 units (32px)
- **Header Logo**: 10 units (40px)
- **Border**: 2px on avatar with primary/20 opacity

### Collapsed Sidebar
When sidebar is collapsed (icon-only mode):
- Header text hidden
- Avatar remains visible
- Tooltip shows full name on hover
- Shop logo/icon still visible

## Error Handling

### No User Data
```tsx
{seller?.name || "Seller"}
{seller?.email || "seller@example.com"}
{seller?.shop?.name || "Artistry Cart"}
```

**Fallbacks:**
- Name: "Seller"
- Email: "seller@example.com"
- Shop: "Artistry Cart"
- Avatar: Initials "SC"

### Failed Image Load
- Avatar component handles image errors gracefully
- Falls back to AvatarFallback with initials
- No broken image icons shown

### Network Errors
- Loading skeleton shown during retry
- Fallback data displayed if fetch fails
- No app crash or blank screens

## Accessibility

✅ **Alt Text**: All images have descriptive alt text
✅ **ARIA Labels**: Proper labels on interactive elements
✅ **Keyboard Navigation**: Full keyboard support
✅ **Screen Readers**: 
- Avatar announces name
- Email is readable
- Shop info is accessible
✅ **Focus Management**: Proper focus states

## Performance Optimizations

### 1. **React Query Caching**
- User data cached for 5 minutes
- Reduces API calls
- Instant data on revisit

### 2. **Conditional Rendering**
- Only loads when needed
- Lazy evaluation of conditions
- No unnecessary re-renders

### 3. **Image Optimization**
- Browser handles image caching
- Proper image formats from backend
- Fallback prevents loading delays

### 4. **Memoization Ready**
- `getInitials` function is pure
- Can be memoized if needed
- No side effects

## Testing Scenarios

### ✅ Test Cases

1. **User with full profile**
   - Name, email, avatar, shop logo all display correctly
   
2. **User with partial profile**
   - Missing avatar → Shows initials
   - Missing shop logo → Shows Store icon
   
3. **User with no shop name**
   - Defaults to "Artistry Cart"
   
4. **Very long names/emails**
   - Text truncates with ellipsis
   - Doesn't break layout
   
5. **Loading state**
   - Skeleton shows during fetch
   - No layout shift
   
6. **Network failure**
   - Shows fallback data
   - Retry works correctly
   
7. **Collapsed sidebar**
   - Avatar visible
   - Tooltip works
   - No text overflow
   
8. **Dropdown interactions**
   - Opens on click
   - Closes on selection
   - Keyboard navigation works

## Future Enhancements

- [ ] Add online/offline status indicator
- [ ] Show last login time in dropdown
- [ ] Add quick stats (products, orders) in dropdown
- [ ] Implement profile edit inline
- [ ] Add verification badge for verified sellers
- [ ] Show account tier/plan in dropdown
- [ ] Add notification dot for pending actions
- [ ] Implement avatar upload from dropdown
- [ ] Add shop performance metrics preview
- [ ] Show pending reviews count

## Files Modified

1. `apps/seller-ui/src/shared/sidebar/app-sidebar/index.tsx`
   - Added `useSeller` hook integration
   - Implemented dynamic header with shop logo
   - Updated footer with real user data
   - Added loading states with skeletons
   - Enhanced dropdown menu with shop info

## Dependencies Used

- `@/hooks/useSeller` - Fetch seller data
- `@/components/ui/skeleton` - Loading states
- `@/components/ui/avatar` - User avatar display
- `@tanstack/react-query` - Data fetching & caching
- `lucide-react` - Icons

## Summary

The sidebar now displays **real, authenticated seller information** fetched from the backend API. It includes:
- ✅ Shop name and logo in header
- ✅ Seller name and email in footer
- ✅ User avatar with intelligent fallbacks
- ✅ Loading states for better UX
- ✅ Shop information in dropdown menu
- ✅ Graceful error handling
- ✅ Responsive and accessible design

The implementation is production-ready with proper error handling, loading states, and optimizations!
