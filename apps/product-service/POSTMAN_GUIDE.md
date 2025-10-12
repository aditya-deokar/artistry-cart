# Artistry Cart - Product Service API Documentation

This guide provides comprehensive documentation for testing the Product Service API endpoints using Postman.

## Table of Contents

- [Setting Up Postman](#setting-up-postman)
- [Authentication](#authentication)
- [Product Routes](#product-routes)
- [Shop Routes](#shop-routes)
- [Event Routes](#event-routes)
- [Discount Routes](#discount-routes)
- [Search Routes](#search-routes)
- [Pricing Routes](#pricing-routes)
- [Offers Routes](#offers-routes)

## Setting Up Postman

1. Create a new Postman collection named "Artistry Cart API"
2. Create environment variables:
   - `base_url`: `http://localhost:3001` (or your API URL)
   - `user_token`: Your user authentication token
   - `seller_token`: Your seller authentication token 
   - `admin_token`: Your admin authentication token

## Authentication

For authenticated endpoints, add the following header:

```
Authorization: Bearer {{token}}
```

Where `token` is either `{{user_token}}`, `{{seller_token}}`, or `{{admin_token}}` depending on the required permissions.

## Product Routes

### Get All Products

Retrieve a list of products with pagination and filtering options.

- **URL**: `{{base_url}}/api/products`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
  - `sortBy`: Sort option (`newest`, `price-asc`, `price-desc`, `popularity`, `rating`, `discount`)
  - `category`: Filter by category
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `search`: Search term
  - `eventOnly`: Set to 'true' to show only event products

**Example Request:**
```
GET {{base_url}}/api/products?page=1&limit=10&sortBy=newest&category=art&minPrice=50&maxPrice=500
```

### Get Product by Slug

Get details of a specific product by its slug.

- **URL**: `{{base_url}}/api/products/:slug`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `slug`: Product slug

**Example Request:**
```
GET {{base_url}}/api/products/my-awesome-artwork
```

### Get Products by IDs

Get multiple products by their IDs.

- **URL**: `{{base_url}}/api/products/bulk`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `ids`: Comma-separated list of product IDs

**Example Request:**
```
GET {{base_url}}/api/products/bulk?ids=6514598eef8b32a4586fa723,6514598eef8b32a4586fa724
```

### Create Product

Create a new product (seller only).

- **URL**: `{{base_url}}/api/products`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "title": "Beautiful Abstract Painting",
  "description": "A stunning abstract art piece perfect for modern homes",
  "detailed_description": "This handcrafted artwork features vibrant colors and unique textures that catch the eye and add character to any space. Created using premium acrylic paints on canvas.",
  "warranty": "1 year warranty against fading",
  "custom_specifications": {
    "material": "Acrylic on canvas",
    "frameType": "Wooden frame"
  },
  "slug": "beautiful-abstract-painting-001",
  "tags": ["abstract", "modern", "painting", "colorful"],
  "cash_on_delivery": true,
  "brand": "ArtistryStudio",
  "video_url": "https://example.com/video-preview.mp4",
  "category": "Paintings",
  "subCategory": "Abstract",
  "colors": ["blue", "red", "yellow"],
  "sizes": ["small", "medium", "large"],
  "stock": 5,
  "regular_price": 299.99,
  "sale_price": 249.99,
  "customProperties": {
    "artist": "Jane Doe",
    "yearCreated": 2025
  },
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "file_id": "img123"
    },
    {
      "url": "https://example.com/image2.jpg",
      "file_id": "img124"
    }
  ],
  "status": "Active"
}
```

### Update Product

Update an existing product (seller only).

- **URL**: `{{base_url}}/api/products/:productId`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `productId`: Product ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request:**
```
PUT {{base_url}}/api/products/6514598eef8b32a4586fa723
```

**Example Request Body (Partial Update):**
```json
{
  "stock": 10,
  "sale_price": 229.99,
  "status": "Active"
}
```

### Delete Product

Soft delete a product (scheduled for deletion after 24 hours).

- **URL**: `{{base_url}}/api/products/:productId`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `productId`: Product ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`

**Example Request:**
```
DELETE {{base_url}}/api/products/6514598eef8b32a4586fa723
```

### Restore Product

Restore a soft-deleted product (within grace period).

- **URL**: `{{base_url}}/api/products/:productId/restore`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `productId`: Product ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`

**Example Request:**
```
POST {{base_url}}/api/products/6514598eef8b32a4586fa723/restore
```

### Upload Product Image

Upload an image for a product.

- **URL**: `{{base_url}}/api/products/upload-image`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "fileName": "base64_encoded_image_data_or_file_url"
}
```

### Delete Product Image

Delete a product image.

- **URL**: `{{base_url}}/api/products/delete-image`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "fileId": "img123"
}
```

### Get Categories

Get all product categories and subcategories.

- **URL**: `{{base_url}}/api/products/categories`
- **Method**: `GET`
- **Auth Required**: No

**Example Request:**
```
GET {{base_url}}/api/products/categories
```

### Admin: Get All Products

Get all products (admin only).

- **URL**: `{{base_url}}/api/products/admin`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Headers**:
  - `Authorization`: `Bearer {{admin_token}}`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status
  - `shopId`: Filter by shop ID

**Example Request:**
```
GET {{base_url}}/api/products/admin?page=1&limit=20&status=Active
```

### Admin: Update Product Status

Update a product's status (admin only).

- **URL**: `{{base_url}}/api/products/admin/:productId/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `productId`: Product ID
- **Headers**:
  - `Authorization`: `Bearer {{admin_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "status": "Active",
  "reason": "Product meets all requirements"
}
```

## Shop Routes

### Get All Shop Products

Get all products from the logged-in seller's shop.

- **URL**: `{{base_url}}/api/shops/products`
- **Method**: `GET`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status
  - `search`: Search term
  - `category`: Filter by category

**Example Request:**
```
GET {{base_url}}/api/shops/products?page=1&limit=20&status=Active
```

### Get Shop Products by Slug

Get all products from a specific shop by slug.

- **URL**: `{{base_url}}/api/shops/:shopSlug/products`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `shopSlug`: Shop slug

**Example Request:**
```
GET {{base_url}}/api/shops/my-awesome-shop/products
```

## Event Routes

### Get All Events

Get all active promotional events.

- **URL**: `{{base_url}}/api/events`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

**Example Request:**
```
GET {{base_url}}/api/events?page=1&limit=10
```

### Get Event by ID

Get a specific event by ID.

- **URL**: `{{base_url}}/api/events/:eventId`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `eventId`: Event ID

**Example Request:**
```
GET {{base_url}}/api/events/651459c7ef8b32a4586fa728
```

### Create Event

Create a new promotional event.

- **URL**: `{{base_url}}/api/events`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "title": "Summer Art Sale",
  "description": "Enjoy amazing discounts on all artwork this summer!",
  "banner_image": {
    "url": "https://example.com/banner.jpg",
    "file_id": "banner123"
  },
  "event_type": "SEASONAL",
  "discount_percent": 20,
  "discount_type": "PERCENTAGE",
  "max_discount": 100,
  "min_order_value": 200,
  "starting_date": "2025-11-01T00:00:00Z",
  "ending_date": "2025-11-30T23:59:59Z",
  "is_active": true
}
```

### Update Event

Update an existing event.

- **URL**: `{{base_url}}/api/events/:eventId`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `eventId`: Event ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "discount_percent": 25,
  "ending_date": "2025-12-05T23:59:59Z"
}
```

### Add Product to Event

Add a product to an event.

- **URL**: `{{base_url}}/api/events/:eventId/products`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `eventId`: Event ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "productIds": ["6514598eef8b32a4586fa723", "6514598eef8b32a4586fa724"]
}
```

### Remove Product from Event

Remove a product from an event.

- **URL**: `{{base_url}}/api/events/:eventId/products/:productId`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `eventId`: Event ID
  - `productId`: Product ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`

**Example Request:**
```
DELETE {{base_url}}/api/events/651459c7ef8b32a4586fa728/products/6514598eef8b32a4586fa723
```

## Discount Routes

### Create Discount Code

Create a new discount code.

- **URL**: `{{base_url}}/api/discounts`
- **Method**: `POST`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "publicName": "10% Off First Purchase",
  "description": "Get 10% off on your first purchase",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "discountCode": "WELCOME10",
  "minimumOrderAmount": 50,
  "maximumDiscountAmount": 100,
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "validFrom": "2025-10-12T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "applicableToAll": true
}
```

### Get Seller Discount Codes

Get all discount codes for the logged-in seller.

- **URL**: `{{base_url}}/api/discounts/seller`
- **Method**: `GET`
- **Auth Required**: Yes (Seller)
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `active`: Filter by active status

**Example Request:**
```
GET {{base_url}}/api/discounts/seller?page=1&limit=20&active=true
```

### Update Discount Code

Update an existing discount code.

- **URL**: `{{base_url}}/api/discounts/:discountId`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller)
- **URL Parameters**:
  - `discountId`: Discount ID
- **Headers**:
  - `Authorization`: `Bearer {{seller_token}}`
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "discountValue": 15,
  "validUntil": "2026-01-31T23:59:59Z",
  "isActive": true
}
```

### Validate Coupon

Validate a discount code.

- **URL**: `{{base_url}}/api/discounts/validate`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**:
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "couponCode": "WELCOME10"
}
```

## Search Routes

### Search Products

Search for products based on a query.

- **URL**: `{{base_url}}/api/search`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `q`: Search query
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
  - `category`: Filter by category
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter

**Example Request:**
```
GET {{base_url}}/api/search?q=abstract%20art&page=1&limit=12&category=Paintings
```

### Search Suggestions

Get search suggestions based on a partial query.

- **URL**: `{{base_url}}/api/search/suggestions`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `q`: Partial search query
  - `limit`: Maximum number of suggestions (default: 10)

**Example Request:**
```
GET {{base_url}}/api/search/suggestions?q=abst&limit=5
```

## Pricing Routes

### Get Product Price

Get calculated price for a product considering discounts and events.

- **URL**: `{{base_url}}/api/pricing/:productId`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**:
  - `productId`: Product ID
- **Query Parameters**:
  - `eventId`: Optional event ID for event-specific pricing

**Example Request:**
```
GET {{base_url}}/api/pricing/6514598eef8b32a4586fa723
```

### Calculate Cart Pricing

Calculate pricing for multiple products in a cart.

- **URL**: `{{base_url}}/api/pricing/cart`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**:
  - `Content-Type`: `application/json`

**Example Request Body:**
```json
{
  "items": [
    {
      "productId": "6514598eef8b32a4586fa723",
      "quantity": 2
    },
    {
      "productId": "6514598eef8b32a4586fa724",
      "quantity": 1
    }
  ],
  "couponCode": "WELCOME10"
}
```

## Offers Routes

### Get Active Offers

Get all active offers and promotions.

- **URL**: `{{base_url}}/api/offers`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `category`: Filter by category

**Example Request:**
```
GET {{base_url}}/api/offers?category=Paintings
```

### Get Featured Deals

Get featured deals and promotions.

- **URL**: `{{base_url}}/api/offers/featured`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `limit`: Maximum number of deals (default: 6)

**Example Request:**
```
GET {{base_url}}/api/offers/featured?limit=4
```

---

## Tips for Testing

1. Use environment variables in Postman to easily switch between development, testing, and production environments.
2. Create a separate collection for authentication to easily obtain fresh tokens.
3. Create test scripts to validate responses and set variables from responses.
4. Use collection runner to execute multiple requests in sequence.

## Common Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Authentication Flow

1. Register a user/seller account
2. Login to obtain an authentication token
3. Use the token in the Authorization header for authenticated requests

---

**Note**: Replace placeholder values like `{{base_url}}`, `{{seller_token}}`, and IDs with actual values when testing.