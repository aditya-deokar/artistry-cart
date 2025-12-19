# Artistry Cart - Landing Page Blueprint

> *Minimal. Premium. Luxurious.*

This document outlines the complete redesign of the Artistry Cart landing page, inspired by world-class luxury brands like **Apple**, **Aesop**, **Diptyque**, **Cartier**, and **LE LABO**.

---

## Design Philosophy

### Inspiration Sources

| Brand | Key Takeaways |
|-------|---------------|
| **Apple** | Product-centric design, vast white space, hero imagery that dominates |
| **Aesop** | Earthy muted tones, sophisticated simplicity, intellectual aesthetic |
| **Diptyque** | Black + white foundation with artful accents, editorial feel |
| **LE LABO** | Industrial minimalism, raw elegance, custom craftsmanship focus |
| **Cartier** | Refined luxury, delicate animations, premium typography |

### Core Principles

1. **Less is More** - Every element must earn its place
2. **Product as Hero** - Artisan creations are the stars
3. **Intentional White Space** - Let content breathe elegantly
4. **Refined Typography** - Beautiful typefaces communicate luxury
5. **Subtle Motion** - Animations enhance, never distract
6. **Gallery Experience** - Website feels like curated art exhibition

---

## New Color Theme

### Light Mode Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--ac-ivory` | Warm Ivory | `#FAF9F7` | Primary background |
| `--ac-cream` | Soft Cream | `#F5F4F0` | Secondary background, cards |
| `--ac-linen` | Warm Linen | `#EDE9E3` | Borders, dividers |
| `--ac-charcoal` | Deep Charcoal | `#1A1A1A` | Primary text |
| `--ac-graphite` | Soft Graphite | `#4A4A4A` | Secondary text |
| `--ac-stone` | Warm Stone | `#8A8883` | Muted text, captions |
| `--ac-gold` | Refined Gold | `#B8860B` | Accent, CTAs, premium elements |
| `--ac-copper` | Aged Copper | `#A67C52` | Secondary accent |
| `--ac-terracotta` | Earth Terracotta | `#C67D5A` | Warm highlights |

### Dark Mode Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--ac-obsidian` | Deep Obsidian | `#0D0D0D` | Primary background |
| `--ac-onyx` | Rich Onyx | `#1A1A1A` | Secondary background |
| `--ac-slate` | Dark Slate | `#2A2A2A` | Cards, elevated surfaces |
| `--ac-pearl` | Soft Pearl | `#F5F4F0` | Primary text |
| `--ac-silver` | Muted Silver | `#B0B0B0` | Secondary text |
| `--ac-ash` | Warm Ash | `#6A6A6A` | Muted text |
| `--ac-gold` | Refined Gold | `#D4A84B` | Accent (brighter for contrast) |
| `--ac-bronze` | Warm Bronze | `#C49A6C` | Secondary accent |

### Typography

| Type | Font | Weight | Usage |
|------|------|--------|-------|
| **Display** | Playfair Display | 400, 500 | Hero headlines, section titles |
| **Heading** | Cormorant Garamond | 400, 500, 600 | Subheadings, product names |
| **Body** | Inter | 300, 400, 500 | Body text, UI elements |
| **Accent** | Space Mono | 400 | Labels, badges, eyebrows |

---

## Landing Page Sections

### Section Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LANDING PAGE STRUCTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. NAVIGATION                                                        │   │
│  │    Minimal, transparent, reveals on scroll                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2. HERO                                                              │   │
│  │    Full-viewport, cinematic, single focus                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 3. BRAND MANIFESTO                                                   │   │
│  │    Scroll-reveal philosophy text                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4. FEATURED CATEGORIES                                               │   │
│  │    3 large category cards with hover effects                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 5. CURATED COLLECTION                                                │   │
│  │    Editorial product showcase                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 6. AI VISION STUDIO TEASER                                           │   │
│  │    Interactive feature showcase                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 7. ARTISAN SPOTLIGHT                                                 │   │
│  │    Featured artist story                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 8. TESTIMONIALS                                                      │   │
│  │    Minimal quote carousel                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 9. PHILOSOPHY                                                        │   │
│  │    Brand values and commitment                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 10. CTA                                                              │   │
│  │    Final call to action                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 11. FOOTER                                                           │   │
│  │    Premium minimal footer                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Section Details

### 1. Navigation

**File**: `landing/Navigation.tsx`

| Element | Content |
|---------|---------|
| **Logo** | "Artistry Cart" wordmark (Playfair Display) |
| **Links** | Collections, Artisans, AI Vision, About |
| **Actions** | Search icon, Account, Cart (with item count) |
| **Behavior** | Transparent → Solid on scroll, minimal height |

**Design Notes**:
- Floating navigation with subtle backdrop blur
- Logo centered or left-aligned
- Icons only, expand on hover
- Sticky with smooth reveal animation

---

### 2. Hero Section

**File**: `landing/Hero.tsx`

