# AI Vision Studio - Phase 2: AI Generator (3 Modes)

> **Timeline:** Week 2-3 (10-12 days)  
> **Priority:** Core Feature  
> **Dependencies:** Phase 1 Complete

---

## 📋 Phase Overview

### Objectives
1. ✅ Build mode switcher UI
2. ✅ Implement Text-to-Image generation (Mode 1)
3. ✅ Implement Database Product Variation (Mode 2) 
4. ✅ Implement Visual Product Search (Mode 3)
5. ✅ Create concept results display
6. ✅ Add refinement controls

### Success Criteria
- [ ] All 3 modes functional and switchable
- [ ] Image uploads work (Mode 3)
- [ ] Concept generation completes < 10s
- [ ] Results display with smooth animations
- [ ] Refinement controls update concepts
- [ ] Mobile-optimized for all modes

---

## 🎯 Component Architecture

```
AIGenerator/
├── AIGenerator.tsx (Main container with mode state)
├── ModeSelector.tsx (Tab switcher

)
├── Mode1_TextGeneration/
│   ├── PromptInput.tsx
│   ├── CategorySelector.tsx
│   └── RefinementControls.tsx
├── Mode2_ProductVariation/
│   ├── ProductSearch.tsx
│   ├── ProductSelector.tsx
│   └── ModificationInput.tsx
├── Mode3_VisualSearch/
│   ├── ImageUploader.tsx
│   ├── SearchResults.tsx
│   └── VisualFilters.tsx
├── ConceptResults/
│   ├── ConceptGrid.tsx
│   ├── ConceptCard.tsx
│   └── ConceptActions.tsx
└── LoadingState.tsx
```

---

## 🎨 Main AI Generator Container

**File:** `apps/user-ui/src/components/ai-vision/generator/AIGenerator.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SectionContainer } from '../ui/SectionContainer';
import { ModeSelector } from './ModeSelector';
import { TextGenerationMode } from './Mode1_TextGeneration';
import { ProductVariationMode } from './Mode2_ProductVariation';
import { VisualSearchMode } from './Mode3_VisualSearch';
import { ConceptResults } from './ConceptResults';
import { LoadingState } from './LoadingState';

type GenerationMode = 'text' | 'product-variation' | 'visual-search';

interface Concept {
  id: string;
  imageUrl: string;
  prompt: string;
  variants?: string[];
}

export function AIGenerator() {
  const [activeMode, setActiveMode] = useState<GenerationMode>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  
  const generatorRef = useRef<HTMLDivElement>(null);
  const modeContentRef = useRef<HTMLDivElement>(null);

  // Animate mode transitions
  useGSAP(
    () => {
      if (!modeContentRef.current) return;

      gsap.fromTo(
        modeContentRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    },
    { dependencies: [activeMode], scope: generatorRef }
  );

  const handleModeChange = (mode: GenerationMode) => {
    // Fade out current mode
    gsap.to(modeContentRef.current, {
      opacity: 0,
      x: 30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setActiveMode(mode);
      },
    });
  };

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockConcepts: Concept[] = [
        { id: '1', imageUrl: '/mock-1.jpg', prompt: data.prompt },
        { id: '2', imageUrl: '/mock-2.jpg', prompt: data.prompt },
        { id: '3', imageUrl: '/mock-3.jpg', prompt: data.prompt },
        { id: '4', imageUrl: '/mock-4.jpg', prompt: data.prompt },
      ];
      
      setConcepts(mockConcepts);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <SectionContainer
      variant="dark"
      maxWidth="xl"
      className="relative"
      ref={generatorRef}
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-h1 text-[var(--av-pearl)] mb-4">
          AI Creation Studio
        </h2>
        <p className="text-body-lg text-[var(--av-silver)] max-w-2xl mx-auto">
          Choose how you want to create - describe with words, modify existing
          products, or search by image
        </p>
      </div>

      {/* Mode Selector */}
      <ModeSelector activeMode={activeMode} onChange={handleModeChange} />

      {/* Mode Content */}
      <div ref={modeContentRef} className="mt-12">
        {activeMode === 'text' && (
          <TextGenerationMode onGenerate={handleGenerate} />
        )}
        {activeMode === 'product-variation' && (
          <ProductVariationMode onGenerate={handleGenerate} />
        )}
        {activeMode === 'visual-search' && (
          <VisualSearchMode onGenerate={handleGenerate} />
        )}
      </div>

      {/* Loading State */}
      {isGenerating && <LoadingState />}

      {/* Results */}
      {concepts.length > 0 && !isGenerating && (
        <ConceptResults concepts={concepts} />
      )}
    </SectionContainer>
  );
}
```

