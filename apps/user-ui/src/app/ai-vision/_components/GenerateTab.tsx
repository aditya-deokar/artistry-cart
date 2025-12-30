'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Wand2, Images, Upload } from 'lucide-react';
import TextToImageGenerator from './generators/TextToImageGenerator';
import { Card } from '@/components/ui/card';
import ProductVariationGenerator from './generators/ProductVariationGenerator';
import VisualSearchGenerator from './generators/VisualSearchGenerator';

export default function GenerateTab() {
  const [generationMode, setGenerationMode] = useState<'text' | 'variation' | 'visual'>('text');

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="p-8 bg-gradient-to-br from-[var(--ac-cream)] to-[var(--ac-linen)] dark:from-[var(--ac-onyx)] dark:to-[var(--ac-slate)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-3">
            Bring Your Vision to Life
          </h2>
          <p className="text-base text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
            Describe what you imagine, refine existing designs, or upload inspiration. Our AI creates unique concepts that artisans can bring to life.
          </p>
        </div>
      </Card>

      {/* Generation Modes */}
      <Tabs value={generationMode} onValueChange={(v: string) => setGenerationMode(v as 'text' | 'variation' | 'visual')}>
        <TabsList className="grid w-full grid-cols-3 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
          <TabsTrigger value="text" className="space-x-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Describe Your Vision</span>
            <span className="sm:hidden">Describe</span>
          </TabsTrigger>
          <TabsTrigger value="variation" className="space-x-2">
            <Images className="h-4 w-4" />
            <span className="hidden sm:inline">Modify Existing</span>
            <span className="sm:hidden">Modify</span>
          </TabsTrigger>
          <TabsTrigger value="visual" className="space-x-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Image</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <TextToImageGenerator />
        </TabsContent>

        <TabsContent value="variation" className="mt-6">
          <ProductVariationGenerator />
        </TabsContent>

        <TabsContent value="visual" className="mt-6">
          <VisualSearchGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
