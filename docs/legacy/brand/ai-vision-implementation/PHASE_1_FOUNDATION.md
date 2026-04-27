# AI Vision Studio - Phase 1: Foundation & Core UI Setup

> **Timeline:** Week 1 (5-7 days)  
> **Priority:** Critical Path  
> **Dependencies:** None

---

## 📋 Phase Overview

### Objectives
1. ✅ Set up page structure and routing
2. ✅ Implement design system (colors, typography, spacing)
3. ✅ Create reusable base components
4. ✅ Build hero section with live demo
5. ✅ Implement value proposition section
6. ✅ Set up GSAP animation system

### Success Criteria
- [ ] Page loads in < 2 seconds
- [ ] All base components render correctly
- [ ] Animations run smoothly at 60fps
- [ ] Responsive across all breakpoints
- [ ] Accessibility score > 90

---

## 🎨 Design System Implementation

### 1. CSS Variables Setup

**File:** `apps/user-ui/src/styles/ai-vision-theme.css`

```css
/* AI Vision Studio Theme Variables */
:root {
  /* Primary Colors */
  --av-obsidian: #0D0D0D;
  --av-onyx: #1A1A1A;
  --av-slate: #2A2A2A;
  --av-pearl: #F5F4F0;
  --av-silver: #B0B0B0;
  --av-ash: #6A6A6A;
  
  /* Accent Colors */
  --av-gold: #D4A84B;
  --av-gold-dark: #B8860B;
  --av-gold-light: #F0D97F;
  --av-bronze: #C49A6C;
  
  /* Background Colors */
  --av-ivory: #FAF9F7;
  --av-cream: #F5F4F0;
  --av-linen: #EDE9E3;
  
  /* Semantic Colors */
  --av-success: #10B981;
  --av-warning: #F59E0B;
  --av-error: #EF4444;
  --av-info: #3B82F6;
  
  /* Gradients */
  --av-gradient-gold: linear-gradient(135deg, #D4A84B 0%, #F0D97F 100%);
  --av-gradient-dark: linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 100%);
  --av-gradient-glow: radial-gradient(circle, rgba(212,168,75,0.4) 0%, rgba(212,168,75,0.1) 40%, transparent 70%);
  
  /* Shadows */
  --av-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --av-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --av-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
  --av-shadow-gold: 0 8px 32px rgba(212, 168, 75, 0.3);
  
  /* Spacing Scale */
  --av-space-xs: 0.25rem;   /* 4px */
  --av-space-sm: 0.5rem;    /* 8px */
  --av-space-md: 1rem;      /* 16px */
  --av-space-lg: 1.5rem;    /* 24px */
  --av-space-xl: 2rem;      /* 32px */
  --av-space-2xl: 3rem;     /* 48px */
  --av-space-3xl: 4rem;     /* 64px */
  --av-space-4xl: 6rem;     /* 96px */
  
  /* Border Radius */
  --av-radius-sm: 0.25rem;  /* 4px */
  --av-radius-md: 0.5rem;   /* 8px */
  --av-radius-lg: 1rem;     /* 16px */
  --av-radius-full: 9999px;
  
  /* Transitions */
  --av-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --av-transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --av-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Z-Index Scale */
  --av-z-base: 1;
  --av-z-dropdown: 1000;
  --av-z-sticky: 1100;
  --av-z-modal: 1200;
  --av-z-popover: 1300;
  --av-z-tooltip: 1400;
}

/* Dark Mode Overrides */
[data-theme="dark"] {
  --av-ivory: #1A1A1A;
  --av-cream: #2A2A2A;
  --av-linen: #3A3A3A;
  --av-pearl: #F5F4F0;
}
```

---

### 2. Typography System

**File:** `apps/user-ui/src/lib/fonts.ts`

```typescript
import { 
  Playfair_Display, 
  Cormorant_Garamond, 
  Inter, 
  Space_Mono 
} from 'next/font/google';

// Display Font - Headlines and Hero Text
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
});

// Heading Font - Subheadings and Section Titles
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
});

// Body Font - Body Text and UI Elements
export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Accent Font - Labels and Special Text
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
  preload: true,
  fallback: ['monospace'],
});

// Combined class names for root layout
export const fontVariables = `
  ${playfair.variable} 
  ${cormorant.variable} 
  ${inter.variable} 
  ${spaceMono.variable}
`.trim();
```

**Typography CSS Classes:**