---

## 🎛️ Mode Selector Component

**File:** `apps/user-ui/src/components/ai-vision/generator/ModeSelector.tsx`

```typescript
'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Type, Package, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'text' | 'product-variation' | 'visual-search';

interface ModeSelectorProps {
  activeMode: Mode;
  onChange: (mode: Mode) => void;
}

const modes = [
  {
    id: 'text' as const,
    label: 'Text Generation',
    description: 'Describe from imagination',
    icon: Type,
  },
  {
    id: 'product-variation' as const,
    label: 'Product Variation',
    description: 'Based on existing products',
    icon: Package,
    badge: 'NEW',
  },
  {
    id: 'visual-search' as const,
    label: 'Visual Search',
    description: 'Find with image',
    icon: ImageIcon,
    badge: 'NEW',
  },
];

export function ModeSelector({ activeMode, onChange }: ModeSelectorProps) {
  const selectorRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!selectorRef.current || !indicatorRef.current) return;

      const activeButton = selectorRef.current.querySelector(
        `[data-mode="${activeMode}"]`
      );

      if (activeButton) {
        const rect = activeButton.getBoundingClientRect();
        const container = selectorRef.current.getBoundingClientRect();
        
        gsap.to(indicatorRef.current, {
          x: rect.left - container.left,
          width: rect.width,
          duration: 0.4,
          ease: 'power3.out',
        });
      }
    },
    { dependencies: [activeMode], scope: selectorRef }
  );

  return (
    <div
      ref={selectorRef}
      className="relative bg-[var(--av-slate)] rounded-lg p-2 inline-flex gap-2 mx-auto"
    >
      {/* Animated Indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-2 left-0 h-[calc(100%-16px)] bg-[var(--av-gold)] rounded-md opacity-20"
        style={{ pointerEvents: 'none' }}
      />

      {/* Mode Buttons */}
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            data-mode={mode.id}
            onClick={() => onChange(mode.id)}
            className={cn(
              'relative z-10 flex items-center gap-3 px-6 py-4 rounded-md transition-all duration-300',
              isActive
                ? 'text-[var(--av-gold)]'
                : 'text-[var(--av-silver)] hover:text-[var(--av-pearl)]'
            )}
          >
            <Icon size={20} />
            <div className="text-left">
              <div className="font-semibold text-sm flex items-center gap-2">
                {mode.label}
                {mode.badge && (
                  <span className="text-[10px] px-2 py-0.5 bg-[var(--av-gold)] text-[var(--av-obsidian)] rounded-full font-bold">
                    {mode.badge}
                  </span>
                )}
              </div>
              <div className="text-xs opacity-70">{mode.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 📝 Mode 1: Text-to-Image Generation

**File:** `apps/user-ui/src/components/ai-vision/generator/Mode1_TextGeneration/index.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Sparkles, Upload } from 'lucide-react';

interface TextGenerationModeProps {
  onGenerate: (data: { prompt: string; category?: string }) => void;
}

