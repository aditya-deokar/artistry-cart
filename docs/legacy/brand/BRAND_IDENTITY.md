# Brand Identity Guidelines

## Brand Essence

| Element | Definition |
|---------|------------|
| **Name** | Artistry Cart |
| **Tagline** | *"Where Imagination Meets Craftsmanship"* |
| **Mission** | Democratize access to custom, handcrafted art by connecting creative visionaries with skilled artisans |
| **Vision** | Become the world's premier platform where every unique idea can become a tangible masterpiece |
| **Core Values** | Authenticity • Craftsmanship • Innovation • Community • Sustainability |

---

## Visual Identity

### Color Palette

#### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Deep Burgundy** | `#722F37` | Primary brand color, CTAs, headers |
| **Warm Gold** | `#C9A227` | Accents, highlights, premium badges |
| **Ivory** | `#FFFFF0` | Backgrounds, cards, light mode base |

#### Secondary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Charcoal** | `#36454F` | Text, dark mode backgrounds |
| **Sage Green** | `#9CAF88` | Success states, eco-friendly badges |
| **Terracotta** | `#E2725B` | Warm accents, artist highlights |

#### Neutral Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Pure White** | `#FFFFFF` | Cards, modals |
| **Light Gray** | `#F5F5F5` | Section backgrounds |
| **Medium Gray** | `#9CA3AF` | Secondary text, borders |
| **Dark Gray** | `#374151` | Body text |
| **Near Black** | `#1F2937` | Primary text, dark mode |

### CSS Variables

```css
:root {
  /* Primary */
  --color-burgundy: #722F37;
  --color-gold: #C9A227;
  --color-ivory: #FFFFF0;
  
  /* Secondary */
  --color-charcoal: #36454F;
  --color-sage: #9CAF88;
  --color-terracotta: #E2725B;
  
  /* Neutrals */
  --color-white: #FFFFFF;
  --color-gray-100: #F5F5F5;
  --color-gray-400: #9CA3AF;
  --color-gray-700: #374151;
  --color-gray-900: #1F2937;
  
  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

---

## Typography

### Font Families

| Type | Font | Fallback | Usage |
|------|------|----------|-------|
| **Display** | Playfair Display | Georgia, serif | Headlines, hero text, luxury feel |
| **Body** | Inter | system-ui, sans-serif | Body text, UI elements |
| **Accent** | Cormorant Garamond | Georgia, serif | Quotes, artist names, special text |

### Font Sizes (Tailwind Scale)

```css
/* Headlines */
--text-hero: 4.5rem;      /* 72px - Hero sections */
--text-h1: 3rem;          /* 48px - Page titles */
--text-h2: 2.25rem;       /* 36px - Section titles */
--text-h3: 1.5rem;        /* 24px - Card titles */
--text-h4: 1.25rem;       /* 20px - Subsections */

/* Body */
--text-lg: 1.125rem;      /* 18px - Lead paragraphs */
--text-base: 1rem;        /* 16px - Body text */
--text-sm: 0.875rem;      /* 14px - Secondary text */
--text-xs: 0.75rem;       /* 12px - Labels, captions */
```

### Typography CSS

```css
.font-display {
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: -0.02em;
}

.font-body {
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: -0.01em;
}

.font-accent {
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.02em;
}
```

---

## Brand Voice

### Tone Guidelines

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Elegant** | Sophisticated but approachable | "Discover extraordinary pieces" not "Check out cool stuff" |
| **Warm** | Personal and inviting | "Welcome to your creative journey" |
| **Inspiring** | Celebrates creativity | "Every masterpiece begins with a vision" |
| **Trustworthy** | Clear and honest | "Secure payments. Protected purchases." |

### Writing Style

- **Headlines**: Short, evocative, action-oriented
- **Body**: Conversational, clear, benefit-focused
- **CTAs**: Active verbs, urgency without pressure
- **Error Messages**: Helpful, never blaming

### Example Copy

```
❌ "Error: Invalid input"
✅ "Hmm, that doesn't look quite right. Let's try again."

❌ "Buy Now"
✅ "Bring This Home"

❌ "Sign up for our newsletter"
✅ "Join Our Creative Circle"
```

---

## Logo Usage

### Logo Variations

1. **Full Logo** - "Artistry Cart" with icon (horizontal)
2. **Stacked Logo** - Icon above wordmark (vertical)
3. **Icon Only** - Cart/brush mark for favicon, app icon
4. **Wordmark Only** - Text for constrained spaces

### Clear Space

- Minimum clear space: Height of the "A" in Artistry
- Never place on busy backgrounds without container
- Always use approved color combinations

### Minimum Sizes

| Format | Minimum Width |
|--------|---------------|
| **Full Logo (print)** | 1.5 inches |
| **Full Logo (digital)** | 120px |
| **Icon Only** | 32px |

---

## Iconography

### Style Guidelines

- **Stroke Weight**: 1.5px
- **Corner Radius**: Rounded, soft edges
- **Style**: Line icons with minimal fills
- **Animation**: Subtle entrance animations on hover

### Icon Library

Recommended: [Lucide Icons](https://lucide.dev/) - Clean, consistent, open-source

Key icons to customize:
- Shopping cart with artistic flourish
- Brush stroke accent
- Handmade/artisan badge

---

## Photography & Imagery

### Style

- **Hero Images**: Full-bleed, aspirational, lifestyle context
- **Product Photography**: Clean white/neutral backgrounds, soft shadows
- **Artist Portraits**: Natural, candid, in-studio shots
- **Process Shots**: Behind-the-scenes crafting moments

### Treatment

- Slightly desaturated, warm tones
- High contrast for drama
- Shallow depth of field for focus
- Natural lighting preferred

### Avoid

- ❌ Overly bright, stock photo feel
- ❌ Cluttered, busy compositions
- ❌ Cold, sterile lighting
- ❌ Heavily filtered or artificial looks

---

## Motion & Animation

### Principles

1. **Purposeful** - Every animation serves a function
2. **Subtle** - Enhance, don't distract
3. **Fast** - Snappy, never sluggish (200-400ms)
4. **Natural** - Ease curves that feel organic

### Timing

```css
/* Animation durations */
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;

/* Easing curves */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Common Animations

| Element | Animation |
|---------|-----------|
| **Buttons** | Scale down 2% on press, spring back |
| **Cards** | Lift with shadow on hover |
| **Modals** | Fade + scale from 95% |
| **Page Transitions** | Fade with slight y-offset |
| **Loaders** | Smooth, branded spinner |

---

## UI Components

### Button Styles

```
Primary:    Burgundy bg, white text, gold hover
Secondary:  Transparent, burgundy border, burgundy text
Ghost:      No border, subtle hover background
Premium:    Gold gradient, dark text
```

### Card Styles

- Subtle shadow, rounded corners (8-12px)
- White/ivory background
- Hover lift effect with increased shadow
- Premium cards: gold border accent

### Form Elements

- Rounded inputs (8px radius)
- Focus state: burgundy ring
- Error state: red with helpful message
- Success state: sage green check

---

*These guidelines ensure consistent visual identity across all Artistry Cart touchpoints.*
