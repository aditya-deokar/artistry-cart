# Artistry Cart - Artisans Page Blueprint

> **Design Philosophy**: A discovery platform that celebrates the makers behind the art. The Artisans page should feel like walking through a curated gallery of human stories—each artisan a unique chapter in the larger narrative of handcrafted excellence.

---

## 🎨 Design Inspiration

Drawing from world-class creative directories and artist platforms:

| Brand | Inspiration |
|-------|-------------|
| **Behance** | Grid-based discovery, filtering system, portfolio showcases |
| **Etsy** | Artisan storytelling, shop profiles, craft authenticity |
| **Dribbble** | Clean card layouts, hover interactions, designer spotlights |
| **1stDibs** | Luxury dealer profiles, curated categories, trust signals |
| **Artsy** | Artist bios, gallery relationships, sophisticated aesthetics |
| **Obscura** | Discovery-focused, location-based exploration, immersive profiles |

---

## 📐 Page Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│  NAVIGATION (Sticky, contextual breadcrumbs)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. HERO - DISCOVER ARTISANS                                │
│     Cinematic intro with search + featured artisan          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2. FEATURED ARTISANS CAROUSEL                              │
│     Spotlight on exceptional makers                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3. FILTER & SEARCH BAR                                     │
│     Categories, Location, Craft Type, Rating                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  4. ARTISAN GRID                                            │
│     Main discovery grid with artisan cards                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  5. MAP EXPLORATION (Optional)                              │
│     Interactive world map of artisans                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  6. CRAFT CATEGORIES                                        │
│     Browse by craft type                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  7. ARTISAN STORIES                                         │
│     Long-form feature articles                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  8. BECOME AN ARTISAN CTA                                   │
│     Seller recruitment section                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Section Details

### 1. Hero - Discover Artisans
**Purpose**: Create an immersive entry point that invites exploration and showcases artisan excellence

**Layout**: 
- Full viewport height (90vh)
- Split design: Left text + search, Right featured artisan image
- Floating particles/brush strokes animation

**Content**:
```
Eyebrow: "The Makers"

Headline: "Meet the Hands Behind the Art"

Subheadline: "Discover extraordinary artisans from around the globe. 
Each maker brings generations of skill, passion, and unique vision 
to every creation."

Search Box: "Search artisans by name, craft, or location..."

Quick Stats:
• 5,000+ Verified Artisans
• 120+ Countries
• 50+ Craft Categories

Featured Artisan Preview:
[Large portrait image]
"Maria Santos" — Master Ceramicist, Portugal
"Each piece carries the soul of the earth and the rhythm of the wheel."
[View Profile →]
```

**Design Elements**:
- Typography: Playfair Display headline, Inter body
- Search bar with gold accent border
- Floating stat pills with icons
- Featured artisan with parallax image
- Decorative gold brush strokes

**Animation**:
- GSAP staggered text reveal
- Search bar subtle glow on focus
- Stat counter animation
- Featured artisan image parallax
- Floating particle background

---

### 2. Featured Artisans Carousel
**Purpose**: Spotlight exceptional artisans and create aspiration for discovery

**Layout**:
- Horizontal scroll carousel
- Large feature cards with video/image
- Navigation dots + arrows

**Content**:
```
Section Label: "Featured Makers"

Headline: "Artisans of the Month"

[Carousel of 5-8 Featured Artisans]

Card Structure:
┌────────────────────────────────────────┐
│                                        │
│     [Artisan Portrait / Video]         │
│                                        │
│     ─────────────────────────────      │
│     CERAMICS • PORTUGAL                │
│     Maria Santos                        │
│     "Where clay meets soul"            │
│                                        │
│     ★★★★★ (4.9) • 127 Creations        │
│                                        │
│     [View Studio →]                    │
└────────────────────────────────────────┘
```

**Design Elements**:
- Oversized cards (400-500px width)
- Video auto-play on hover (muted)
- Gradient overlay for text readability
- Gold accent on craft badge
- Subtle card elevation on hover

**Animation**:
- Smooth horizontal scroll with snap
- Card scale on hover (1.02)
- Video fade-in on hover
- Text slide-up reveal
- Carousel auto-advance (optional)

---

### 3. Filter & Search Bar (Sticky)
**Purpose**: Enable powerful discovery through intuitive filtering

