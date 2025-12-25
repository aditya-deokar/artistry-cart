# AI Vision Studio - Phase 3: Visual Search Showcase & Gallery

> **Timeline:** Week 3-4 (7-9 days)  
> **Priority:** High  
> **Dependencies:** Phase 1, Phase 2 Complete

---

## 📋 Phase Overview

### Objectives
1. ✅ Build Visual Search Showcase section
2. ✅ Implement Concept Gallery with masonry layout
3. ✅ Create Before/After success stories with sliders
4. ✅ Add gallery filters and sorting
5. ✅ Build lightbox modal for full concept views
6. ✅ Implement infinite scroll

### Success Criteria
- [ ] Visual search demo is interactive and engaging
- [ ] Gallery loads 50+ concepts with smooth scrolling
- [ ] Before/After sliders work on touch devices
- [ ] Filters update gallery without full page reload
- [ ] Lightbox opens/closes with keyboard support
- [ ] Infinite scroll loads more content seamlessly

---

## 🎨 Section 5: Visual Search Showcase

### Component Structure

```
VisualSearchShowcase/
├── VisualSearchShowcase.tsx (Main section)
├── ExampleUploads.tsx (Left side - example images)
├── ResultsPreview.tsx (Right side - instant results)
└── UseCaseExamples.tsx (Real story cards)
```

### Main Showcase Component

**File:** `apps/user-ui/src/components/ai-vision/sections/VisualSearchShowcase.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { ExampleUploads } from './ExampleUploads';
import { ResultsPreview } from './ResultsPreview';
import { UseCaseExamples } from './UseCaseExamples';
import { Search } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function VisualSearchShowcase() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Parallax split screen effect
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const handleExampleSelect = (exampleId: string) => {
    setSelectedExample(exampleId);
    
    // Simulate search
    setTimeout(() => {
      setShowResults(true);
    }, 800);
  };

  return (
    <SectionContainer
      ref={sectionRef}
      variant="light"
      maxWidth="xl"
      className="bg-gradient-to-br from-[var(--av-ivory)] to-[var(--av-cream)]"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--av-gold)]/10 rounded-full mb-4">
          <Search className="text-[var(--av-gold)]" size={20} />
          <span className="text-sm font-semibold text-[var(--av-gold)] uppercase tracking-wide">
            Visual Search
          </span>
        </div>
        
        <h2 className="text-h1 text-[var(--av-obsidian)] mb-4">
          Found Something You Love Elsewhere?
        </h2>
        <p className="text-body-lg text-[var(--av-charcoal)] max-w-2xl mx-auto">
          Upload a photo. We'll find it in our catalog or help you create a
          custom version.
        </p>
      </div>

      {/* Split Screen Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left: Example Uploads */}
        <div ref={leftRef}>
          <ExampleUploads
            onSelect={handleExampleSelect}
            selectedExample={selectedExample}
          />
        </div>

        {/* Right: Results Preview */}
        <div ref={rightRef}>
          <ResultsPreview
            show={showResults}
            exampleId={selectedExample}
          />
        </div>
      </div>

      {/* Use Case Examples */}
      <UseCaseExamples />
    </SectionContainer>
  );
}
```

---

### Example Uploads Component

**File:** `apps/user-ui/src/components/ai-vision/sections/ExampleUploads.tsx`