```css
/* Typography Utilities */
.text-hero {
  font-family: var(--font-playfair);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-h1 {
  font-family: var(--font-playfair);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.text-h2 {
  font-family: var(--font-playfair);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 400;
  line-height: 1.3;
}

.text-h3 {
  font-family: var(--font-cormorant);
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 500;
  line-height: 1.4;
}

.text-body-lg {
  font-family: var(--font-inter);
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.7;
  letter-spacing: -0.01em;
}

.text-body {
  font-family: var(--font-inter);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}

.text-label {
  font-family: var(--font-space-mono);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
```

---

## 🧩 Base Component Library

### Component 1: PremiumButton

**File:** `apps/user-ui/src/components/ai-vision/ui/PremiumButton.tsx`

```typescript
'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      glow = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const buttonRef = ref || React.useRef<HTMLButtonElement>(null);

    // GSAP Hover Animation
    useGSAP(() => {
      const button = buttonRef.current;
      if (!button) return;

      const handleMouseEnter = () => {
        gsap.to(button, {
          y: -2,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
        });

        if (glow) {
          gsap.to(button, {
            boxShadow: '0 8px 32px rgba(212, 168, 75, 0.5)',
            duration: 0.3,
          });
        }
      };

      const handleMouseLeave = () => {
        gsap.to(button, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });

        if (glow) {
          gsap.to(button, {
            boxShadow: '0 8px 32px rgba(212, 168, 75, 0.3)',
            duration: 0.3,
          });
        }
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mousele', handleMouseLeave);
      };
    }, { scope: buttonRef });

    const variants = {
      primary: 'bg-[var(--av-gold)] text-[var(--av-obsidian)] hover:bg-[var(--av-gold-dark)]',
      secondary: 'bg-transparent border-2 border-[var(--av-gold)] text-[var(--av-gold)] hover:bg-[var(--av-gold)]/10',
      ghost: 'bg-transparent text-[var(--av-pearl)] hover:bg-white/10',
      premium: 'bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-light)] text-[var(--av-obsidian)]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={buttonRef}
        className={cn(
          'inline-flex items-center justify-center gap-3',
          'font-semibold tracking-wide',
          'rounded-none', // Sharp edges for premium feel
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-[var(--av-gold)] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          glow && 'shadow-[var(--av-shadow-gold)]',
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
```

---

### Component 2: SectionContainer

**File:** `apps/user-ui/src/components/ai-vision/ui/SectionContainer.tsx`

```typescript
'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  variant?: 'dark' | 'light' | 'gradient';
  animate?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  (
    {
      variant = 'light',
      animate = true,
      maxWidth = 'xl',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(
      () => {
        if (!animate || !contentRef.current) return;

        gsap.fromTo(
          contentRef.current,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      },
      { scope: sectionRef }
    );

    const variants = {
      dark: 'bg-[var(--av-obsidian)] text-[var(--av-pearl)]',
      light: 'bg-[var(--av-ivory)] text-[var(--av-obsidian)]',
      gradient: 'bg-gradient-to-br from-[var(--av-obsidian)] via-[var(--av-onyx)] to-[var(--av-obsidian)] text-[var(--av-pearl)]',
    };

    const maxWidths = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <section
        ref={sectionRef}
        className={cn(
          'relative py-16 md:py-24 lg:py-32 px-6 md:px-8',
          'overflow-hidden',
          variants[variant],
          className
        )}
        {...props}
      >
        <div
          ref={contentRef}
          className={cn('mx-auto w-full', maxWidths[maxWidth])}
        >
          {children}
        </div>
      </section>
    );
  }
);

SectionContainer.displayName = 'SectionContainer';
```

---

### Component 3: AnimatedBadge

**File:** `apps/user-ui/src/components/ai-vision/ui/AnimatedBadge.tsx`

```typescript
'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBadgeProps extends HTMLAttributes<HTMLDivElement> {
  pulse?: boolean;
  glow?: boolean;
}

export function AnimatedBadge({
  pulse = true,
  glow = true,
  className,
  children,
  ...props
}: AnimatedBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 px-5 py-2.5 rounded-full',
        'bg-[var(--av-gold)]/10 border border-[var(--av-gold)]/30',
        'backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {pulse && (
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--av-gold)]" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--av-gold)] animate-ping" />
        </div>
      )}
      <span className="text-xs tracking-[0.2em] uppercase text-[var(--av-gold)] font-semibold">
        {children}
      </span>
    </div>
  );
}
```

