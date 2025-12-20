# Artistry Cart - Premium Navigation Blueprint

> **Design Philosophy**: The navigation should feel invisible yet always accessible—a refined frame for the content rather than a competing element. Think gallery exhibition, luxury retail, editorial magazine.

---

## 🎨 Design Inspiration

| Brand | Key Takeaways |
|-------|---------------|
| **Apple** | Transparent header, minimal links, icons that transform on scroll |
| **Aesop** | Centered logo, text links that breathe, dark/light mode transitions |
| **Cartier** | Elegant wordmark, delicate hover states, luxury feel |
| **SSENSE** | Mega-menu on hover, clean categorization, search prominence |
| **Monocle** | Editorial layout, minimal navigation, content-first approach |
| **Notion** | Smooth scroll transitions, floating pill navigation |

---

## 📐 Navigation Variants

### Variant A: Floating Pill (Recommended)
Best for: Landing page, immersive experiences

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Logo]      ┌───────────────────────────────────────────┐      [Icons] │
│              │  Shop  │  Artisans  │  AI Vision  │  About │             │
│              └───────────────────────────────────────────┘              │
│                              ↑ Floating pill nav                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Variant B: Split Navigation
Best for: E-commerce focus, more menu items

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [Shop] [Artisans] [AI Vision]   [LOGO]   [About] [Search] [Cart] [User]│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Variant C: Minimal Logo-Centric
Best for: Maximum content focus

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│       [☰]                    [ARTISTRY CART]              [🔍] [👤] [🛒]│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑ Hamburger reveals full menu
```

---

## 🎯 Recommended: Floating Pill Navigation

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← 24px padding                                          24px padding →     │
│                                                                             │
│  ┌──────────────┐                                    ┌─────────────────┐   │
│  │ Artistry     │    ┌────────────────────────────┐  │ [🔍]  [♡]  [🛒] │   │
│  │ Cart         │    │ Shop ⌄ │ Artisans │ Create │  │     [User]      │   │
│  └──────────────┘    └────────────────────────────┘  └─────────────────┘   │
│       ↑ Logo               ↑ Floating Pill Nav           ↑ Action Icons     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scroll States

| State | Trigger | Appearance |
|-------|---------|------------|
| **Initial** | `scrollY = 0` | Fully transparent, large padding (py-6), logo prominent |
| **Scrolled** | `scrollY > 50` | Backdrop blur, subtle background, smaller padding (py-3) |
| **Hidden** | Scrolling down | Header slides up and hides |
| **Visible** | Scrolling up | Header slides back into view |

---

## 📝 Navigation Elements

### 1. Logo

**Type**: Wordmark (Playfair Display)

**States**:
```
Default:     "Artistry" + "Cart" (gold)
Scrolled:    Same, slightly smaller
Hover:       "Cart" glows subtly
```

**Code Reference**:
```tsx
<span className="font-[family-name:var(--font-playfair)] text-2xl">
  Artistry
  <span className="text-[var(--ac-gold)] italic">Cart</span>
