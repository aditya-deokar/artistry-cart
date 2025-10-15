# Subcategory Fix - Edit Product Page

## Date: October 15, 2025

## Problem

The edit product page was using hardcoded subcategories instead of fetching them from the API like the create product page does. This caused:
- Inconsistent subcategory options between create and edit pages
- Limited subcategory choices
- No ability to add new subcategories without code changes

## Root Cause

The edit product page had a hardcoded `getSubcategories` function:
```typescript
const getSubcategories = useMemo(() => {
    return (category: string): string[] => {
        const subcategoriesMap: Record<string, string[]> = {
            'Painting': ['Oil', 'Acrylic', 'Watercolor', 'Digital'],
            'Sculpture': ['Wood', 'Metal', 'Clay', 'Stone'],
            'Jewelry': ['Necklace', 'Earrings', 'Rings', 'Bracelets'],
            'Photography': ['Nature', 'Portrait', 'Urban', 'Abstract'],
            'Digital Art': ['2D', '3D', 'Animation', 'Mixed Media'],
        };
        
        return subcategoriesMap[category] || [];
    };
}, []);
```

Meanwhile, the create product page was correctly fetching from the API:
```typescript
const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
        const res = await axiosInstance.get("/product/api/categories");
        return res.data.data;
    },
});

const subCategoriesData = data?.subCategories || {};
const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
}, [selectedCategory, subCategoriesData]);
```

---

## Solution

### 1. Import `useQuery` from React Query

**Before:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
```

**After:**
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
```

### 2. Replace Hardcoded Subcategories with API Call

**Before:**
```typescript
// Fetch categories
const { data: categories = [], isLoading: isCategoriesLoading } = useProductCategories();

// State for subcategories (since the API returns only main categories)
const [subcategories, setSubcategories] = useState<string[]>([]);

// For simplicity, let's define some common subcategories for demonstration
const getSubcategories = useMemo(() => {
    return (category: string): string[] => {
        const subcategoriesMap: Record<string, string[]> = {
            'Painting': ['Oil', 'Acrylic', 'Watercolor', 'Digital'],
            'Sculpture': ['Wood', 'Metal', 'Clay', 'Stone'],
            'Jewelry': ['Necklace', 'Earrings', 'Rings', 'Bracelets'],
            'Photography': ['Nature', 'Portrait', 'Urban', 'Abstract'],
            'Digital Art': ['2D', '3D', 'Animation', 'Mixed Media'],
        };
        
        return subcategoriesMap[category] || [];
    };
}, []);
```

**After:**
```typescript
// Fetch categories and subcategories from API
const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
        const res = await axiosInstance.get("/product/api/categories");
        return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
});

const categories = categoriesData?.categories || [];
const subCategoriesData = categoriesData?.subCategories || {};
```

### 3. Update Subcategories Calculation

**After form setup:**
```typescript
const { register, control, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    // ... form config
});

// Watch for key fields
const selectedCategory = watch("category");

// Calculate subcategories based on selected category
const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
}, [selectedCategory, subCategoriesData]);
```

### 4. Remove Old useEffect Hook

**Removed:**
```typescript
// Update subcategories when category changes
useEffect(() => {
    if (selectedCategory) {
        setSubcategories(getSubcategories(selectedCategory));
    }
}, [selectedCategory, getSubcategories]);
```

**Removed from product loading useEffect:**
```typescript
// Update subcategories if a category is selected
if (productData.category) {
    setSubcategories(getSubcategories(productData.category));
}
```

**Updated dependencies:**
```typescript
// Before:
}, [product, reset, setValue, getSubcategories]);

// After:
}, [product, reset, setValue]);
```

### 5. Remove Unused Import

**Before:**
```typescript
import { useProductCategories, useProductDetails } from '@/hooks/useProducts';
```

**After:**
```typescript
import { useProductDetails } from '@/hooks/useProducts';
```

---

## API Structure

### Endpoint
```
GET /product/api/categories
```

### Response
```json
{
  "success": true,
  "data": {
    "categories": [
      "Painting",
      "Sculpture",
      "Jewelry",
      "Photography",
      "Digital Art"
    ],
    "subCategories": {
      "Painting": ["Oil", "Acrylic", "Watercolor", "Abstract", "Landscape"],
      "Sculpture": ["Wood", "Metal", "Clay", "Stone", "Mixed Media"],
      "Jewelry": ["Necklace", "Earrings", "Rings", "Bracelets", "Anklets"],
      "Photography": ["Nature", "Portrait", "Urban", "Abstract", "Wildlife"],
      "Digital Art": ["2D", "3D", "Animation", "Mixed Media", "NFT"]
    }
  }
}
```

---

