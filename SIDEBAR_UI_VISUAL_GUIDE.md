# New Sidebar UI Preview

## Visual Overview

### 🎨 Design Highlights

#### **Sidebar Header**
```
┌─────────────────────────────────┐
│  [🏪]  Artistry Cart            │
│        Seller Dashboard          │
└─────────────────────────────────┘
```
- Gradient background on logo (primary to primary/60)
- Store icon in rounded square
- Two-line text: Brand name + subtitle
- Smooth hover effects

#### **Navigation Sections**

**OVERVIEW**
```
→ [🏠] Dashboard           ●  (active indicator)
  [📖] Orders
  [💰] Payments
```

**PRODUCTS**
```
  [➕] Create Product
  [📦] All Products
```

**MARKETING**
```
  [📅] Create Event
  [📆] All Events
  [🎟️] Discounts
  [✨] Discount Codes
```

**COMMUNICATIONS**
```
  [✉️] Inbox
  [🔔] Notifications
```

#### **Sidebar Footer**
```
┌─────────────────────────────────┐
│  [👤] Seller Name           ›   │
│       seller@example.com        │
└─────────────────────────────────┘
```
Dropdown menu shows:
- Profile Settings
- Dashboard Settings
- Log out (red text)

---

## Dashboard Header

```
┌──────────────────────────────────────────────────────────────┐
│ ☰  │  🔍 Search products, orders...      [🔔³] [⚙️]          │
└──────────────────────────────────────────────────────────────┘
```

Features:
- **Sidebar toggle button** (☰)
- **Global search bar** with icon
- **Notification bell** with badge count (3 unread)
- **Settings icon** for quick access
- Sticky positioning with backdrop blur

---

## Color Scheme

### Active States
- **Background**: `bg-primary/10` (light primary tint)
- **Text**: `text-primary` (primary color)
- **Border**: `border-l-2 border-primary` (left accent)
- **Indicator**: Pulsing dot with primary color

### Hover States
- **Background**: `bg-accent/80` with smooth transition
- **Scale**: Icon scales to 110% on active
- **Duration**: 200ms ease-in-out

### Backgrounds
- **Sidebar**: Gradient from background to muted/20
- **Header**: Background with 95% opacity + backdrop blur
- **Logo**: Gradient from primary to primary/60

### Typography
- **Section Labels**: Uppercase, tracked, muted-foreground
- **Active Items**: Font semibold
- **Regular Items**: Font medium
- **Sizes**: Logo 18px, Nav 14px, Labels 12px

---

## Responsive Features

### Collapsed Mode (Icon Only)
```
[🏪]
─────
[🏠]
[📖]
[💰]
─────
[➕]
[📦]
─────
[📅]
[📆]
[🎟️]
[✨]
─────
[✉️]
[🔔]
─────
[👤]
```
- Shows only icons
- Tooltips on hover
- Avatar in footer
- Smooth animation

### Mobile View
- Sheet/drawer overlay
- Full navigation access
- Touch-friendly sizing
- Swipe to close

---

## Interactive Elements

### Notification Dropdown
```
┌─────────────────────────────────┐
│  Notifications                  │
├─────────────────────────────────┤
│  New Order #1234         2m ago │
│  You have a new order...        │
├─────────────────────────────────┤
│  Low Stock Alert         1h ago │
│  Product "Art Canvas" is...     │
├─────────────────────────────────┤
│  Payment Received        3h ago │
│  Payment of $89.00 has...       │
├─────────────────────────────────┤
│      View all notifications     │
└─────────────────────────────────┘
```

### Profile Dropdown
```
┌─────────────────────────────────┐
│  Seller Name                    │
│  seller@example.com             │
├─────────────────────────────────┤
│  [👤] Profile Settings          │
│  [⚙️] Dashboard Settings        │
├─────────────────────────────────┤
│  [🚪] Log out                   │
└─────────────────────────────────┘
```

---

## Animations

1. **Page Navigation**: Smooth fade transitions
2. **Active Indicator**: Pulse animation on dot
3. **Hover Effects**: 200ms ease-in-out
4. **Icon Scale**: Transform on active (110%)
5. **Collapse**: Smooth width transition
6. **Dropdown**: Fade in/out with scale

---

## Accessibility

✅ **Semantic HTML**: Proper nav, header, main structure
✅ **ARIA Labels**: All interactive elements labeled
✅ **Keyboard Navigation**: Full keyboard support
✅ **Focus States**: Visible focus rings
✅ **Screen Readers**: Descriptive text for icons
✅ **Color Contrast**: WCAG AA compliant
✅ **Tooltips**: Available in collapsed mode

---

## Technical Stack

- **UI Library**: Radix UI primitives
- **Styling**: Tailwind CSS with CVA
- **Icons**: Lucide React
- **Animations**: Tailwind transitions + CSS
- **State**: React hooks
- **Routing**: Next.js App Router

---

## Browser Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers
✅ Backdrop blur effects
✅ CSS Grid & Flexbox