</span>
```

---

### 2. Navigation Links

| Link | Destination | Has Dropdown? |
|------|-------------|---------------|
| **Shop** | `/product` | Yes - Categories mega-menu |
| **Artisans** | `/artisans` | No |
| **Create** | `/ai-vision` | No - Badge: "AI Powered" |
| **About** | `/about` | No |

**Link Hover Effect Options**:

1. **Underline Expand** (Recommended)
   - Underline grows from center on hover
   - Gold color accent

2. **Background Pill**
   - Subtle pill background appears
   - Shared layout animation between links

3. **Character Lift**
   - Individual letters lift slightly
   - Staggered animation

---

### 3. Shop Mega-Menu

**Trigger**: Hover on "Shop" link

**Layout**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ CATEGORIES  │  │ TOP PICKS   │  │ ARTISAN     │  │              │  │
│  │             │  │             │  │ SPOTLIGHT   │  │   [Featured  │  │
│  │ • Art       │  │ [Image]     │  │             │  │    Product   │  │
│  │ • Jewelry   │  │ Best Seller │  │ [Portrait]  │  │    Image]    │  │
│  │ • Home      │  │ $XXX        │  │ Artisan Name│  │              │  │
│  │ • Fashion   │  │             │  │ "Quote..."  │  │              │  │
│  │ • All →     │  │ [Image]     │  │             │  │              │  │
│  │             │  │ New Arrival │  │ Visit →     │  │              │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘  │
│                                                                         │
│  [View All Products →]                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Animation**:
- Fade in with slight y-translate
- Staggered column reveal
- Exit: Quick fade out

---

### 4. Action Icons (Right Side)

| Icon | Function | States |
|------|----------|--------|
| **Search** 🔍 | Opens search modal/overlay | Hover: scale + glow |
| **Wishlist** ♡ | Opens wishlist | Badge with count, filled when items |
| **Cart** 🛒 | Opens cart drawer | Badge with count |
| **User** 👤 | Dropdown menu | Avatar when logged in |

**Icon Hover Effects**:
- Scale to 1.1
- Color transition to gold
- Magnetic cursor effect (subtle)

**Badge Design**:
```
┌───────┐
│  🛒   │ ← Icon
│  ●3   │ ← Small gold dot with count
└───────┘
```

---

### 5. Mobile Navigation

**Trigger**: Hamburger icon (viewport < 1024px)

**Mobile Header**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [☰]              Artistry Cart                    [🔍] [🛒]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile Slide-Out Menu**:
```
┌─────────────────────────────────────────┐
│                                    [✕]  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔍 Search products...           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Shop                              →    │
│  ├─ Art & Prints                       │
│  ├─ Jewelry                            │
│  ├─ Home & Living                      │
│  └─ View All                           │
│                                         │
│  Artisans                          →    │
│                                         │
│  Create with AI      [NEW]              │
│                                         │
│  About                             →    │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  [Login]  [Sign Up]                     │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  🌙 Dark Mode                [Toggle]   │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  📧 hello@artistrycart.com              │
│  📱 Follow us: [Icons]                  │
│                                         │
└─────────────────────────────────────────┘
```

**Mobile Menu Animations**:
- Slides in from right
- Background overlay with blur
- Links stagger in
- Spring physics on open/close

---

## ⚡ Micro-Interactions

### 1. Link Underline Animation

```css
/* Underline expands from center */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--ac-gold);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 100%;
}
```

### 2. Magnetic Icon Effect

```typescript
// Icons slightly follow cursor on hover
const handleMouseMove = (e: MouseEvent) => {
  const rect = icon.getBoundingClientRect();
  const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
  const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
  
  gsap.to(icon, {
    x, y,
    duration: 0.3,
    ease: 'power2.out',
  });
};
```

### 3. Scroll Progress Indicator

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           [Navigation]                                  │
├─────────────────────────────────────────────────────────────────────────┤
│████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ↑ Gold progress bar showing scroll position                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4. Cart Count Animation

```typescript
// Bounce when count changes
gsap.fromTo(badge, 
  { scale: 0 },
  { 
    scale: 1, 
    duration: 0.4, 
    ease: 'back.out(2)' 
  }
);
```

### 5. Logo Morph on Scroll

```typescript
// Logo shrinks and becomes more compact
gsap.to(logo, {
  scale: scrolled ? 0.85 : 1,
  duration: 0.3,
  ease: 'power2.out',
});
```

---

## 🎨 Color Behavior

### Light Mode

| State | Background | Text | Border |
|-------|------------|------|--------|
| Initial | `transparent` | `--ac-charcoal` | `none` |
| Scrolled | `rgba(250, 249, 247, 0.8)` | `--ac-charcoal` | `--ac-linen` |
| Pill Nav | `rgba(255, 255, 255, 0.05)` | `--ac-charcoal` | `rgba(255, 255, 255, 0.1)` |

### Dark Mode

| State | Background | Text | Border |
|-------|------------|------|--------|
| Initial | `transparent` | `--ac-pearl` | `none` |
| Scrolled | `rgba(13, 13, 13, 0.8)` | `--ac-pearl` | `--ac-slate` |
| Pill Nav | `rgba(255, 255, 255, 0.05)` | `--ac-pearl` | `rgba(255, 255, 255, 0.1)` |

---

## 📁 File Structure

```
apps/user-ui/src/
├── components/
│   └── navigation/
│       ├── index.ts                 # Barrel export
│       ├── Navigation.tsx           # Main navigation component
│       ├── NavLogo.tsx              # Logo with animations
│       ├── NavLinks.tsx             # Desktop navigation links
│       ├── NavLink.tsx              # Individual link with hover
│       ├── NavActions.tsx           # Search, wishlist, cart, user
│       ├── NavMegaMenu.tsx          # Shop dropdown mega-menu
│       ├── MobileMenu.tsx           # Full mobile navigation
│       ├── SearchOverlay.tsx        # Full-screen search (optional)
│       └── CartDrawer.tsx           # Slide-out cart (optional)
```

---

## 🔧 Props Interface

```typescript
interface NavigationProps {
  // Appearance
  variant?: 'floating' | 'split' | 'minimal';
  transparent?: boolean;
  
