# Image Display Debug Guide

## Date: October 15, 2025

## Current Setup

The edit product page is now loading images from the product data. Here's what was added:

### Enhanced Image Loading Code

```typescript
// Set images
console.log('Product images:', productData.images);
if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
    const productImages = productData.images.map((img: any) => ({
        file_id: img.file_id,
        url: img.url
    }));
    
    console.log('Mapped product images:', productImages);
    
    if (productImages.length < 8) {
        productImages.push(null); // Add an empty placeholder if less than 8 images
    }
    
    setImage(productImages);
    // Set images without nulls for the form data
    const validImages = productImages.filter((img: UploadedImages | null) => img !== null) as UploadedImages[];
    setValue('images', validImages);
    
    console.log('Images set successfully. Total images:', productImages.length - 1);
} else {
    console.log('No images found or images array is empty');
    // Still set an empty placeholder
    setImage([null]);
}
```

---

## Expected Console Output

When the page loads, you should see:

```javascript
Product data loaded: {product: {…}}
Actual product data: {id: "...", title: "...", images: Array(2), ...}
Product images: [
  {file_id: "68971e065c7cd75eb8cd37e8", url: "https://ik.imagekit.io/..."},
  {file_id: "68971e0f5c7cd75eb8cd8ad1", url: "https://ik.imagekit.io/..."}
]
Mapped product images: [
  {file_id: "68971e065c7cd75eb8cd37e8", url: "https://ik.imagekit.io/..."},
  {file_id: "68971e0f5c7cd75eb8cd8ad1", url: "https://ik.imagekit.io/..."},
  null  // Empty placeholder
]
Images set successfully. Total images: 2
Form data prepared: {...}
Form values set successfully
```

---

## Product Image Data Structure

From your API response, the images are:

```json
"images": [
  {
    "file_id": "68971e065c7cd75eb8cd37e8",
    "url": "https://ik.imagekit.io/adityadeokar/products/product-1754734084736_V37H8H7E6.jpg"
  },
  {
    "file_id": "68971e0f5c7cd75eb8cd8ad1",
    "url": "https://ik.imagekit.io/adityadeokar/products/product-1754734093736_qlZ2Y-zbB.jpg"
  }
]
```

---

## How Images Should Display

### Layout:
```
┌─────────────────────────┐
│   Main Image (large)    │  ← First image (index 0) - col-span-2
│   765 x 850             │
└─────────────────────────┘

┌───────────┐ ┌───────────┐
│ Thumbnail │ │ Thumbnail │  ← Second image (index 1) and empty slot
│  (small)  │ │  (small)  │
└───────────┘ └───────────┘
```

### Grid Structure:
- **First image (index 0):** Full width, larger size, takes up 2 columns
- **Other images (index 1+):** Smaller thumbnails in 2-column grid
- **Maximum:** 8 image slots (1 main + 7 thumbnails, but currently shows 2 images + 1 empty)

---

## ImagePlaceholder Component

The `ImagePlaceholder` component should:
1. Receive the `image` array via props
2. Access the specific image at the given `index`
3. Display the image if it exists at `image[index]`
4. Show an upload placeholder if `image[index]` is null

### Component Props:
```typescript
<ImagePlaceholder
  setOpenImageModal={setOpenImageModal}
  size='765 x 850'
  small={index !== 0}           // First image is large, others are small
  index={index}                 // Current position in array
  onImageChange={handleImageChange}
  onRemove={handleRemoveImage}
  setSelectedImage={setSelectedImage}
  selectedImage={selectedImage}
  image={image}                 // Full array of images
/>
```

---

## Debugging Steps

### Step 1: Check Console Logs
After refreshing the edit page, check the console for:

```javascript
✅ Product images: Array(2) [{...}, {...}]
✅ Mapped product images: Array(3) [{...}, {...}, null]
✅ Images set successfully. Total images: 2
```

### Step 2: Check Image State
Add this temporary log to see if state is updated:

```typescript
// After the useEffect
console.log('Current image state:', image);
```

Should show:
```javascript
[
  {file_id: "...", url: "https://..."},
  {file_id: "...", url: "https://..."},
  null
]
```

### Step 3: Check ImagePlaceholder Rendering
The component should render 3 times (2 images + 1 empty slot).

