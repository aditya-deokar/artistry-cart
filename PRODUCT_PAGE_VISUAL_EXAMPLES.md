# Product Page - Visual Example

## Before vs After Comparison

### BEFORE (Static Display)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Product Title                                              │
│  by Artist Name                                             │
│  ⭐⭐⭐⭐⭐ (100 reviews)                                       │
│                                                             │
│  $45.99                                                     │
│                                                             │
│  Description text...                                        │
│                                                             │
│  [Add to Cart]                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AFTER (Dynamic with Real Information)
```
┌─────────────────────────────────────────────────────────────┐
│  ⏰ Flash Sale ends in: 2 days 5 hours 30 minutes           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🏷️ Flash Sale  | 📈 25% OFF | 📅 Summer Event         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [✓ In Your Cart] [♥ In Your Wishlist] [⚠️ Only 8 Left!]   │
│                                                             │
│  Product Title                                              │
│  by Artist Name                                             │
│  ⭐⭐⭐⭐⭐ (100 reviews)                                       │
│                                                             │
│  $45.99  $59.99  [💰 Save $14.00] (23% off)                 │
│  🎉 Special Event Price - Limited Time Only!                │
│                                                             │
│  Description text...                                        │
│                                                             │
│  Quantity: [−] 1 [+]                                        │
│  [✓ Update Cart (1 more)]                                   │
│  ✓ Already in your cart. Click to add 1 more.              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Status Badge Examples

### Multiple Status Badges
```
┌────────────────────────────────────────────────────────┐
│ Product Status Badges                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [✓ In Your Cart] [♥ In Your Wishlist]                │
│  [🔥 On Sale] [⚠️ Only 5 Left!]                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Badge Color Scheme
```
Cart Badge:      [✓ In Your Cart]      - Blue (bg-blue-600)
Wishlist Badge:  [♥ In Your Wishlist]  - Pink (bg-pink-600)
Sale Badge:      [🔥 On Sale]          - Orange (bg-orange-600)
Low Stock:       [⚠️ Only X Left!]     - Yellow (bg-yellow-600)
```

---

## Event Banner Examples

### Active Flash Sale
```
┌──────────────────────────────────────────────────────────┐
│ ⏰ Flash Sale ends in: 1 day 3 hours 45 minutes          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🏷️ Flash Sale  |  📈 50% OFF  |  📅 Weekend Special │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Seasonal Event
```
┌──────────────────────────────────────────────────────────┐
│ ⏰ Event ends in: 5 days 12 hours 30 minutes             │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🏷️ Seasonal  |  📈 25% OFF  |  📅 Summer Collection  │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Holiday Sale
```
┌──────────────────────────────────────────────────────────┐
│ ⏰ Holiday Sale ends in: 3 days 8 hours 15 minutes       │
│ ┌────────────────────────────────────────────────────┐   │
│ │ 🏷️ Holiday  |  📈 40% OFF  |  📅 Christmas Special  │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Add to Cart Button States

### State 1: Not in Cart (Available)
```
┌────────────────────────────────┐
│  Quantity: [−] 1 [+]           │
│                                │
│  [ 🛒 ADD TO CART ]            │
│                                │
│  ✅ In Stock                   │
└────────────────────────────────┘
```

### State 2: Already in Cart
```
┌────────────────────────────────┐
│  Quantity: [−] 2 [+]           │
│                                │
│  [ ✓ UPDATE CART (2 more) ]   │
│                                │
│  ✓ Already in your cart.      │
│  Click to add 2 more.          │
│                                │
│  ✅ In Stock                   │
└────────────────────────────────┘
```

### State 3: Out of Stock
```
┌────────────────────────────────┐
│  Quantity: [−] 1 [+]           │
│                                │
│  [ 🛒 SOLD OUT ]               │
│  (disabled, grayed out)        │
│                                │
│  ❌ Out of Stock               │
└────────────────────────────────┘
```

### State 4: Low Stock Warning
```
┌────────────────────────────────┐
│  Quantity: [−] 1 [+]           │
│                                │
│  [ 🛒 ADD TO CART ]            │
│                                │
│  ⚠️ Low Stock (3 left)         │
└────────────────────────────────┘
```

---

## Pricing Display Examples

### Regular Price (No Discount)
```
$49.99
```

### Sale Price
```
$45.99  $59.99
```

### With Savings Badge
```
$45.99  $59.99  [💰 Save $14.00]
```

### Complete Event Pricing
```
$35.99  $59.99  [💰 Save $24.00] (40% off)
🎉 Special Event Price - Limited Time Only!
```

---

## Complete Product Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ARTISTRY CART                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ⏰ Flash Sale ends in: 2 days 5 hours 30 minutes                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 🏷️ Flash Sale  |  📈 25% OFF  |  📅 Weekend Special               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  [✓ In Your Cart] [♥ In Your Wishlist] [⚠️ Only 8 Left!]               │
│                                                                         │
├──────────────────────────────┬──────────────────────────────────────────┤
│                              │                                          │
│   ┌────────────────────┐     │  Category: Paintings                     │
│   │                    │     │                                          │
│   │   Product Image    │     │  Beautiful Abstract Art                  │
│   │      Gallery       │     │  by John Smith                           │
│   │                    │     │  ⭐⭐⭐⭐⭐ (127 reviews)          ♥        │
│   └────────────────────┘     │                                          │
│   [img1][img2][img3]         │  $45.99 $59.99 [💰 Save $14.00] (23% off)│
│                              │  🎉 Special Event Price - Limited Time!  │
│                              │                                          │
│                              │  A stunning piece of modern abstract...  │
│                              │                                          │
│                              │  Size: [S] [M] [L]                       │
│                              │  Color: [●][●][●]                        │
│                              │                                          │
│                              │  Quantity: [−] 1 [+]                     │
│                              │  [ ✓ UPDATE CART (1 more) ]              │
│                              │  ✓ Already in your cart.                 │
│                              │  Click to add 1 more.                    │
│                              │  ⚠️ Low Stock (8 left)                   │
│                              │                                          │
│                              │  📦 Free Shipping on orders over $50     │
│                              │  🔄 30-day return policy                 │
│                              │  ✅ Authentic artwork                     │
│                              │                                          │
└──────────────────────────────┴──────────────────────────────────────────┘
│                                                                         │
│  [Description] [Specifications] [Reviews] [Shipping]                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Description:                                                      │  │
│  │ This beautiful abstract painting features...                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Related Products                                                       │
│  [Product 1] [Product 2] [Product 3] [Product 4]                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile Layout Example

```
┌───────────────────────────────────┐
│  ⏰ Ends in: 2d 5h 30m             │
│  🏷️ Flash Sale | 📈 25% OFF       │
│                                   │
│  [✓ In Cart] [♥ Wishlist]         │
│  [⚠️ Only 8 Left!]                │
│                                   │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │
│  │                             │  │
│  │      Product Image          │  │
│  │                             │  │
│  └─────────────────────────────┘  │
│  [img1] [img2] [img3] [img4]      │
│                                   │
├───────────────────────────────────┤
│  Category: Paintings              │
│                                   │
│  Beautiful Abstract Art           │
│  by John Smith                    │
│  ⭐⭐⭐⭐⭐ (127)             ♥      │
│                                   │
│  $45.99 $59.99                    │
│  [💰 Save $14.00]                 │
│  🎉 Limited Time!                 │
│                                   │
│  Description text here...         │
│                                   │
│  Size: [S] [M] [L]                │
│  Color: [●][●][●]                 │
│                                   │
│  Qty: [−] 1 [+]                   │
│  [ ✓ UPDATE CART (1 more) ]       │
│  ✓ In cart. Add 1 more.           │
│  ⚠️ Low Stock (8 left)            │
│                                   │
└───────────────────────────────────┘
```

---

## Color Palette Reference

### Badge Colors
```css
/* Cart Badge */
background: #2563eb;  /* blue-600 */
hover: #1d4ed8;       /* blue-700 */