  // Behavior
  hideOnScroll?: boolean;
  showProgress?: boolean;
  
  // Content
  links?: NavLink[];
  actions?: ('search' | 'wishlist' | 'cart' | 'user' | 'theme')[];
  
  // Customization
  className?: string;
  logoClassName?: string;
  
  // Mega menu content (could be fetched or passed)
  categories?: Category[];
  featuredProducts?: Product[];
}

interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
  isNew?: boolean;
}
```

---

## ⏱️ Implementation Phases

### Phase 1: Core Structure (2-3 hours)
1. Create `Navigation.tsx` base component
2. Implement scroll detection (transparent → solid)
3. Implement hide on scroll down, show on scroll up
4. Build `NavLogo.tsx` with scale animation
5. Build `NavLinks.tsx` with underline hover

### Phase 2: Actions & Mobile (2-3 hours)
6. Build `NavActions.tsx` with icon hover effects
7. Build `MobileMenu.tsx` with slide animation
8. Add cart/wishlist badge animations
9. Integrate with existing stores (cart, wishlist, user)

### Phase 3: Mega-Menu (2 hours)
10. Build `NavMegaMenu.tsx` structure
11. Add hover trigger and animation
12. Style columns and content

### Phase 4: Polish (1-2 hours)
13. Add magnetic hover effects
14. Add scroll progress indicator (optional)
15. Test responsive behavior
16. Test dark mode transitions

---

## 🔗 Integration Points

| System | Integration |
|--------|-------------|
| **AuthStore** | User login state, avatar display |
| **CartStore** | Cart item count badge |
| **WishlistStore** | Wishlist item count badge |
| **Theme** | ModeToggle component |
| **Search** | GlobalSearch component |
| **Routing** | Next.js router for active states |

---

## ✅ Success Criteria

- [ ] Transparent-to-solid transition is smooth (300ms)
- [ ] Hide/show on scroll feels natural (not jarring)
- [ ] Mega-menu appears instantly, doesn't feel delayed
- [ ] Mobile menu has spring physics feel
- [ ] All hover effects are silky (60fps)
- [ ] Cart/wishlist badges animate when counts change
- [ ] Works flawlessly in both light and dark modes
- [ ] No layout shift when scrolled state changes
- [ ] Accessible (keyboard nav, screen reader friendly)
- [ ] Matches premium aesthetic of landing page

---

## 🎥 Animation Reference

### GSAP Timeline for Scroll Transition

```typescript
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    // Header background transition
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top -50',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });

    // Hide on scroll down, show on scroll up
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      onUpdate: (self) => {
        const direction = self.direction;
        const scroll = self.scroll();
        
        if (scroll > 150) {
          setHidden(direction === 1);
        } else {
          setHidden(false);
        }
      },
    });
  });

  return () => ctx.revert();
}, []);
```

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*Related: `LANDING_PAGE_BLUEPRINT.md`, `ABOUT_PAGE_BLUEPRINT.md`*