**Layout**:
- Sticky bar below hero (becomes visible on scroll)
- Multi-select filters with dropdowns
- Search input with suggestions
- View toggle (Grid/List/Map)

**Filter Categories**:
```
┌──────────────────────────────────────────────────────────────────────┐
│  🔍 Search    │ Category ▼ │ Location ▼ │ Rating ▼ │ Sort By ▼ │ ⊞ ☰ │
└──────────────────────────────────────────────────────────────────────┘

Category Options:
• All Categories
• Ceramics & Pottery
• Jewelry & Metalwork
• Textiles & Weaving
• Woodworking
• Painting & Fine Art
• Sculpture
• Glass & Crystal
• Leather Goods
• Paper & Calligraphy

Location Options:
• All Locations
• Europe (continent collapse)
  - Portugal, Italy, France, etc.
• Asia
• Americas
• Africa
• Oceania

Rating Options:
• 4.5+ Stars
• 4.0+ Stars
• All Ratings
• New Artisans

Sort Options:
• Featured
• Newest
• Highest Rated
• Most Products
• Alphabetical
```

**Design Elements**:
- Frosted glass background (backdrop-blur)
- Minimal dropdown design
- Active filter chips with remove button
- View toggle icons
- Results count indicator

**Animation**:
- Sticky transition on scroll
- Dropdown smooth open/close
- Filter chips animate in/out
- Results count update animation

---

### 4. Artisan Grid
**Purpose**: Main discovery interface for browsing all artisans

**Layout**:
- Responsive grid (4 cols desktop, 3 tablet, 2 mobile)
- Infinite scroll or pagination
- Masonry option for varied heights

**Artisan Card Design**:
```
┌──────────────────────────────────┐
│                                  │
│    [Artisan Portrait Image]      │
│                                  │
│    ┌────────────────────────┐    │
│    │ Featured Products      │    │  ← Mini gallery on hover
│    │ [img] [img] [img]      │    │
│    └────────────────────────┘    │
│                                  │
├──────────────────────────────────┤
│  ✓ Verified Artisan              │  ← Trust badge
│                                  │
│  Maria Santos                     │  ← Name (Cormorant)
│  Master Ceramicist                │  ← Title
│                                  │
│  📍 Lisbon, Portugal             │  ← Location
│  🎨 Ceramics & Pottery           │  ← Craft category
│                                  │
│  ★★★★★ 4.9 (127 reviews)        │  ← Rating
│  🛍️ 45 Products                  │  ← Product count
│                                  │
│  [View Studio]                   │  ← CTA Button
└──────────────────────────────────┘
```

**Card States**:
- **Default**: Portrait image, basic info
- **Hover**: Product gallery reveals, scale effect
- **New Artisan**: "New" badge overlay
- **Top Seller**: Gold crown badge

**Design Elements**:
- Aspect ratio 3:4 portrait images
- Grayscale → color on hover (optional)
- Gold verified badge
- Subtle border with hover elevation
- Craft category color coding

**Animation**:
- Staggered grid entrance on scroll
- Card hover: scale(1.02), shadow increase
- Product gallery slide-in on hover
- Infinite scroll loading state
- Skeleton loaders while fetching

---

### 5. Map Exploration (Optional Premium Feature)
**Purpose**: Geographic discovery of artisans worldwide

**Layout**:
- Interactive world map (COBE globe or Mapbox)
- Artisan clusters by location
- Click to explore region

**Features**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [Interactive World Map]                         │
│                                                             │
│    [Cluster Pin: 127 Artisans]                              │
│         •                                                    │
│             •  [Cluster Pin: 89 Artisans]                   │
│                    •                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Popular Regions:                                            │
│  [Portugal] [Japan] [India] [Italy] [Mexico] [Morocco]      │
└─────────────────────────────────────────────────────────────┘