export function TextGenerationMode({ onGenerate }: TextGenerationModeProps) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [charCount, setCharCount] = useState(0);
  
  const formRef = useRef<HTMLFormElement>(null);

  useGSAP(
    () => {
      if (!formRef.current) return;

      gsap.fromTo(
        formRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { scope: formRef }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ prompt, category });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setPrompt(text);
      setCharCount(text.length);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto"
    >
      {/* Main Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
          ✨ Describe Your Vision
        </label>
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="E.g., A handcrafted ceramic vase with a matte midnight blue glaze and gold leaf accents, organic shape, 12 inches tall..."
          className="w-full h-32 bg-[var(--av-slate)] text-[var(--av-pearl)] placeholder:text-[var(--av-ash)] rounded-lg p-4 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] focus:ring-4 focus:ring-[var(--av-gold)]/10 outline-none transition-all resize-none text-base"
          required
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-[var(--av-silver)]">
            Be as detailed or abstract as you like
          </span>
          <span className={cn(
            'text-xs',
            charCount > 450 ? 'text-[var(--av-warning)]' : 'text-[var(--av-silver)]'
          )}>
            {charCount} / 500
          </span>
        </div>
      </div>

      {/* Optional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none"
        >
          <option value="">Category</option>
          <option value="art">Art & Prints</option>
          <option value="jewelry">Jewelry</option>
          <option value="home-decor">Home Decor</option>
          <option value="furniture">Furniture</option>
        </select>

        {/* Style */}
        <select className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none">
          <option value="">Style</option>
          <option value="modern">Modern</option>
          <option value="rustic">Rustic</option>
          <option value="minimalist">Minimalist</option>
        </select>

        {/* Material */}
        <select className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none">
          <option value="">Material</option>
          <option value="wood">Wood</option>
          <option value="ceramic">Ceramic</option>
          <option value="metal">Metal</option>
        </select>

        {/* Price Range */}
        <select className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none">
          <option value="">Price Range</option>
          <option value="0-100">Under $100</option>
          <option value="100-250">$100 - $250</option>
          <option value="250+">$250+</option>
        </select>
      </div>

      {/* Reference Image Upload (Optional) */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
          📎 Upload Reference Image (Optional)
        </label>
        <div className="border-2 border-dashed border-[var(--av-silver)]/30 rounded-lg p-6 text-center hover:border-[var(--av-gold)]/50 transition-colors cursor-pointer">
          <Upload className="mx-auto mb-2 text-[var(--av-silver)]" size={32} />
          <p className="text-sm text-[var(--av-silver)] mb-1">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-[var(--av-ash)]">
            JPG, PNG, WEBP (max 10MB)
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <PremiumButton
          type="submit"
          variant="primary"
          size="lg"
          glow
          icon={<Sparkles size={20} />}
          disabled={prompt.length < 10}
        >
          Generate Concepts
        </PremiumButton>
      </div>
    </form>
  );
}
```

---

## 📦 Mode 2: Database Product Variation

**File:** `apps/user-ui/src/components/ai-vision/generator/Mode2_ProductVariation/index.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Search, Package, Wand2 } from 'lucide-react';
import { ProductSelector } from './ProductSelector';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  material: string;
  artisan: string;
}

interface ProductVariationModeProps {
  onGenerate: (data: { productId: string; modifications: string }) => void;
}