| Element | Content |
|---------|---------|
| **Eyebrow** | "Handcrafted Excellence" |
| **Headline** | "Where Imagination Meets Craftsmanship" |
| **Subheadline** | "Discover unique creations by master artisans, or bring your vision to life with AI-powered custom orders." |
| **Primary CTA** | "Explore Collection" → `/products` |
| **Secondary CTA** | "Create Your Vision" → `/ai-vision` |
| **Media** | Full-bleed hero image/video of artisan at work |

**Design Notes**:
- Full viewport height (100vh)
- Image/video fills 60-70% of screen
- Text overlay with gradient protection
- Subtle parallax on scroll
- Split-screen option: text left, image right

**Animations**:
- Text fades in with staggered delay
- Image reveals with smooth clip-path
- Scroll indicator at bottom

---

### 3. Brand Manifesto

**File**: `landing/Manifesto.tsx`

| Element | Content |
|---------|---------|
| **Quote** | "We believe every creation deserves to be unique. In a world of mass production, we celebrate the human touch—the imperfections that make art perfect, the stories woven into every piece." |
| **Signature** | "— The Artistry Cart Philosophy" |

**Design Notes**:
- Large, elegant serif typography
- Center-aligned, generous padding
- Words reveal as user scrolls (GSAP ScrollTrigger)
- Minimal—just text on an ivory background

**Animations**:
- Text reveals word-by-word or line-by-line
- Subtle opacity and y-translate

---

### 4. Featured Categories

**File**: `landing/FeaturedCategories.tsx`

| Category | Image | Description |
|----------|-------|-------------|
| **Art & Prints** | Curated wall art image | "Originals that speak to the soul" |
| **Jewelry** | Handcrafted jewelry detail | "Adornments made with intention" |
| **Home & Living** | Artisan home decor | "Pieces that transform spaces" |

**Design Notes**:
- 3-column grid on desktop, stack on mobile
- Large rectangular cards with image fill
- Text overlay at bottom with gradient
- Hover: subtle zoom on image, text slides up

**Animations**:
- Cards stagger in on scroll
- Hover: scale(1.02), shadow increase

---

### 5. Curated Collection

**File**: `landing/CuratedCollection.tsx`

| Element | Content |
|---------|---------|
| **Eyebrow** | "Editor's Picks" |
| **Headline** | "Curated for the Discerning" |
| **Products** | 4-6 featured products with minimal cards |
| **Link** | "View All" → `/products` |

**Design Notes**:
- Asymmetric masonry or horizontal scroll
- Product cards: image, artisan name, product name, price
- No ratings/reviews—keep it clean
- High-quality product photography

**Product Card Design**:
```
┌──────────────────────────┐
│                          │
│     [Product Image]      │
│                          │
│                          │
├──────────────────────────┤
│ ARTISAN NAME             │ (eyebrow, small caps)
│ Product Title            │ (serif, elegant)
│ $XXX                     │ (price)
└──────────────────────────┘
```

---

### 6. AI Vision Studio Teaser

**File**: `landing/AIVisionTeaser.tsx`

| Element | Content |
|---------|---------|
| **Badge** | "New Feature" |
| **Headline** | "Can't Find What You're Imagining?" |
| **Subheadline** | "Describe your vision and watch AI bring it to life. Share your concept with skilled artisans who can craft it into reality." |
| **CTA** | "Try AI Vision Studio" → `/ai-vision` |
| **Visual** | Interactive demo or animated illustration |

**Design Notes**:
- Split layout: text left, visual right
- Dark background section for contrast (obsidian/onyx)
- Glowing accents to convey innovation
- Subtle particle/brush stroke animations

**Interactive Element Options**:
1. Live demo: type prompt → shows generated image
2. Animated sequence showing the flow
3. Before/After slider with concept → product

---

### 7. Artisan Spotlight

**File**: `landing/ArtisanSpotlight.tsx`

| Element | Content |
|---------|---------|
| **Eyebrow** | "Meet the Maker" |
| **Artisan Name** | Featured artisan's name |
| **Bio** | 2-3 sentences about their craft |
| **Quote** | Personal quote from the artisan |
| **CTA** | "Visit Studio" → `/artisans/[id]` |
| **Image** | Portrait of artisan at work |
| **Products** | 2-3 of their featured products |

**Design Notes**:
- Large portrait image (full or half width)
- Story-driven layout
- Warm, personal feel within minimal design
- Products shown as small thumbnails

**Layout Options**:
1. Left: large image, Right: text + products
2. Full-width image with text overlay
3. Horizontal scroll with artisan stories

---

### 8. Testimonials

**File**: `landing/Testimonials.tsx`

| Testimonial | Content |
|-------------|---------|
| **Quote 1** | "The custom piece they created captures exactly what I envisioned. True artistry." |
| **Quote 2** | "Every item feels like it has a story. Quality you can feel." |
| **Quote 3** | "The AI Vision feature is magical—I described a dream piece and found an artisan who made it real." |

**Design Notes**:
- Simple carousel or static grid
- Large quote typography
- Small avatar + name + location
- Minimal navigation (dots or arrows)

**Format**:
```
"Quote text here that is impactful and genuine."

— Customer Name, Location
```