---

## 🎬 GSAP Animation System

### Global Animation Setup

**File:** `apps/user-ui/src/lib/gsap-config.ts`

```typescript
'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Animation Presets
export const animationPresets = {
  // Fade In from Bottom
  fadeInUp: {
    from: { opacity: 0, y: 60 },
    to: (trigger: HTMLElement) => ({
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }),
  },

  // Fade In from Left
  fadeInLeft: {
    from: { opacity: 0, x: -60 },
    to: (trigger: HTMLElement) => ({
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger,
        start: 'top 70%',
      },
    }),
  },

  // Fade In from Right
  fadeInRight: {
    from: { opacity: 0, x: 60 },
    to: (trigger: HTMLElement) => ({
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger,
        start: 'top 70%',
      },
    }),
  },

  // Scale In
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: (trigger: HTMLElement) => ({
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger,
        start: 'top 80%',
      },
    }),
  },

  // Stagger Children
  staggerChildren: (
    container: HTMLElement,
    childSelector: string,
    delay = 0.1
  ) => {
    const children = container.querySelectorAll(childSelector);
    
    gsap.fromTo(
      children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: delay,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        },
      }
    );
  },
};

// Utility Hooks
export function useScrollReveal(ref: React.RefObject<HTMLElement>) {
  useGSAP(
    () => {
      if (!ref.current) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: ref }
  );
}
```

---

## 🏗️ Section 1: Hero with Live Demo

### Component Structure

```
AIVisionHero/
├── AIVisionHero.tsx (Main container)
├── HeroContent.tsx (Left side - text)
├── HeroDemo.tsx (Right side - interactive demo)
└── ScrollIndicator.tsx (Bottom scroll hint)
```

### Main Hero Component

**File:** `apps/user-ui/src/components/ai-vision/sections/AIVisionHero.tsx`

```typescript
'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedBadge } from '../ui/AnimatedBadge';
import { PremiumButton } from '../ui/PremiumButton';
import { HeroDemo } from './HeroDemo';
import { ScrollIndicator } from './ScrollIndicator';
import { ArrowRight } from 'lucide-react';

export function AIVisionHero() {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate content from left
      tl.fromTo(
        contentRef.current,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 1 },
        0
      );

      // Animate demo from right with delay
      tl.fromTo(
        demoRef.current,
        { opacity: 0, x: 60, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1 },
        0.2
      );

      // Animate stats with count-up effect
      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.6
      );

      // Count-up animation for stats
      const statNumbers = statsRef.current?.querySelectorAll('[data-count]');
      statNumbers?.forEach((stat) => {
        const target = parseInt(stat.getAttribute('data-count') || '0');
        gsap.to(stat, {
          textContent: target,
          duration: 2,
          ease: 'power1.out',
          snap: { textContent: 1 },
          delay: 0.8,
        });
      });
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center bg-gradient-to-br from-[var(--av-obsidian)] via-[var(--av-onyx)] to-[var(--av-obsidian)] overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Glow */}
        <div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(212,168,75,0.4) 0%, rgba(212,168,75,0.1) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div ref={contentRef}>
            <AnimatedBadge className="mb-8">AI-Powered Custom Creation</AnimatedBadge>

            <h1 className="text-hero text-[var(--av-pearl)] mb-6">
              Imagine It. <br />
              We'll Help <br />
              <span className="text-[var(--av-gold)]">Create It.</span>
            </h1>

            <p className="text-body-lg text-[var(--av-silver)] mb-10 max-w-xl">
              Describe your vision in words. See it visualized by AI. Connect
              with artisans who bring it to life.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <PremiumButton
                variant="primary"
                size="lg"
                glow
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Explore Collection
              </PremiumButton>

              <PremiumButton variant="secondary" size="lg">
                Create Your Vision
              </PremiumButton>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="flex flex-wrap gap-8 text-[var(--av-silver)]"
            >
              <div>
                <div className="text-2xl font-bold text-[var(--av-gold)]">
                  <span data-count="10000">0</span>+
                </div>
                <div className="text-sm">Concepts Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--av-gold)]">
                  <span data-count="2500">0</span>+
                </div>
                <div className="text-sm">Realized Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--av-gold)]">
                  <span data-count="500">0</span>+
                </div>
                <div className="text-sm">Artisans Ready</div>
              </div>
            </div>
          </div>

          {/* Right Demo */}
          <div ref={demoRef}>
            <HeroDemo />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator />
    </section>
  );
}
```

