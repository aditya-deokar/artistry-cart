# Seller Products API Documentation

## 📋 Overview

This document describes the enhanced seller products API endpoints with improved filtering, sorting, and statistics capabilities.

---

## 🔑 Authentication

All seller endpoints require authentication:
- Header: `Authorization: Bearer <token>`
- User must have a valid shop associated with their account

---

## 📊 GET /api/seller/products/summary

Retrieve aggregate statistics for all products in the seller's shop.

### Request

```http
GET /api/seller/products/summary
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "totalProducts": 156,
    "activeProducts": 142,
    "draftProducts": 8,
    "outOfStockProducts": 23,
    "deletedProducts": 6
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalProducts` | number | Total non-deleted products |
| `activeProducts` | number | Products with "Active" status |
| `draftProducts` | number | Products with "Draft" status |
| `outOfStockProducts` | number | Products with stock = 0 |
| `deletedProducts` | number | Soft-deleted products |

---

## 🔍 GET /api/seller/products

Retrieve seller's products with advanced filtering, sorting, and pagination.

### Request

```http
GET /api/seller/products?page=1&limit=10&status=active&search=art&category=paintings&sortBy=newest
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max 100) |
| `status` | string | No | `all` | Filter by status |
| `search` | string | No | - | Search in title/description |
| `category` | string | No | - | Filter by category |
| `sortBy` | string | No | `newest` | Sort order |

#### Status Values

| Value | Description |
|-------|-------------|
| `all` | All non-deleted products (default) |
| `active` | Only active products |
| `draft` | Only draft products |
| `out_of_stock` | Products with stock = 0 |
| `deleted` | Soft-deleted products |

#### SortBy Values

| Value | Description |
|-------|-------------|
| `newest` | Newest first (default) |
| `price_asc` | Price: Low to High |
| `price_desc` | Price: High to Low |
| `popularity` | Most sales first |
| `rating` | Highest rated first |

### Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "cm2x...",
        "title": "Abstract Art Painting",
        "slug": "abstract-art-painting",
        "description": "Beautiful abstract artwork",
        "regular_price": 299.99,
        "sale_price": 249.99,
        "current_price": 249.99,
        "stock": 15,
        "category": "Art",
        "status": "Active",
        "isDeleted": false,
        "ratings": 4.5,
        "totalSales": 42,
        "images": [...],
        "event": {
          "id": "evt_...",
          "title": "Summer Sale",
          "event_type": "SEASONAL",
          "discount_percent": 20,
          "starting_date": "2025-06-01T00:00:00Z",
          "ending_date": "2025-08-31T23:59:59Z",
          "is_active": true
        },
        "priceHistory": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 16,
      "totalCount": 156,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🎯 Example Use Cases

### 1. Get Dashboard Statistics

```javascript
const response = await fetch('/api/seller/products/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
console.log(`Total: ${data.totalProducts}, Out of Stock: ${data.outOfStockProducts}`);
```

### 2. List Active Products

```javascript
const response = await fetch('/api/seller/products?status=active&page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. Search Products

```javascript
const response = await fetch('/api/seller/products?search=canvas&category=art', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 4. View Deleted Products

```javascript
const response = await fetch('/api/seller/products?status=deleted', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 5. Sort by Price

```javascript
const response = await fetch('/api/seller/products?sortBy=price_desc&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## ⚡ Performance Optimization

1. **Parallel Queries**: Summary statistics are fetched in parallel using `Promise.all()`
2. **Pagination**: Default limit of 20, configurable up to 100 items
3. **Caching**: Frontend can cache summary data for 2 minutes (stale time)
4. **Selective Includes**: Only necessary relations are included

---

## 🐛 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid parameters",
  "errors": {...}
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Frontend Integration

### React Hook Example

```typescript
// useSellerProductsSummary.ts
export const useSellerProductsSummary = () => {
  return useQuery<{
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    deletedProducts: number;
  }, Error>({
    queryKey: ['seller-products-summary'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/product/api/seller/products/summary');
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

---

## 🔄 Migration Notes

### Breaking Changes
- None - all changes are backward compatible

### New Features
- ✅ Summary statistics endpoint
- ✅ Enhanced status filtering (including `deleted` and `out_of_stock`)
- ✅ Improved sorting options
- ✅ Consistent pagination response format

### Deprecated
- None

---

## 📌 Notes

1. **Soft Delete**: Products are never permanently deleted, only marked with `isDeleted: true`
2. **Stock Management**: Products with `stock: 0` are considered "Out of Stock"
3. **Event Integration**: Products automatically show their associated event data
4. **Price History**: Recent price changes are included in the response

---

## 🧪 Testing

### Test Summary Endpoint
```bash
curl -X GET http://localhost:3000/api/seller/products/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Products Listing
```bash
curl -X GET "http://localhost:3000/api/seller/products?status=active&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 Support

For issues or questions, contact the backend team or create an issue in the repository.

**Last Updated**: October 15, 2025
**Version**: 1.0.0