```typescript
'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const examples = [
  { id: 'vase', label: 'Ceramic Vase', emoji: '🏺' },
  { id: 'ring', label: 'Silver Ring', emoji: '💍' },
  { id: 'table', label: 'Coffee Table', emoji: '🪑' },
  { id: 'art', label: 'Abstract Art', emoji: '🎨' },
];

interface ExampleUploadsProps {
  onSelect: (id: string) => void;
  selectedExample: string | null;
}

export function ExampleUploads({ onSelect, selectedExample }: ExampleUploadsProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;

      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'back.out(1.4)',
        }
      );
    },
    { scope: gridRef }
  );

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h3 className="text-xl font-semibold text-[var(--av-obsidian)] mb-6">
        Try These Examples:
      </h3>

      <div ref={gridRef} className="grid grid-cols-2 gap-4 mb-6">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => onSelect(example.id)}
            className={cn(
              'aspect-square rounded-xl border-2 transition-all duration-300',
              'flex flex-col items-center justify-center gap-2',
              'hover:scale-105 hover:shadow-md',
              selectedExample === example.id
                ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/5'
                : 'border-[var(--av-linen)] bg-[var(--av-ivory)]'
            )}
          >
            <span className="text-4xl">{example.emoji}</span>
            <span className="text-sm font-medium text-[var(--av-charcoal)]">
              {example.label}
            </span>
          </button>
        ))}
      </div>

      {/* Upload Your Own */}
      <div className="border-2 border-dashed border-[var(--av-linen)] rounded-xl p-6 text-center hover:border-[var(--av-gold)]/50 transition-colors cursor-pointer">
        <Upload className="mx-auto mb-3 text-[var(--av-charcoal)]" size={32} />
        <p className="text-sm font-medium text-[var(--av-charcoal)] mb-1">
          Or upload your own
        </p>
        <p className="text-xs text-[var(--av-ash)]">
          Click to browse files
        </p>
      </div>
    </div>
  );
}
```

---

## 🖼️ Section 6: Concept Gallery

### Gallery Component with Masonry Layout

**File:** `apps/user-ui/src/components/ai-vision/sections/ConceptGallery.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { GalleryFilters } from './GalleryFilters';
import { GalleryItem } from './GalleryItem';
import { ConceptLightbox } from './ConceptLightbox';

gsap.registerPlugin(ScrollTrigger);

interface Concept {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  author: string;
  likes: number;
  views: number;
  status: 'realized' | 'in-progress' | 'awaiting';
  prompt?: string;
}

// Mock data
const mockConcepts: Concept[] = [
  {
    id: '1',
    imageUrl: '/concepts/vase-1.jpg',
    category: 'Home Decor',
    title: 'Minimalist Terrarium',
    author: '@green_thumb',
    likes: 234,
    views: 1200,
    status: 'realized',
    prompt: 'Glass terrarium with geometric brass frame...',
  },
  // ... more concepts
];

type FilterCategory = 'all' | 'art' | 'jewelry' | 'home-decor' | 'furniture';
type FilterStatus = 'all' | 'realized' | 'in-progress' | 'awaiting';

export function ConceptGallery() {
  const [concepts, setConcepts] = useState<Concept[]>(mockConcepts);
  const [filteredConcepts, setFilteredConcepts] = useState<Concept[]>(concepts);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [lightboxConcept, setLightboxConcept] = useState<Concept | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const galleryRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Filter concepts
  useEffect(() => {
    let filtered = [...concepts];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (c) => c.category.toLowerCase() === selectedCategory
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === selectedStatus);
    }

    setFilteredConcepts(filtered);
  }, [selectedCategory, selectedStatus, concepts]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  const loadMore = () => {
    // Simulate loading more concepts
    setTimeout(() => {
      const newConcepts = mockConcepts.map((c) => ({
        ...c,
        id: `${c.id}-${page}`,
      }));
      
      setConcepts((prev) => [...prev, ...newConcepts]);
      setPage((p) => p + 1);

      if (page >= 3) {
        setHasMore(false);
      }
    }, 500);
  };

  // Animate new items
  useGSAP(
    () => {
      if (!gridRef.current) return;

      const newItems = gridRef.current.querySelectorAll('[data-new="true"]');
      
      gsap.fromTo(
        newItems,
        { opacity: 0, scale: 0.8, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'back.out(1.2)',
          onComplete: () => {
            newItems.forEach((item) => item.removeAttribute('data-new'));
          },
        }
      );
    },
    { dependencies: [filteredConcepts], scope: gridRef }
  );

  return (
    <SectionContainer
      ref={galleryRef}
      variant="light"
      maxWidth="xl"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-h1 text-[var(--av-obsidian)] mb-4">
          Concept Gallery
        </h2>
        <p className="text-body-lg text-[var(--av-charcoal)] max-w-2xl mx-auto">
          Browse thousands of AI-generated concepts and see what's possible
        </p>
      </div>

      {/* Filters */}
      <GalleryFilters
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
      />

      {/* Masonry Grid */}
      <div
        ref={gridRef}
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
      >
        {filteredConcepts.map((concept) => (
          <GalleryItem
            key={concept.id}
            concept={concept}
            onClick={() => setLightboxConcept(concept)}
          />
        ))}
      </div>

      {/* Loading Sentinel for Infinite Scroll */}
      <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-12">
        {hasMore && (
          <div className="animate-pulse text-[var(--av-charcoal)]">
            Loading more...
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxConcept && (
        <ConceptLightbox
          concept={lightboxConcept}
          onClose={() => setLightboxConcept(null)}
        />
      )}
    </SectionContainer>
  );
}
```