/* Wishlist Badge */
background: #db2777;  /* pink-600 */
hover: #be185d;       /* pink-700 */

/* Sale Badge */
background: #ea580c;  /* orange-600 */
hover: #c2410c;       /* orange-700 */

/* Low Stock Badge */
background: #ca8a04;  /* yellow-600 */
hover: #a16207;       /* yellow-700 */

/* Event Banner */
gradient: from-purple-500/10 to-pink-500/10;
border: purple-500/20;

/* Savings Text */
color: #16a34a;       /* green-600 */
background: #dcfce7;  /* green-100 (light) */
background: #14532d;  /* green-900/30 (dark) */
```

---

## Icon Legend

| Icon | Meaning | Usage |
|------|---------|-------|
| ✓ | Checkmark | In cart, confirmed, success |
| ♥ | Heart | Wishlist, favorite |
| 🔥 | Fire | Hot sale, trending |
| ⚠️ | Warning | Low stock, attention needed |
| 🛒 | Shopping Cart | Add to cart action |
| 💰 | Money Bag | Savings, discount |
| 🎉 | Party Popper | Event, celebration |
| 📅 | Calendar | Event dates, schedule |
| 🏷️ | Tag | Event type, category |
| 📈 | Chart Up | Discount percentage |
| ⏰ | Alarm Clock | Countdown timer |
| ⭐ | Star | Rating, review |
| 📦 | Package | Shipping, delivery |
| 🔄 | Arrows | Return policy |
| ✅ | Check Box | Available, authentic |

---

## Interaction States

### Button Hover Effects
```
Normal State:
┌─────────────────────┐
│   ADD TO CART       │
└─────────────────────┘

Hover State:
┌─────────────────────┐
│   ADD TO CART       │  ← Slightly darker
└─────────────────────┘  ← Shadow enhanced

Disabled State:
┌─────────────────────┐
│   SOLD OUT          │  ← Grayed out
└─────────────────────┘  ← No cursor change
```

### Quantity Controls
```
Enabled:
[−] 5 [+]  ← Hover shows accent color

At Minimum:
[−] 1 [+]  ← Minus button disabled (grayed)

At Maximum:
[−] 10 [+] ← Plus button disabled (grayed)
```

---

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Stacked badges
- Compact event banner
- Full-width buttons
- Minimal text

### Tablet (640px - 1024px)
- Gallery sidebar appears
- Badges inline with wrap
- Expanded event info
- Two-column hints

### Desktop (> 1024px)
- Full two-column layout
- All badges inline
- Complete event banner
- Optimal spacing
- All details visible

---

## Animation Examples

### Countdown Timer
```
Animated update every second:
⏰ Ends in: 2 days 5 hours 30 minutes 45 seconds
           ↓
⏰ Ends in: 2 days 5 hours 30 minutes 44 seconds
           ↓
⏰ Ends in: 2 days 5 hours 30 minutes 43 seconds
```

### Badge Appearance
```
Fade in from top:
┌─────────────────────┐
│ [✓ In Your Cart] ↓  │  ← Slides down
└─────────────────────┘  ← Fades in
```

### Button State Change
```
Add to Cart → (click) → Update Cart
┌──────────────┐        ┌──────────────────┐
│ 🛒 ADD       │   →    │ ✓ UPDATE (1 more)│
└──────────────┘        └──────────────────┘
     (blue)                   (green accent)
```

---

This visual guide shows exactly what users will see! 🎨✨