On Cluster Click:
┌───────────────────────────┐
│ Artisans in Portugal (127)│
│ ─────────────────────────  │
│ [Avatar] Maria Santos      │
│ [Avatar] João Oliveira     │
│ [Avatar] Ana Ferreira      │
│ ... View All →             │
└───────────────────────────┘
```

**Design Elements**:
- COBE globe for premium feel (existing component)
- Custom pin markers with count
- Region hover highlights
- Sidebar list on region select
- Smooth zoom transitions

**Animation**:
- Globe rotation
- Pin pulse animation
- Cluster expand on click
- Region highlight on hover
- Flying connection lines between locations

---

### 6. Craft Categories
**Purpose**: Browse artisans by their craft specialty

**Layout**:
- Horizontal scroll or grid
- Large category cards with representative imagery
- Artisan count per category

**Categories**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│  BROWSE BY CRAFT                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │              │  │              │  │              │  │              │ │
│  │  [Image]     │  │  [Image]     │  │  [Image]     │  │  [Image]     │ │
│  │              │  │              │  │              │  │              │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────│ │
│  │  CERAMICS    │  │  JEWELRY     │  │  TEXTILES    │  │  WOODWORK    │ │
│  │  847 Artisans│  │  612 Artisans│  │  523 Artisans│  │  445 Artisans│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  FINE ART    │  │  SCULPTURE   │  │  GLASS       │  │  LEATHER     │ │
│  │  389 Artisans│  │  234 Artisans│  │  198 Artisans│  │  176 Artisans│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Elements**:
- Square or 4:3 aspect ratio images
- Craft-representative photography
- Artisan count with gold accent
- Hover: image zoom, overlay darkens
- Active state for selected category

**Animation**:
- Staggered card entrance
- Image zoom on hover
- Count number animation on scroll
- Category filter update on click

---

### 7. Artisan Stories
**Purpose**: Deep-dive editorial content showcasing artisan journeys

**Layout**:
- Magazine-style feature cards
- 2-3 featured stories
- Link to full stories/blog section

**Content**:
```
Section Label: "Artisan Stories"
Headline: "The Journey Behind the Craft"

┌───────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  [Large Feature Story Card - Full Width]                               │
│  ═══════════════════════════════════════                               │
│                                                                        │
│  [Atmospheric Workshop Image]                                          │
│                                                                        │
│  MASTER ARTISAN SERIES                                                 │
│                                                                        │
│  "Three Generations of Fire and Clay:                                  │
│   The Santos Family Legacy"                                            │
│                                                                        │
│  In a small village outside Lisbon, a family has shaped                │
│  clay for over 100 years. We spent a week learning their secrets...   │
│                                                                        │
│  [Read Full Story →]                         12 min read               │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│  [Story Image]              │  │  [Story Image]              │
│                             │  │                             │
│  CRAFT SPOTLIGHT            │  │  BEHIND THE SCENES          │
│                             │  │                             │
│  "The Art of Japanese       │  │  "From Engineer to          │
│   Kintsugi"                 │  │   Glassblower"              │
│                             │  │                             │
│  [Read More →]              │  │  [Read More →]              │
└─────────────────────────────┘  └─────────────────────────────┘
```

**Design Elements**:
- Editorial typography (large serif headlines)
- High-quality atmospheric photography
- Reading time indicator
- Category labels (Master Series, Spotlight, etc.)
- Minimal card design

**Animation**:
- Image parallax on scroll
- Text reveal animation
- Card hover effects
- Story label fade-in

---

### 8. Become an Artisan CTA
**Purpose**: Recruit new artisans to join the platform

**Layout**:
- Full-width dark section
- Split layout: Left benefits, Right signup prompt
- Testimonial from existing artisan

**Content**:
```
Section Background: Dark (--ac-obsidian)

Headline: "Share Your Craft with the World"

Subheadline: "Join 5,000+ artisans who've found their audience 
on Artistry Cart. No listing fees. Fair commissions. 
A community that celebrates your work."

Benefits Grid:
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│  🌍               │  │  💰               │  │  🤝               │
│  Global Reach     │  │  Fair Earnings    │  │  Community        │
│                   │  │                   │  │                   │
│  Your creations   │  │  Keep 85% of      │  │  Connect with     │
│  seen by millions │  │  every sale       │  │  fellow makers    │
└───────────────────┘  └───────────────────┘  └───────────────────┘

Artisan Testimonial:
"Joining Artistry Cart transformed my small workshop into 
an international business. The platform respects artisans 
and the AI Vision feature has brought me commissions I 
never dreamed of."

— Kenji Tanaka, Woodworker, Japan
⭐⭐⭐⭐⭐ Member since 2021