---

### Hero Demo Component

**File:** `apps/user-ui/src/components/ai-vision/sections/HeroDemo.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../ui/PremiumButton';
import { Sparkles } from 'lucide-react';

const examplePrompts = [
  'A handcrafted ceramic vase with organic curves...',
  'A minimalist wooden coffee table with live edge...',
  'Custom silver pendant with moonstone centerpiece...',
];

export function HeroDemo() {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const demoRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Rotate example prompts
      const interval = setInterval(() => {
        setCurrentPrompt((prev) => (prev + 1) % examplePrompts.length);
      }, 3000);

      return () => clearInterval(interval);
    },
    { scope: demoRef }
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);

      // Animate results
      if (resultsRef.current) {
        gsap.fromTo(
          resultsRef.current.children,
          { opacity: 0, scale: 0.8, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.4)',
          }
        );
      }
    }, 2000);
  };

  return (
    <div
      ref={demoRef}
      className="bg-[var(--av-slate)] rounded-lg p-8 border border-[var(--av-gold)]/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-[var(--av-gold)]" size={24} />
        <h3 className="text-xl font-semibold text-[var(--av-pearl)]">
          Try a Quick Example
        </h3>
      </div>

      <div className="mb-6">
        <textarea
          className="w-full bg-[var(--av-onyx)] text-[var(--av-pearl)] rounded-md p-4 border border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] focus:ring-2 focus:ring-[var(--av-gold)]/20 outline-none transition-all resize-none"
          rows={4}
          placeholder="Describe what you imagine..."
          value={examplePrompts[currentPrompt]}
          readOnly
        />
        <div className="text-xs text-[var(--av-silver)] mt-2">
          💡 Example auto-updates every 3 seconds
        </div>
      </div>

      <PremiumButton
        variant="primary"
        size="md"
        className="w-full"
        glow
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="animate-spin">⚡</span>
            Generating...
          </>
        ) : (
          'Generate Preview'
        )}
      </PremiumButton>

      {/* Results Preview */}
      {showResults && (
        <div ref={resultsRef} className="grid grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square bg-[var(--av-onyx)] rounded-md border border-[var(--av-gold)]/30 flex items-center justify-center"
            >
              <div className="text-4xl">🎨</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Week 1 - Days 1-2: Setup
- [ ] Create page route: `app/ai-vision/page.tsx`
- [ ] Install GSAP: `pnpm add gsap @gsap/react`
- [ ] Set up font imports in `lib/fonts.ts`
- [ ] Create theme CSS file with variables
- [ ] Configure Tailwind to use custom CSS variables

### Week 1 - Days 3-4: Base Components
- [ ] Build `PremiumButton` component with GSAP hover
- [ ] Build `SectionContainer` with scroll animations
- [ ] Build `AnimatedBadge` component
- [ ] Create GSAP config and utility hooks
- [ ] Test all components in isolation

### Week 1 - Days 5-7: Hero Section
- [ ] Build `AIVisionHero` main component
- [ ] Implement `HeroContent` with text animations
- [ ] Build `HeroDemo` interactive preview
- [ ] Add `ScrollIndicator` component
- [ ] Implement count-up stats animation
- [ ] Test responsive behavior
- [ ] Performance optimization (60fps check)

---

## 🧪 Testing Requirements

### Visual Testing
- [ ] Hero animations run smoothly at 60fps
- [ ] Text is readable at all viewport sizes
- [ ] Colors match design tokens exactly
- [ ] Hover states work on all interactive elements

### Functional Testing
- [ ] Hero demo cycles through examples correctly
- [ ] Generate button shows loading state
- [ ] Results animate in properly
- [ ] Scroll indicator appears/disappears correctly

### Accessibility Testing
- [ ] Keyboard navigation works for all buttons
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announces content properly

### Performance Testing
- [ ] Page loads in < 2 seconds
- [ ] LCP < 2.5s
- [ ] No layout shift (CLS = 0)
- [ ] Animations maintain 60fps

---

## 📦 Deliverables

1. ✅ Complete design system with CSS variables
2. ✅ Typography system with Google Fonts
3. ✅ 3 reusable base components
4. ✅ GSAP animation system and utilities
5. ✅ Hero section with interactive demo
6. ✅ Value proposition section (next phase prep)

---

**Next Phase:** [Phase 2 - AI Generator (3 Modes)](./PHASE_2_AI_GENERATOR.md)
