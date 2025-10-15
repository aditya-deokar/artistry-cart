# Event Creation - Product Selection Enhancement

## Date: October 15, 2025

## Overview
Enhanced the event creation page with a proper product selection feature using a 2-column layout for better space utilization and user experience.

---

## What Was Added

### 1. Product Selection Dialog
**File**: `apps/seller-ui/src/components/events/product-selection-for-create.tsx`

A new dialog component for selecting products with:
- ✅ **Search functionality** - Find products quickly
- ✅ **Product grid display** - Visual product cards with images
- ✅ **Checkbox selection** - Multi-select products
- ✅ **Selected count** - Shows how many products are selected
- ✅ **Clear all option** - Deselect all products at once
- ✅ **Product details** - Shows price, stock, category
- ✅ **Out of stock indicator** - Visual badge for unavailable products
- ✅ **Loading states** - Skeleton loading for better UX
- ✅ **Empty state** - Helpful message when no products found

### 2. Enhanced Create Event Page
**File**: `apps/seller-ui/src/app/(routes)/dashboard/events/create/page.tsx`

Updated with:
- ✅ **2-column layout** for product section
- ✅ **Add Products card** - Left column with big button
- ✅ **Selected Products card** - Right column showing selections
- ✅ **Remove individual products** - X button on each product
- ✅ **Product thumbnails** - Visual preview of selected products
- ✅ **Product details** - Price, stock info in summary
- ✅ **Validation** - Must select at least 1 product

---

## UI Layout

### Before (Single Column)
```
┌────────────────────────────────┐
│                                │
│  Single wide placeholder card  │
│                                │
└────────────────────────────────┘
```

### After (Two Columns)
```
┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │
│  Add Products   │ │ Selected        │
│  Button         │ │ Products        │
│  (Left)         │ │ List (Right)    │
│                 │ │                 │
└─────────────────┘ └─────────────────┘
```

---

## Features Breakdown

### Add Products Card (Left Column)

**Purpose**: Primary action button to open product selection

**Visual Elements**:
- Large dashed border button (132px height)
- Plus icon (32px)
- "Add Products" text
- Counter showing selected products
- Hover effect changes border to primary color

**States**:
- Empty: "Click to select products"
- Has selections: "X products selected"
- Validation error: Red error message below

### Selected Products Card (Right Column)

**Purpose**: Shows what products are currently selected

**Empty State**:
- Package icon (light gray, 48px)
- "No products selected yet" message
- Centered content

**With Products**:
- Scrollable list (max height: 256px)
- Each product shows:
  - Thumbnail image (48x48px)
  - Product title (truncated if long)
  - Price (sale price if available)
  - Stock quantity badge
  - Remove button (X icon)
- Hover effect on items
- Gray background for each item

---

## Product Selection Dialog

### Layout

#### Header Section
- Title: "Select Products for Event"
- Description: "Choose products to include in this promotional event"

#### Search Bar
- Search icon on left
- Placeholder: "Search products..."
- Real-time filtering

#### Selection Info Bar
- Shows: "X products selected"
- "Clear All" button (appears when products selected)

#### Products Grid
- Responsive: 2 columns on mobile, 3 on desktop
- Each card shows:
  - Product image (full width, 128px height)
  - Checkbox (top right corner)
  - Out of stock badge (if applicable)
  - Product title (truncated to 1 line)
  - Category name
  - Price (with sale price highlighting)
  - Stock quantity
- Click anywhere on card to select/deselect
- Selected cards get primary ring border

#### Action Buttons
- Cancel: Discards changes
- Add X Products: Confirms selection (disabled if none selected)

---

## Product Data Structure

```typescript
interface Product {
  id: string;
  title: string;
  regular_price: number;
  sale_price?: number;
  current_price: number;
  stock_quantity: number;
  images?: Array<{ url: string }>;
  category?: { name: string };
}
```

---

## User Flow

### Adding Products

1. **Click "Add Products" button**
   - Opens product selection dialog
   - Loads products from API

2. **Search (Optional)**
   - Type in search bar
   - Results filter in real-time

3. **Select Products**
   - Click on product cards
   - Or click checkboxes
   - Selected count updates

4. **Confirm Selection**
   - Click "Add X Products"
   - Dialog closes
   - Products appear in right card

### Removing Products

**Individual Removal**:
- Click X button on any product
- Product removed immediately
- No confirmation needed

**Remove All**:
- Click "Add Products" again
- Click "Clear All" in dialog
- Or manually deselect all

---

## Validation

### Product Requirement
- **Rule**: At least 1 product must be selected
- **Validation**: On form submission
- **Error Message**: "Please select at least one product for this event"
- **Visual Feedback**: Red error text below Add Products button

### Date Validation (Existing)
- End date must be after start date
- Both dates required

---

## API Integration

### Fetch Products
```typescript
useSellerProductsForEvent({
  search: string | undefined,
  limit: 50,
});
```