export function ProductVariationMode({ onGenerate }: ProductVariationModeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modifications, setModifications] = useState('');
  const [quickAdjustments, setQuickAdjustments] = useState({
    changeColor: false,
    adjustSize: false,
    differentMaterial: false,
    styleVariation: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const elements = containerRef.current.querySelectorAll('.animate-in');
      
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { scope: containerRef }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      onGenerate({
        productId: selectedProduct.id,
        modifications,
      });
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">
      {/* Step 1: Product Search */}
      <div className="animate-in">
        <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--av-gold)] text-[var(--av-obsidian)] text-sm font-bold">
            1
          </span>
          Select a Base Product
        </h3>

        <div className="bg-[var(--av-slate)] rounded-lg p-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our catalog..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--av-onyx)] text-[var(--av-pearl)] rounded-lg border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {['Jewelry', 'Furniture', 'Art', 'Home Decor', 'Pottery'].map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 bg-[var(--av-onyx)] text-[var(--av-silver)] rounded-full text-sm hover:bg-[var(--av-gold)]/20 hover:text-[var(--av-gold)] transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Selector Component */}
        {searchQuery && (
          <ProductSelector
            searchQuery={searchQuery}
            onSelect={setSelectedProduct}
            selected={selectedProduct}
          />
        )}
      </div>

      {/* Selected Product Display */}
      {selectedProduct && (
        <>
          <div className="animate-in bg-[var(--av-slate)] rounded-lg p-6 border-2 border-[var(--av-gold)]/30">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-[var(--av-onyx)] rounded-lg flex items-center justify-center">
                <Package className="text-[var(--av-gold)]" size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-[var(--av-pearl)]">
                  {selectedProduct.name}
                </h4>
                <p className="text-sm text-[var(--av-silver)]">
                  by {selectedProduct.artisan}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-[var(--av-silver)]">
                  <span>Style: {selectedProduct.category}</span>
                  <span>Material: {selectedProduct.material}</span>
                  <span>Price: ${selectedProduct.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Modifications */}
          <form onSubmit={handleSubmit} className="animate-in">
            <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--av-gold)] text-[var(--av-obsidian)] text-sm font-bold">
                2
              </span>
              What Would You Like to Change?
            </h3>

            <div className="bg-[var(--av-slate)] rounded-lg p-6 space-y-6">
              {/* Text Modifications */}
              <div>
                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                  Describe Your Changes
                </label>
                <textarea
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value)}
                  placeholder="E.g., Make it taller, with a darker glaze and gold trim around the rim..."
                  className="w-full h-24 bg-[var(--av-onyx)] text-[var(--av-pearl)] rounded-lg p-4 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none resize-none"
                  required
                />
              </div>

              {/* Quick Adjustments */}
              <div>
                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                  Quick Adjustments
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries({
                    changeColor: 'Change Color',
                    adjustSize: 'Adjust Size',
                    differentMaterial: 'Different Material',
                    styleVariation: 'Style Variation',
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 bg-[var(--av-onyx)] rounded-lg cursor-pointer hover:bg-[var(--av-onyx)]/70 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={quickAdjustments[key as keyof typeof quickAdjustments]}
                        onChange={(e) =>
                          setQuickAdjustments((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 rounded border-2 border-[var(--av-gold)] text-[var(--av-gold)] focus:ring-2 focus:ring-[var(--av-gold)]/20"
                      />
                      <span className="text-sm text-[var(--av-pearl)]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center pt-4">
                <PremiumButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  glow
                  icon={<Wand2 size={20} />}
                  disabled={!modifications}
                >
                  Generate Variations
                </PremiumButton>
                <p className="text-xs text-[var(--av-silver)] mt-3">
                  Uses product schema + AI to create realistic variations
                </p>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
```

---

## 🔍 Mode 3: Visual Search

**File:** `apps/user-ui/src/components/ai-vision/generator/Mode3_VisualSearch/index.tsx`

```typescript
'use client';

import { useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Upload, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface VisualSearchModeProps {
  onGenerate: (data: { image: File; action: 'search' | 'generate' }) => void;
}

export function VisualSearchMode({ onGenerate }: VisualSearchModeProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-[var(--av-pearl)] mb-2">
          🔍 Find Products With an Image
        </h3>
        <p className="text-[var(--av-silver)]">
          Upload a photo. We'll find it in our catalog or help you create a
          custom version.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer',
          isDragActive
            ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/5'
            : 'border-[var(--av-silver)]/30 hover:border-[var(--av-gold)]/50 bg-[var(--av-slate)]'
        )}
      >
        <input {...getInputProps()} />
        
        {imagePreview ? (
          <div className="space-y-4">
            <img
              src={imagePreview}
              alt="Uploaded preview"
              className="max-w-xs mx-auto rounded-lg shadow-lg"
            />
            <p className="text-sm text-[var(--av-silver)]">
              ✓ Image uploaded • Click to change
            </p>
          </div>
        ) : (
          <div>
            <ImageIcon className="mx-auto mb-4 text-[var(--av-gold)]" size={48} />
            <p className="text-lg text-[var(--av-pearl)] mb-2">
              {isDragActive ? (
                'Drop your image here'
              ) : (
                '📷 Drag & Drop Image Here'
              )}
            </p>
            <p className="text-sm text-[var(--av-silver)]">
              or click to browse
            </p>
            <p className="text-xs text-[var(--av-ash)] mt-4">
              Supports: JPG, PNG, WEBP (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* OR Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--av-silver)]/20"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--av-obsidian)] px-4 text-[var(--av-silver)]">
            Or
          </span>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
          Paste Image URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-3 bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none"
          />
          <PremiumButton variant="secondary" size="md">
            Load
          </PremiumButton>
        </div>
      </div>

      {/* Action Buttons */}
      {(uploadedImage || imageUrl) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PremiumButton
            variant="primary"
            size="lg"
            glow
            icon={<Search size={20} />}
            onClick={() =>
              uploadedImage && onGenerate({ image: uploadedImage, action: 'search' })
            }
          >
            🔍 Search Our Products
          </PremiumButton>

          <PremiumButton
            variant="secondary"
            size="lg"
            icon={<Sparkles size={20} />}
            onClick={() =>
              uploadedImage && onGenerate({ image: uploadedImage, action: 'generate' })
            }
          >
            ✨ Generate Similar
          </PremiumButton>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-[var(--av-silver)] space-y-2">
        <p>💡 Works with Pinterest images, product photos, or even sketches</p>
        <p>⚡ AI analyzes shape, color, style, and materials</p>
      </div>
    </div>
  );
}
```

---

## 🎨 Concept Results Display

**File:** `apps/user-ui/src/components/ai-vision/generator/ConceptResults/index.tsx`

```typescript
'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ConceptCard } from './ConceptCard';

interface Concept {
  id: string;
  imageUrl: string;
  prompt: string;
}

interface ConceptResultsProps {
  concepts: Concept[];
}

export function ConceptResults({ concepts }: ConceptResultsProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;

      const cards = gridRef.current.children;

      gsap.fromTo(
        cards,
        {
          opacity: 0,
          scale: 0.8,
          y: 40,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.4)',
        }
      );
    },
    { dependencies: [concepts], scope: gridRef }
  );

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold text-[var(--av-pearl)] mb-6 text-center">
        ✨ Your AI-Generated Concepts
      </h3>

      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {concepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} />
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-[var(--av-silver)] mb-4">
          Not quite right?
        </p>
        <PremiumButton variant="secondary" size="md">
          Adjust Prompt & Regenerate
        </PremiumButton>
      </div>
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Week 2 - Days 1-3: Mode Switcher & Mode 1
- [ ] Build `AIGenerator` main container
- [ ] Implement `ModeSelector` with animations
- [ ] Build Text Generation mode UI
- [ ] Add category/style/material filters
- [ ] Implement reference image upload
- [ ] Test mode switching animations

### Week 2 - Days 4-6: Mode 2 (Product Variation)
- [ ] Build product search interface
- [ ] Create product selector component
- [ ] Implement modification textarea
- [ ] Add quick adjustment checkboxes
- [ ] Connect to mock product data
- [ ] Test variation generation flow

### Week 3 - Days  7-9: Mode 3 (Visual Search)
- [ ] Install `react-dropzone`
- [ ] Build drag-and-drop upload
- [ ] Implement image preview
- [ ] Add URL paste functionality
- [ ] Create dual action buttons (search/generate)
- [ ] Test with various image formats

### Week 3 - Days 10-12: Results & Polish
- [ ] Build concept results grid
- [ ] Implement concept cards with actions
- [ ] Add loading states & animations
- [ ] Create refinement controls
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## 🧪 Testing Requirements

### Functional Testing
- [ ] All 3 modes load correctly
- [ ] Mode switching preserves no data loss
- [ ] Image upload works (Mode 3)
- [ ] Form validation prevents empty submissions
- [ ] Results display correctly after generation

### Animation Testing
- [ ] Mode transitions are smooth (< 400ms)
- [ ] Results animate in with stagger effect
- [ ] No layout shift during transitions
- [ ] Animations maintain 60fps

### Accessibility Testing
- [ ] Keyboard navigation through modes
- [ ] File upload accessible via keyboard
- [ ] Form labels properly associated
- [ ] Error messages are announced

---

**Next Phase:** [Phase 3 - Visual Search Showcase & Gallery](./PHASE_3_VISUAL_SEARCH_GALLERY.md)