CTA Buttons:
[Apply to Join] [Learn More About Selling]
```

**Design Elements**:
- Gradient background (obsidian to onyx)
- Gold accent on benefits icons
- Artisan testimonial with avatar
- Dual CTA buttons (primary gold, secondary outline)
- Decorative gold lines

**Animation**:
- Benefits stagger entrance
- Testimonial fade-in
- Button hover effects
- Background subtle gradient shift

---

## 🎭 Animation Guidelines

### Entrance Animations (GSAP ScrollTrigger)
```javascript
// Grid cards staggered entrance
gsap.from('.artisan-card', {
  y: 80,
  opacity: 0,
  duration: 0.6,
  stagger: 0.08,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.artisan-grid',
    start: 'top 75%',
  }
});

// Category cards horizontal reveal
gsap.from('.category-card', {
  x: 60,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.categories-section',
    start: 'top 80%',
  }
});
```

### Card Interactions
```javascript
// Hover effect on artisan cards
const cards = document.querySelectorAll('.artisan-card');

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, {
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      duration: 0.3,
      ease: 'power2.out'
    });
    
    // Reveal product gallery
    gsap.to(card.querySelector('.product-gallery'), {
      opacity: 1,
      y: 0,
      duration: 0.3
    });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      scale: 1,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      duration: 0.3
    });
  });
});
```

### Infinite Scroll Loading
```javascript
// Skeleton loader animation
gsap.to('.skeleton-card', {
  backgroundPosition: '200% 0',
  duration: 1.5,
  repeat: -1,
  ease: 'linear'
});

// New cards entrance after load
gsap.from('.artisan-card.new', {
  y: 40,
  opacity: 0,
  duration: 0.5,
  stagger: 0.05,
  ease: 'power2.out'
});
```

---

## 📁 Proposed File Structure

```
apps/user-ui/src/
├── app/
│   └── artisans/
│       ├── page.tsx                # Main artisans listing page
│       └── [id]/
│           └── page.tsx            # Individual artisan profile page
│
├── components/
│   └── artisans/
│       ├── index.ts                # Barrel exports
│       ├── ArtisansHero.tsx        # Hero section with search
│       ├── FeaturedArtisans.tsx    # Featured carousel
│       ├── ArtisanFilters.tsx      # Filter bar component
│       ├── ArtisanGrid.tsx         # Main discovery grid
│       ├── ArtisanCard.tsx         # Individual artisan card
│       ├── ArtisanMapExplorer.tsx  # World map component
│       ├── CraftCategories.tsx     # Category browse section
│       ├── ArtisanStories.tsx      # Editorial stories section
│       ├── BecomeArtisanCTA.tsx    # Seller recruitment CTA
│       │
│       └── profile/                # Artisan profile page components
│           ├── ProfileHero.tsx     # Profile header
│           ├── ProfileBio.tsx      # About the artisan
│           ├── ProfileGallery.tsx  # Work portfolio
│           ├── ProfileProducts.tsx # Products grid
│           ├── ProfileReviews.tsx  # Customer reviews
│           └── ProfileContact.tsx  # Contact/commission CTA
│
├── hooks/
│   ├── useArtisans.ts              # Artisan data fetching
│   ├── useArtisanFilters.ts        # Filter state management (nuqs)
│   └── useInfiniteArtisans.ts      # Infinite scroll logic
│
└── actions/
    └── artisan.actions.ts          # Server actions for artisan data