**Returns**:
```typescript
{
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

### Create Event (Updated)
```typescript
POST /product/api/events
{
  title: string;
  description: string;
  event_type: string;
  starting_date: string; // ISO format
  ending_date: string; // ISO format
  product_ids: string[]; // Array of product IDs
  discount_percent?: number;
  banner_image?: string;
  is_active: boolean;
}
```

---

## Responsive Behavior

### Desktop (lg: 1024px+)
- Product section: 2 columns side-by-side
- Dialog: 3 columns in product grid
- Full width layout

### Tablet (md: 768px - 1023px)
- Product section: Stacks to 1 column
- Dialog: 3 columns in product grid
- Adjusted spacing

### Mobile (< 768px)
- Product section: Single column
- Dialog: 2 columns in product grid
- Touch-optimized buttons

---

## Visual Design

### Colors
- **Primary Action**: Blue (#3B82F6)
- **Success**: Green (for sale prices)
- **Danger**: Red (for out of stock, errors)
- **Secondary**: Gray (for badges, backgrounds)

### Typography
- **Titles**: font-medium, text-sm
- **Prices**: font-bold or font-semibold
- **Descriptions**: text-gray-500, text-xs
- **Errors**: text-red-500, text-sm

### Spacing
- **Card padding**: p-3 or p-4
- **Grid gaps**: gap-3 or gap-4
- **Section spacing**: space-y-6

### Borders & Shadows
- **Cards**: rounded-lg border
- **Selected cards**: ring-2 ring-primary
- **Hover**: shadow-md
- **Dashed button**: border-2 border-dashed

---

## Loading States

### Product Dialog
- Shows 6 skeleton cards in grid
- Skeleton includes:
  - Image placeholder (128px height)
  - Title bar placeholder
  - Price placeholder

### Page Loading
- Loading spinner in submit button
- "Creating..." text
- All buttons disabled

---

## Empty States

### No Products in System
```
┌──────────────────────────┐
│      [Package Icon]      │
│   No products found      │
│   Create products first  │
│   to add them to events  │
└──────────────────────────┘
```

### No Search Results
```
┌──────────────────────────┐
│      [Package Icon]      │
│   No products found      │
│ Try a different search   │
└──────────────────────────┘
```

### No Products Selected
```
┌──────────────────────────┐
│   [Package Icon (faded)] │
│ No products selected yet │
└──────────────────────────┘
```

---

## Error Handling

### Network Errors
- Toast notification: "Failed to load products"
- Empty state with error message

### Validation Errors
- Inline error message below button
- Red border on relevant fields
- Toast notification on submit

### Image Load Errors
- Fallback to `/placeholder-product.jpg`
- No broken image icons

---

## Accessibility

### Keyboard Navigation
- Tab through product cards
- Space/Enter to select
- Esc to close dialog

### Screen Readers
- Descriptive labels
- ARIA attributes on interactive elements
- Status announcements for selection changes

### Visual Feedback
- Focus states on all interactive elements
- Clear selected state (ring border)
- Disabled state styling

---

## Performance Optimizations

### Image Loading
- Lazy loading for product images
- Object-cover for consistent sizing
- Fallback images

### Search
- Uses existing `useSellerProductsForEvent` hook
- API-side filtering
- No client-side processing

### Dialog
- Only loads when opened
- Maintains selection state
- Efficient re-renders

---

## Testing Checklist

- ✅ **Open dialog**: Click "Add Products"
- ✅ **Search**: Type in search bar, results filter
- ✅ **Select products**: Click cards, checkboxes work
- ✅ **Selected count**: Updates correctly
- ✅ **Clear all**: Deselects all products
- ✅ **Confirm**: Products appear in right card
- ✅ **Remove product**: X button removes individual product
- ✅ **Validation**: Error if no products selected
- ✅ **Submit**: Creates event with selected products
- ✅ **Cancel**: Returns to events list
- ✅ **Responsive**: Works on mobile, tablet, desktop
- ✅ **Empty states**: Show appropriate messages
- ✅ **Loading**: Skeleton and spinner work
- ✅ **Images**: Fallback works for missing images

---

## Future Enhancements

### Potential Improvements
1. **Bulk Actions**: Select/deselect by category
2. **Product Filtering**: Filter by category, price range, stock status
3. **Sorting**: Sort by name, price, stock
4. **Pagination**: Load more products (currently limited to 50)
5. **Product Preview**: Quick view modal for product details
6. **Recently Used**: Show recently added products
7. **Recommendations**: Suggest popular products
8. **Conflict Detection**: Warn if product is in another active event

---

## Files Created/Modified

### Created
1. ✅ `apps/seller-ui/src/components/events/product-selection-for-create.tsx`
   - New product selection dialog
   - Complete with search, grid, and selection logic

### Modified
2. ✅ `apps/seller-ui/src/app/(routes)/dashboard/events/create/page.tsx`
   - Added 2-column layout for products
   - Added product state management
   - Added remove product functionality
   - Updated validation logic
   - Integrated product selection dialog

---

## Summary

### Before
- ❌ Placeholder text saying "coming soon"
- ❌ Single wide card wasting space
- ❌ No way to add products
- ❌ Placeholder product_ids in backend

### After
- ✅ Functional product selection dialog
- ✅ 2-column layout using space efficiently
- ✅ Visual product cards with images
- ✅ Real product data sent to backend
- ✅ Remove individual products
- ✅ Proper validation
- ✅ Great user experience

### Result
🎉 **FULLY FUNCTIONAL** - Users can now properly select and manage products when creating events!