---

### Gallery Item Component

**File:** `apps/user-ui/src/components/ai-vision/sections/GalleryItem.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Eye, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Concept {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  author: string;
  likes: number;
  views: number;
  status: 'realized' | 'in-progress' | 'awaiting';
  prompt?: string;
}

interface GalleryItemProps {
  concept: Concept;
  onClick: () => void;
}

export function GalleryItem({ concept, onClick }: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!overlayRef.current) return;

      if (isHovered) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    },
    { dependencies: [isHovered], scope: cardRef }
  );

  const statusConfig = {
    realized: { icon: Check, label: 'Realized', color: 'text-[var(--av-success)]' },
    'in-progress': { icon: null, label: 'In Progress', color: 'text-[var(--av-warning)]' },
    awaiting: { icon: null, label: 'Awaiting', color: 'text-[var(--av-info)]' },
  };

  const status = statusConfig[concept.status];

  return (
    <div
      ref={cardRef}
      className="relative break-inside-avoid mb-6 group cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-new="true"
    >
      <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-[var(--av-linen)]">
          {/* Placeholder - would be actual image */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🎨
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md',
              'bg-white/90',
              status.color
            )}>
              {status.label}
            </div>
          </div>

          {/* Hover Overlay */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 flex items-end p-4"
          >
            <button className="w-full py-2 px-4 bg-[var(--av-gold)] text-[var(--av-obsidian)] rounded-lg font-semibold hover:bg-[var(--av-gold-dark)] transition-colors">
              View Prompt
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="text-xs text-[var(--av-gold)] font-semibold mb-1">
            {concept.category}
          </div>
          <h4 className="font-semibold text-[var(--av-obsidian)] mb-1">
            {concept.title}
          </h4>
          <p className="text-sm text-[var(--av-charcoal)] mb-3">
            by {concept.author}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-[var(--av-ash)]">
            <span className="flex items-center gap-1">
              <Heart size={14} /> {concept.likes}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} /> {concept.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Section 7: Before/After Success Stories

**File:** `apps/user-ui/src/components/ai-vision/sections/SuccessStories.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ChevronLeft, ChevronRight, DollarSign, Clock, User } from 'lucide-react';

interface Story {
  id: string;
 customer: string;
  location: string;
  quote: string;
  aiConceptImage: string;
  finalProductImage: string;
  projectValue: number;
  timeline: string;
  artisan: string;
}

const stories: Story[] = [
  {
    id: '1',
    customer: 'Sarah M.',
    location: 'Seattle',
    quote: 'I described my dream coffee table and three weeks later, it was in my living room. Absolutely perfect!',
    aiConceptImage: '/stories/concept-table.jpg',
    finalProductImage: '/stories/final-table.jpg',
    projectValue: 850,
    timeline: '3 weeks',
    artisan: '@woodcraft_studios',
  },
  // ... more stories
];

