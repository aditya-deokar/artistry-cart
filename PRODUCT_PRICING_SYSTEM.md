# Product Pricing System Documentation

## Overview
The application now uses an advanced pricing system that automatically calculates and caches product prices, tracks price history, and handles event-based discounts.

## Schema Changes

### Products Model Enhancements

#### New Fields Added:
```prisma
model products {
  // ... existing fields ...
  
  // Enhanced pricing fields
  sale_price            Float?        // Non-event sale price (optional)
  regular_price         Float         // Base price (required, never changes)
  current_price         Float         // Cached current effective price (auto-calculated)
  is_on_discount        Boolean       @default(false) // Cache for quick queries (auto-calculated)
  
  // New relations
  priceHistory         ProductPricing[]
  eventProductDiscounts EventProductDiscount[]
}
```

#### Key Concepts:
- **regular_price**: The base/original price of the product (required)
- **sale_price**: Optional sale price when not in an event
- **current_price**: Automatically calculated and cached by PricingService
- **is_on_discount**: Automatically set based on current pricing

### New Models

#### 1. ProductPricing (Price History)
```prisma
model ProductPricing {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  productId        String   @db.ObjectId
  
  // Pricing details
  basePrice        Float    // Original price at time of pricing
  discountedPrice  Float?   // Final price after discount
  discountAmount   Float?   // Absolute discount amount applied
  discountPercent  Float?   // Percentage discount applied
  
  // Discount source tracking
  discountSource   String?  // "EVENT", "PRODUCT_SALE", "CATEGORY", "MANUAL", "BULK"
  sourceId         String?  @db.ObjectId  // EventId, etc.
  sourceName       String?  // For display ("Summer Sale 2025")
  
  // Validity period
  validFrom        DateTime
  validUntil       DateTime?
  isActive         Boolean  @default(true)
  
  // Metadata
  createdBy        String?  @db.ObjectId
  reason           String?
  notes            String?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

**Purpose**: Track price changes over time, including who made the change and why.

#### 2. EventProductDiscount (Product-Specific Event Discounts)
```prisma
model EventProductDiscount {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId          String   @db.ObjectId
  productId        String   @db.ObjectId
  
  // Discount details
  discountType     String   // "PERCENTAGE", "FIXED_AMOUNT", "SPECIAL_PRICE", "BUY_X_GET_Y"
  discountValue    Float    // Percentage or fixed amount
  maxDiscount      Float?   // Cap for percentage discounts
  
  // Special pricing
  specialPrice     Float?   // Override price for this product in this event
  
  // Conditions
  minQuantity      Int?     // Minimum quantity to get discount
  maxQuantity      Int?     // Maximum quantity eligible for discount
  
  // Metadata
  priority         Int      @default(1)
  isActive         Boolean  @default(true)
}
```

**Purpose**: Allow sellers to set specific discounts for individual products within an event.

## PricingService

### Core Methods

#### 1. `calculateProductPrice(productId: string)`
Calculates the current effective price for a product considering:
- Base price (sale_price or regular_price)
- Event discounts (if product is in an active event)
- Product-specific event discounts
- Returns: `{ productId, originalPrice, finalPrice, discountInfo, savings }`

#### 2. `updateCachedPricing(productId: string)`
- Calls `calculateProductPrice`
- Updates `current_price` and `is_on_discount` fields in database
- Called automatically when product is created/updated

#### 3. `deriveEventDiscount(context)`
Determines the best discount to apply based on:
- Product-specific event discount (highest priority)
- General event discount
- Returns discount calculation or null if no discount applies

## Product Creation Flow

### Frontend (seller-ui)

The create-product page now:

1. **Transforms form data** to match new schema:
```typescript
const productData = {
  // ... other fields ...
  regular_price: parseFloat(data.regular_price),  // Required
  sale_price: data.sale_price ? parseFloat(data.sale_price) : undefined,  // Optional
  // current_price and is_on_discount are calculated by backend
};
```

2. **Sends to backend**: `POST /product/api/products`

3. **Receives response** with cached pricing already calculated

### Backend (product-service)

The createProduct controller:

1. **Validates input** using Zod schema
2. **Creates product** in transaction:
   ```typescript
   const product = await prisma.$transaction(async (tx) => {
     const newProduct = await tx.products.create({
       data: {
         ...validatedData,
         current_price: validatedData.sale_price || validatedData.regular_price,
         Shop: { connect: { id: req.user.shop.id } },
       },
     });
     
     // Create initial pricing record and update cached price
     await PricingService.updateCachedPricing(newProduct.id);
     
     return newProduct;
   });
   ```

3. **Returns product** with all pricing fields populated

## Pricing Calculation Logic

### Price Hierarchy (from highest to lowest priority):

1. **Product-Specific Event Special Price**
   - If `EventProductDiscount.specialPrice` is set
   - Overrides all other pricing

2. **Product-Specific Event Discount**
   - If `EventProductDiscount` exists with percentage or fixed amount
   - Applied to base price (sale_price or regular_price)

3. **General Event Discount**
   - If product is in an active event
   - `events.discount_percent` applied to base price

4. **Product Sale Price**
   - If `products.sale_price` is set (non-event discount)

5. **Regular Price**
   - Base price (`products.regular_price`)

### Example Calculations:

**Scenario 1: No Discounts**
- regular_price: $100
- sale_price: undefined
- event: none
- **current_price: $100**
- **is_on_discount: false**

**Scenario 2: Sale Price**
- regular_price: $100
- sale_price: $80
- event: none
- **current_price: $80**
- **is_on_discount: true** (implicit discount)

**Scenario 3: Event Discount**
- regular_price: $100
- sale_price: $80
- event: 20% off (max $15 cap)
- Calculation: $80 * 0.20 = $16, capped at $15
- **current_price: $65** ($80 - $15)
- **is_on_discount: true**

**Scenario 4: Product-Specific Event Special Price**
- regular_price: $100
- sale_price: $80
- event: 20% off
- productDiscount: special_price = $50
- **current_price: $50** (overrides everything)
- **is_on_discount: true**

## Querying Products

### Performance Optimization

The cached fields enable fast queries:

```typescript
// Find all discounted products
const discountedProducts = await prisma.products.findMany({
  where: { 
    is_on_discount: true,
    isDeleted: false 
  }
});