### Step 4: Verify Image URLs
Check if the ImageKit URLs are accessible:
- Open: `https://ik.imagekit.io/adityadeokar/products/product-1754734084736_V37H8H7E6.jpg`
- Should display the image

---

## Common Issues & Solutions

### Issue 1: Images Not Displaying

**Possible Causes:**
1. ImagePlaceholder component not handling image prop correctly
2. URLs are broken or have CORS issues
3. Image state not updating

**Debug:**
```typescript
console.log('Rendering ImagePlaceholder at index:', index);
console.log('Image at this index:', image[index]);
```

### Issue 2: Only Placeholders Showing

**Possible Causes:**
1. `image[index]` is null even though images are loaded
2. ImagePlaceholder checking wrong condition

**Solution:**
Check ImagePlaceholder component logic:
```typescript
// Should be something like:
const currentImage = image[index];
if (currentImage && currentImage.url) {
  return <img src={currentImage.url} alt="Product" />;
} else {
  return <UploadPlaceholder />;
}
```

### Issue 3: Images Disappear After Edit

**Possible Causes:**
1. Form submission not including images
2. Images getting reset on form update

**Solution:**
Already handled in onSubmit:
```typescript
images: image.filter((img): img is UploadedImages => img !== null)
```

---

## Expected Visual Result

### Main Image (Index 0):
- ✅ Large display area (full width)
- ✅ Shows: `product-1754734084736_V37H8H7E6.jpg`
- ✅ Remove button in corner
- ✅ Size label: "765 x 850"

### Thumbnail (Index 1):
- ✅ Smaller display area (half width)
- ✅ Shows: `product-1754734093736_qlZ2Y-zbB.jpg`
- ✅ Remove button in corner

### Empty Slot (Index 2):
- ✅ Upload placeholder
- ✅ Dashed border
- ✅ Click to upload new image

---

## Image Upload/Delete Flow

### Upload New Image:
```
User clicks empty slot
→ File picker opens
→ User selects image file
→ convertFileBase64(file)
→ POST /product/api/images/upload
→ Response: {file_id, url}
→ Update image array at index
→ Image displays immediately
```

### Delete Image:
```
User clicks remove button
→ handleRemoveImage(index)
→ DELETE /product/api/images/delete {fileId}
→ Remove from image array
→ Slot becomes empty placeholder
```

---

## Image Array State Management

```typescript
// Initial state (no product loaded)
image = [null]

// After loading product with 2 images
image = [
  {file_id: "68971e065c7cd75eb8cd37e8", url: "https://..."},
  {file_id: "68971e0f5c7cd75eb8cd8ad1", url: "https://..."},
  null  // Empty slot for adding more
]

// After uploading to empty slot
image = [
  {file_id: "68971e065c7cd75eb8cd37e8", url: "https://..."},
  {file_id: "68971e0f5c7cd75eb8cd8ad1", url: "https://..."},
  {file_id: "new_image_id", url: "https://...new_image"},
  null  // New empty slot
]

// Maximum: 8 images total (7 images + 1 null)
```

---

## Testing Checklist

### Image Loading:
- [ ] Check console shows "Product images: Array(2)"
- [ ] Check console shows "Mapped product images: Array(3)"
- [ ] Check console shows "Images set successfully. Total images: 2"
- [ ] Verify image state contains 2 image objects + 1 null

### Image Display:
- [ ] Main image (first) displays at full width
- [ ] Thumbnail image (second) displays at half width
- [ ] Empty slot shows upload placeholder
- [ ] Both images load from ImageKit URLs
- [ ] Remove buttons appear on existing images

### Image Operations:
- [ ] Can upload new image to empty slot
- [ ] Can delete existing image
- [ ] Deleted slot becomes empty placeholder
- [ ] Can re-upload to deleted slot
- [ ] Form saves with correct images on submit

---

## Next Steps

1. **Refresh the edit product page**
2. **Check browser console** for the image-related logs
3. **Check if images are visible** in the image grid
4. **If images not showing:**
   - Share the console output
   - Check Network tab for image requests
   - Verify ImagePlaceholder component is rendering correctly

The enhanced logging will help us identify exactly where the issue is if images still don't display!