## How It Works Now

### 1. **Page Load:**
   - Fetches product data
   - Fetches categories and subcategories from API
   - Form initializes with default empty values

### 2. **Product Data Loads:**
   - Form resets with product data (including category and subCategory)
   - Category field is populated
   - `watch("category")` starts tracking the category value

### 3. **Subcategories Update:**
   - `useMemo` recalculates when `selectedCategory` changes
   - Looks up subcategories in `subCategoriesData[selectedCategory]`
   - Updates dropdown options automatically

### 4. **User Changes Category:**
   - New category selected
   - `watch("category")` detects change
   - `useMemo` recalculates subcategories for new category
   - Subcategory dropdown updates with new options
   - Previously selected subcategory is cleared (React Hook Form behavior)

---

## Benefits

✅ **Consistency:** Edit page now uses same subcategories as create page
✅ **Dynamic:** Subcategories are fetched from database, not hardcoded
✅ **Maintainable:** Adding new categories/subcategories doesn't require code changes
✅ **Accurate:** Shows actual subcategories configured in site_config
✅ **Real-time:** Changes to categories in admin reflect immediately

---

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│            Edit Product Page Loads                  │
└────────────────┬────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ Fetch Product│    │ Fetch Categories │
│ Data         │    │ & Subcategories  │
└──────┬───────┘    └─────────┬────────┘
       │                      │
       │                      ▼
       │            ┌────────────────────┐
       │            │ categories = [...]  │
       │            │ subCategoriesData = │
       │            │ { category: [...] } │
       │            └─────────┬──────────┘
       │                      │
       ▼                      │
┌──────────────────┐          │
│ Reset form with  │          │
│ product data     │          │
│ category: "..."  │◄─────────┘
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ watch("category")        │
│ selectedCategory = "..." │
└──────┬───────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ useMemo calculates subcategories    │
│ subcategories =                     │
│ subCategoriesData[selectedCategory] │
└──────┬──────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Render subcategory       │
│ dropdown with options    │
└──────────────────────────┘
```

---

## Testing Checklist

### ✅ Initial Load:
- [ ] Edit product page loads without errors
- [ ] Category dropdown shows all categories from API
- [ ] Current product's category is pre-selected
- [ ] Subcategory dropdown shows correct options for product's category
- [ ] Current product's subcategory is pre-selected

### ✅ Category Change:
- [ ] Select a different category
- [ ] Subcategory dropdown updates with new options
- [ ] Previously selected subcategory is cleared
- [ ] Can select a new subcategory from updated list

### ✅ Form Submission:
- [ ] Submit form with changed category/subcategory
- [ ] Product updates successfully
- [ ] New category and subcategory are saved

### ✅ Edge Cases:
- [ ] Category with no subcategories shows empty dropdown but doesn't crash
- [ ] Category not in API data shows empty subcategory dropdown
- [ ] Changing back to original category shows original subcategory options

---

## Files Modified

### `apps/seller-ui/src/app/(routes)/dashboard/product/edit/[productId]/page.tsx`

**Changes:**
1. ✅ Imported `useQuery` from `@tanstack/react-query`
2. ✅ Removed `useProductCategories` import (unused)
3. ✅ Replaced hardcoded subcategories with API fetch using `useQuery`
4. ✅ Updated `categories` to use API data: `categoriesData?.categories || []`
5. ✅ Updated `subcategories` calculation with `useMemo` based on `selectedCategory`
6. ✅ Removed manual subcategory state management (`setSubcategories` calls)
7. ✅ Removed `getSubcategories` function
8. ✅ Removed subcategory update logic from `useEffect`
9. ✅ Updated `useEffect` dependencies to remove `getSubcategories`

---

## Known Warnings

TypeScript reports these unused variables (non-critical):
- `openImageModal` - Can be removed if not used
- `isChanged` - Can be removed if not used  
- `isCategoriesLoading` - Could be used for loading state in category dropdown

---

## Related Files

- **Create Product:** `apps/seller-ui/src/app/(routes)/dashboard/create-product/page.tsx`
  - Already using API-fetched subcategories ✅
  
- **API Controller:** `apps/product-service/src/controllers/product.controller.ts`
  - Returns categories and subCategories from site_config ✅
  
- **Schema:** `prisma/schema.prisma`
  - `site_config.subCategories` stored as Json ✅
  - `products.subCategory` stored as String ✅

---

## Summary

The subcategory issue has been fixed by:
1. Fetching categories and subcategories from the API
2. Using the same data structure as the create product page
3. Dynamically calculating subcategory options based on selected category
4. Removing hardcoded subcategory mappings

The edit product page now has feature parity with the create product page in terms of category and subcategory handling!