```

---

## 🖼️ Image Requirements

| Section | Image Type | Dimensions | Notes |
|---------|------------|------------|-------|
| Hero | Featured artisan portrait | 800x1000 | Full-color, high quality |
| Featured Carousel | Artisan portraits | 600x800 | Portrait orientation |
| Artisan Cards | Profile photos | 400x500 | Consistent aspect ratio |
| Category Cards | Craft imagery | 600x600 | Representative of craft |
| Stories | Editorial photos | 1200x800 | Atmospheric, lifestyle |
| CTA Section | Workshop/hands | 800x600 | Warm, inviting |

**Image Guidelines**:
- All artisan photos should feel authentic (not stock-like)
- Prefer images of artisans at work or with their creations
- Consistent lighting and color grading
- Support for WebP format with fallbacks

---

## 🎨 Color Usage

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Hero Background | `--ac-ivory` | `--ac-obsidian` |
| Filter Bar | `--ac-cream` with blur | `--ac-onyx` with blur |
| Artisan Cards | `--ac-cream` | `--ac-slate` |
| Category Cards | `--ac-ivory` | `--ac-onyx` |
| Stories Section | `--ac-linen` | `--ac-onyx` |
| CTA Section | `--ac-obsidian` | `--ac-obsidian` |
| Verified Badge | `--ac-gold` | `--ac-gold` |
| Craft Labels | Category-specific colors | Desaturated variants |

---

## ⏱️ Implementation Phases

### Phase 1: Core Structure (6-8 hours)
1. Create `/artisans/page.tsx` route
2. Build `ArtisansHero` component
3. Build `ArtisanFilters` component with nuqs
4. Build `ArtisanCard` component

### Phase 2: Main Grid (4-6 hours)
5. Build `ArtisanGrid` with infinite scroll
6. Implement filter functionality
7. Add skeleton loaders
8. Create `useArtisans` hook

### Phase 3: Featured Sections (4-5 hours)
9. Build `FeaturedArtisans` carousel
10. Build `CraftCategories` section
11. Build `ArtisanStories` section

### Phase 4: Advanced Features (6-8 hours)
12. Build `ArtisanMapExplorer` (optional)
13. Build `BecomeArtisanCTA` section
14. Create artisan profile page structure

### Phase 5: Polish (3-4 hours)
15. Add all GSAP animations
16. Mobile responsiveness
17. Dark mode verification
18. Performance optimization (lazy loading, virtualization)

---

## 📱 Responsive Considerations

| Breakpoint | Adjustments |
|------------|-------------|
| **Desktop (1200px+)** | 4-column grid, horizontal carousels, full map |
| **Tablet (768-1199px)** | 3-column grid, stacked filters, simplified map |
| **Mobile (<768px)** | 2-column grid, drawer filters, list view option, no map |

### Mobile-Specific Features:
- Swipe gestures for carousels
- Bottom sheet for filters
- Simplified artisan cards
- Single-column story cards
- Sticky "Apply Filters" button

---

## 🔗 SEO Metadata

```tsx
// app/artisans/page.tsx
export const metadata = {
  title: 'Discover Artisans | Artistry Cart',
  description: 'Explore 5,000+ verified artisans from 120+ countries. Find master craftspeople in ceramics, jewelry, textiles, woodworking, and more. Connect with the hands behind the art.',
  openGraph: {
    title: 'Meet the Artisans | Artistry Cart',
    description: 'Discover extraordinary makers from around the world',
    images: ['/images/og-artisans.jpg'],
  },
  keywords: [
    'artisans',
    'handmade',
    'craftspeople',
    'ceramics',
    'jewelry makers',
    'woodworkers',
    'textile artists',
    'custom commissions'
  ],
};
```

---

## 🔌 API Endpoints Required

```typescript
// Artisan listing & search
GET /api/artisans
  ?page=1
  &limit=24
  &category=ceramics
  &location=portugal
  &rating=4.5
  &sort=featured
  &search=maria

// Featured artisans
GET /api/artisans/featured

// Artisan by ID
GET /api/artisans/:id

// Artisan products
GET /api/artisans/:id/products

// Artisan reviews
GET /api/artisans/:id/reviews

// Categories with counts
GET /api/artisans/categories

// Locations with counts
GET /api/artisans/locations
```

---

## ✅ Success Criteria

- [ ] Page loads under 3 seconds with 24 artisans
- [ ] Infinite scroll works smoothly
- [ ] Filters update URL and results in real-time (nuqs)
- [ ] All animations smooth (60fps)
- [ ] Search returns results within 300ms
- [ ] Fully responsive on all devices
- [ ] Dark mode compatible
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] SEO optimized with proper meta tags
- [ ] Consistent with landing page aesthetic
- [ ] Clear path to individual artisan profiles

---

## 🔗 Related Pages

### Individual Artisan Profile (`/artisans/[id]`)
*Detailed in separate blueprint: `ARTISAN_PROFILE_BLUEPRINT.md`*

Key sections for profile page:
1. Profile Hero (cover image, avatar, quick stats)
2. Bio & Story
3. Portfolio Gallery
4. Products Grid
5. Customer Reviews
6. Commission Request Form
7. Similar Artisans

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*Related: `LANDING_PAGE_BLUEPRINT.md`, `ABOUT_PAGE_BLUEPRINT.md`, `BRAND_IDENTITY.md`*