// Find products by price range (uses current_price)
const affordableProducts = await prisma.products.findMany({
  where: {
    current_price: { gte: 10, lte: 50 }
  }
});
```

### Indexes
The schema includes indexes for performance:
```prisma
@@index([current_price])
@@index([is_on_discount])
@@index([eventId])
```

## Event Management

### When Creating/Updating Events

If you add products to an event or modify event discounts:

```typescript
// Update all products in the event
const products = await prisma.products.findMany({
  where: { eventId: eventId }
});

for (const product of products) {
  await PricingService.updateCachedPricing(product.id);
}
```

### Event Product Discounts

Sellers can set specific discounts for products within an event:

```typescript
await prisma.eventProductDiscount.create({
  data: {
    eventId: eventId,
    productId: productId,
    discountType: "PERCENTAGE",
    discountValue: 30,
    maxDiscount: 50,
    isActive: true
  }
});

// Update cached pricing
await PricingService.updateCachedPricing(productId);
```

## Migration Notes

### For Existing Products

If you have existing products, run a migration to populate cached fields:

```typescript
const allProducts = await prisma.products.findMany();

for (const product of allProducts) {
  // Set initial current_price if not set
  if (!product.current_price) {
    await prisma.products.update({
      where: { id: product.id },
      data: {
        current_price: product.sale_price || product.regular_price,
        is_on_discount: Boolean(product.sale_price)
      }
    });
  }
  
  // Create pricing history
  await PricingService.updateCachedPricing(product.id);
}
```

## Benefits

1. **Performance**: Queries for price ranges and discounts are fast (no joins needed)
2. **Price History**: Complete audit trail of all price changes
3. **Flexibility**: Support multiple discount types and sources
4. **Analytics**: Easy to track discount effectiveness and pricing trends
5. **Consistency**: Centralized pricing logic prevents calculation errors
6. **Scalability**: Cached values reduce computation in high-traffic scenarios

## Frontend Display

When displaying products, you can now show:

```typescript
// Product card
<div>
  {product.is_on_discount && (
    <span className="line-through">${product.regular_price}</span>
  )}
  <span className="font-bold">${product.current_price}</span>
  {product.is_on_discount && (
    <span className="text-red-500">
      Save ${(product.regular_price - product.current_price).toFixed(2)}
    </span>
  )}
</div>
```

## API Endpoints

### Product Creation (Updated)
- **Endpoint**: `POST /product/api/products`
- **Required Fields**:
  - `regular_price` (number, required)
  - `sale_price` (number, optional)
  - All other existing product fields
- **Response**: Includes `current_price` and `is_on_discount`

### Product Pricing Info
- **Endpoint**: `GET /product/api/products/:slug`
- **Response**: Includes full pricing information with discounts

## Best Practices

1. **Always use `current_price`** for display and calculations
2. **Use `is_on_discount`** for filtering discounted products
3. **Update cached pricing** whenever:
   - Product sale_price changes
   - Product joins/leaves an event
   - Event dates or discounts change
   - Event product discounts are modified
4. **Show price history** to users for transparency
5. **Log pricing changes** in ProductPricing for audit trails

## Troubleshooting

### Problem: current_price not updating
**Solution**: Call `PricingService.updateCachedPricing(productId)` manually

### Problem: Discount not showing
**Check**:
- Event is active and within date range
- EventProductDiscount.isActive is true
- Product.eventId is set correctly

### Problem: Wrong price calculated
**Debug**:
```typescript
const pricing = await PricingService.calculateProductPrice(productId);
console.log("Pricing debug:", pricing);
```

## Future Enhancements

- Scheduled price changes
- Bulk pricing updates
- Price comparison with competitors
- Dynamic pricing based on demand
- Discount stacking rules
- Customer-specific pricing (B2B)