---

### 9. Philosophy / Values

**File**: `landing/Philosophy.tsx`

| Value | Title | Description |
|-------|-------|-------------|
| 🎨 | **Authentic Craft** | Every piece is made by human hands with intention |
| 🌿 | **Sustainable Beauty** | We celebrate materials and methods that honor the earth |
| 🤝 | **Fair Partnership** | Artisans receive the compensation they deserve |

**Design Notes**:
- 3-column layout with icons or illustrations
- Minimal text, impactful headlines
- Icons: line-drawn or artistic style
- Background could use subtle texture

---

### 10. Final CTA

**File**: `landing/FinalCTA.tsx`

| Element | Content |
|---------|---------|
| **Headline** | "Begin Your Journey" |
| **Subheadline** | "Join a community that celebrates creativity, craftsmanship, and connection." |
| **Primary CTA** | "Explore Collection" |
| **Secondary CTA** | "Create with AI Vision" |

**Design Notes**:
- Full-width section with background image or solid color
- Centered text
- Two buttons side by side
- Could include newsletter signup

---

### 11. Footer

**File**: `landing/Footer.tsx` or use existing

| Column | Links |
|--------|-------|
| **Shop** | All Products, New Arrivals, Categories, Gift Cards |
| **Artisans** | Become a Seller, Artisan Stories, Commission Work |
| **Support** | FAQ, Shipping, Returns, Contact |
| **Company** | About, Journal, Sustainability, Press |

**Bottom Row**:
- © 2024 Artistry Cart
- Social icons (minimal)
- Currency/Language selector

---

## Folder Structure

```
apps/user-ui/src/
├── app/
│   ├── page.tsx                    # New landing page (imports from landing/)
│   └── global.css                  # Updated with new theme
│
├── components/
│   ├── landing/                    # NEW: Landing page sections
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── Manifesto.tsx
│   │   ├── FeaturedCategories.tsx
│   │   ├── CuratedCollection.tsx
│   │   ├── AIVisionTeaser.tsx
│   │   ├── ArtisanSpotlight.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Philosophy.tsx
│   │   ├── FinalCTA.tsx
│   │   └── index.ts                # Barrel export
│   │
│   ├── sections/                   # PRESERVED: Old sections (not deleted)
│   │   ├── CallToAction.tsx
│   │   ├── Hero.tsx
│   │   ├── ProductFeature.tsx
│   │   ├── ProductList.tsx
│   │   └── ScrollText.tsx
│   │
│   └── ui/
│       └── premium/                # NEW: Premium UI components
│           ├── PremiumButton.tsx
│           ├── PremiumCard.tsx
│           ├── TextReveal.tsx
│           └── ParallaxImage.tsx
│
├── lib/
│   └── fonts.ts                    # Add Playfair Display, Cormorant Garamond
│
└── styles/
    └── variables.css               # Theme variables extracted
```

---

## Animation Guidelines

### Scroll Animations (GSAP ScrollTrigger)

| Animation | Elements | Trigger |
|-----------|----------|---------|
| **Fade Up** | Sections, cards, text blocks | On enter viewport |
| **Text Reveal** | Headlines, manifesto | As text enters view |
| **Parallax** | Hero image, backgrounds | Scroll progress |
| **Stagger** | Grid items, product cards | On enter, 0.1s delay |

### Hover Effects

| Element | Effect |
|---------|--------|
| **Buttons** | Background color transition, subtle lift |
| **Cards** | Scale 1.02, shadow increase, overlay shift |
| **Images** | Subtle zoom (scale 1.05) |
| **Links** | Underline expand from center |

### Transitions

| Property | Duration | Easing |
|----------|----------|--------|
| **Color** | 300ms | ease-out |
| **Transform** | 400ms | cubic-bezier(0.4, 0, 0.2, 1) |
| **Opacity** | 300ms | ease |

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Update `global.css` with new theme
- [ ] Add new fonts (Playfair Display, Cormorant Garamond)
- [ ] Create base UI components (`PremiumButton`, etc.)
- [ ] Set up landing folder structure

### Phase 2: Core Sections (Week 2)
- [ ] Build Hero section
- [ ] Build Manifesto section
- [ ] Build Featured Categories
- [ ] Build Curated Collection

### Phase 3: Unique Features (Week 3)
- [ ] Build AI Vision Teaser
- [ ] Build Artisan Spotlight
- [ ] Build Testimonials
- [ ] Build Philosophy section

### Phase 4: Polish (Week 4)
- [ ] Add all scroll animations
- [ ] Fine-tune responsive design
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## Technical Notes

### Font Loading

```typescript
// lib/fonts.ts
import { Playfair_Display, Cormorant_Garamond, Inter, Space_Mono } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400'],
  display: 'swap',
});
```

### Scroll Animation Helper

```typescript
// hooks/useScrollReveal.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    gsap.fromTo(ref.current, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          ...options,
        },
      }
    );
  }, []);
  
  return ref;
}
```

---

*Last Updated: December 19, 2024*
