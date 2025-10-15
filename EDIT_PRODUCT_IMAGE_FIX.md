# Edit Product Page Analysis & Issues

## Date: October 15, 2025

## Issues Identified

### 1. **Wrong Image Upload Endpoint** ❌
**Current:**
```typescript
const response = await axiosInstance.post("/product/api/upload-product-image", { fileName });
```

**Problem:** Endpoint doesn't exist. Should be `/product/api/images/upload`

**Correct:**
```typescript
const response = await axiosInstance.post("/product/api/images/upload", { fileName });
```

---

### 2. **Wrong Response Data Structure** ❌
**Current:**
```typescript
const uploadedImage: UploadedImages = {
  file_id: response.data.file_id,
  url: response.data.file_url,
};
```

**Problem:** Response has nested `data` object

**Correct:**
```typescript
const uploadedImage: UploadedImages = {
  file_id: response.data.data.file_id,
  url: response.data.data.file_url,
};
```

---

### 3. **Wrong Image Delete Endpoint** ❌
**Current:**
```typescript
await axiosInstance.delete("/product/api/delete-product-image", {
  data: { fileId: imageToDelete.file_id },
});
```

**Problem:** Endpoint doesn't exist. Should be `/product/api/images/delete`

**Correct:**
```typescript
await axiosInstance.delete("/product/api/images/delete", {
  data: { fileId: imageToDelete.file_id },
});
```

---

### 4. **Parameter Name Inconsistency** ⚠️
The image upload should use `fileName` (not `image`) based on the working implementation in `products.ts`.

---

## Fixes Required

### Fix 1: Update Image Upload Function
```typescript
const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    try {
        const fileName = await convertFileBase64(file);
        const response = await axiosInstance.post("/product/api/images/upload", { fileName });

        const uploadedImage: UploadedImages = {
            file_id: response.data.data.file_id,
            url: response.data.data.file_url,
        };

        const updatedImages = [...image];
        updatedImages[index] = uploadedImage;

        if (index === image.length - 1 && updatedImages.length < 8) {
            updatedImages.push(null);
        }

        setImage(updatedImages);
        setValue("images", updatedImages.filter(img => img !== null) as UploadedImages[]);
        setIsChanged(true);
        toast.success("Image uploaded successfully");
    } catch (error) {
        console.log(error);
        toast.error("Failed to upload image");
    }
};
```

### Fix 2: Update Image Delete Function
```typescript
const handleRemoveImage = async (index: number) => {
    const updatedImages = [...image];
    const imageToDelete = updatedImages[index];

    if (!imageToDelete || typeof imageToDelete !== "object") return;

    try {
        await axiosInstance.delete("/product/api/images/delete", {
            data: { fileId: imageToDelete.file_id },
        });

        updatedImages.splice(index, 1);

        if (!updatedImages.includes(null) && updatedImages.length < 8) {
            updatedImages.push(null);
        }

        setImage(updatedImages);
        setValue("images", updatedImages.filter(img => img !== null) as UploadedImages[]);
        setIsChanged(true);
        toast.success("Image deleted successfully");
    } catch (error) {
        toast.error("Failed to delete image. Please try again.");
    }
};
```

---

## Additional Improvements

### 1. Error Handling Enhancement
Add detailed error logging:
```typescript
} catch (error: any) {
    console.error('Image upload error:', error);
    console.error('Error response:', error.response?.data);
    toast.error(error.response?.data?.message || "Failed to upload image");
}
```

### 2. Loading States
Add loading state for image operations:
```typescript
const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

// In handleImageChange:
setUploadingImageIndex(index);
try {
    // ... upload logic
} finally {
    setUploadingImageIndex(null);
}
```

### 3. Success Messages
Add success toasts for better UX (already included in fixes above).

---

## API Endpoints Summary

### Correct Endpoints
| Operation | Endpoint | Method | Payload |
|-----------|----------|--------|---------|
| Upload Image | `/product/api/images/upload` | POST | `{ fileName: string }` |
| Delete Image | `/product/api/images/delete` | DELETE | `{ fileId: string }` |
| Update Product | `/product/api/products/:id` | PUT | Product data |

### Response Structure
```typescript
// Upload Response
{
  success: true,
  message: "Image uploaded successfully",
  data: {
    file_id: string,
    file_url: string
  }
}
```

---

## Testing Checklist

After fixes:
- [ ] Upload new product image
- [ ] Delete product image
- [ ] Update product with new images
- [ ] Update product without changing images
- [ ] Verify images persist after update
- [ ] Check error messages display correctly

---

## Summary

### Issues Found: 3 Critical
1. ❌ Wrong upload endpoint
2. ❌ Wrong response data access
3. ❌ Wrong delete endpoint

### Impact
- **Before Fix:** Image upload/delete would fail with 404 errors
- **After Fix:** Image operations work correctly

### Files to Update
- `apps/seller-ui/src/app/(routes)/dashboard/product/edit/[productId]/page.tsx`

### Lines to Change
- Line ~243: Upload endpoint
- Line ~246-247: Response data access
- Line ~267: Delete endpoint