export function SuccessStories() {
  const [currentStory, setCurrentStory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const nextStory = () => {
    gsap.to(storyRef.current, {
      opacity: 0,
      x: -50,
      duration: 0.3,
      onComplete: () => {
        setCurrentStory((prev) => (prev + 1) % stories.length);
        gsap.fromTo(
          storyRef.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  };

  const prevStory = () => {
    gsap.to(storyRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.3,
      onComplete: () => {
        setCurrentStory((prev) => (prev - 1 + stories.length) % stories.length);
        gsap.fromTo(
          storyRef.current,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  };

  const story = stories[currentStory];

  return (
    <SectionContainer variant="light" maxWidth="xl" ref={containerRef}>
      <div className="text-center mb-12">
        <h2 className="text-h1 text-[var(--av-obsidian)] mb-4">
          From Imagination to Reality
        </h2>
        <p className="text-body-lg text-[var(--av-charcoal)]">
          Real stories of AI concepts brought to life by skilled artisans
        </p>
      </div>

      <div ref={storyRef} className="max-w-5xl mx-auto">
        {/* Before/After Slider */}
        <BeforeAfterSlider
          beforeImage={story.aiConceptImage}
          afterImage={story.finalProductImage}
          beforeLabel="AI Concept"
          afterLabel="Final Product"
        />

        {/* Story Details */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
          {/* Quote */}
          <blockquote className="text-xl font-serif text-[var(--av-charcoal)] mb-6 italic">
            "{story.quote}"
          </blockquote>

          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Customer */}
            <div>
              <p className="font-semibold text-[var(--av-obsidian)]">
                — {story.customer}, {story.location}
              </p>
            </div>

            {/* Project Info */}
            <div className="flex gap-6 text-sm text-[var(--av-charcoal)]">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-[var(--av-gold)]" />
                <span>Project Value: ${story.projectValue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--av-gold)]" />
                <span>Timeline: {story.timeline}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-[var(--av-gold)]" />
                <span>Artisan: {story.artisan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prevStory}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="Previous story"
          >
            <ChevronLeft className="text-[var(--av-charcoal)]" />
          </button>

          <div className="flex gap-2">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStory(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentStory
                    ? 'w-8 bg-[var(--av-gold)]'
                    : 'bg-[var(--av-linen)]'
                )}
                aria-label={`Go to story ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextStory}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            aria-label="Next story"
          >
            <ChevronRight className="text-[var(--av-charcoal)]" />
          </button>
        </div>
      </div>
    </SectionContainer>
  );
}
```

---

## 📋 Implementation Checklist

### Week 3 - Days 1-3: Visual Search Showcase
- [ ] Build main VisualSearchShowcase component
- [ ] Implement ExampleUploads with grid layout
- [ ] Create ResultsPreview with animations
- [ ] Add UseCaseExamples cards
- [ ] Implement split-screen animations
- [ ] Test on mobile devices

### Week 3 - Days 4-6: Concept Gallery
- [ ] Set up masonry grid layout
- [ ] Implement GalleryFilters component
- [ ] Build GalleryItem cards
- [ ] Add infinite scroll functionality
- [ ] Create ConceptLightbox modal
- [ ] Test with 100+ concepts

### Week 4 - Days 7-9: Success Stories
- [ ] Build BeforeAfterSlider component
- [ ] Implement story carousel
- [ ] Add navigation controls
- [ ] Create auto-play functionality
- [ ] Add touch gestures for mobile
- [ ] Performance optimization

---

## 🧪 Testing Requirements

### Visual Testing
- [ ] Masonry grid doesn't break with different image sizes
- [ ] Before/After slider works on touch devices
- [ ] Lightbox opens/closes smoothly
- [ ] Filters update gallery without flicker

### Performance Testing
- [ ] Gallery loads 50 items < 2s
- [ ] Infinite scroll doesn't cause jank
- [ ] Image lazy loading works properly
- [ ] Animations maintain 60fps

### Accessibility Testing
- [ ] Keyboard navigation in gallery
- [ ] Focus trapping in lightbox
- [ ] Screen reader announces filter changes
- [ ] Touch targets are 44px minimum

---

**Next Phase:** [Phase 4 - Artisan Matching & Collaboration](./PHASE_4_ARTISAN_COLLABORATION.md)
