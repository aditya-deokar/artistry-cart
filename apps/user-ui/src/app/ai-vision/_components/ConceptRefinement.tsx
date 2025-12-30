'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Sliders, X } from 'lucide-react';
import { aiVisionClient, type Concept } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import GenerationResults from './generators/GenerationResults';

interface ConceptRefinementProps {
  concept: Concept;
  onClose?: () => void;
}

export default function ConceptRefinement({ concept, onClose }: ConceptRefinementProps) {
  const [loading, setLoading] = useState(false);
  const [refinedConcepts, setRefinedConcepts] = useState<Concept[]>([]);
  
  // Refinement options
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  const styles = ['Bohemian', 'Minimalist', 'Traditional', 'Contemporary', 'Vintage', 'Rustic'];
  const materials = ['Wood', 'Metal', 'Ceramic', 'Glass', 'Textile', 'Stone', 'Leather'];
  const priceRanges = [
    { label: 'Budget ($10-$50)', value: '10-50' },
    { label: 'Mid-range ($50-$150)', value: '50-150' },
    { label: 'Premium ($150-$500)', value: '150-500' },
    { label: 'Luxury ($500+)', value: '500+' },
  ];

  const handleRefine = async () => {
    if (!selectedStyle && !selectedMaterial && !priceRange && !additionalPrompt) {
      toast.error('Please select at least one refinement option');
      return;
    }

    try {
      setLoading(true);
      toast.info('Refining concept...', { duration: 2000 });

      // Use generate with refinement prompt
      const refined = await aiVisionClient.generateFromPrompt({
        prompt: `Refine this concept: ${concept.generatedProduct?.title || 'concept'}. ${additionalPrompt || ''}`,
        style: selectedStyle || (concept.generatedProduct?.styleKeywords?.[0]),
        materials: selectedMaterial ? [selectedMaterial] : undefined,
      });

      setRefinedConcepts(refined);
      toast.success(`Generated ${refined.length} refined concept${refined.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Refinement failed:', error);
      toast.error('Failed to refine concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedStyle('');
    setSelectedMaterial('');
    setPriceRange('');
    setAdditionalPrompt('');
    setRefinedConcepts([]);
  };

  return (
    <div className="space-y-6">
      {/* Original Concept */}
      <Card className="p-4 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[var(--ac-gold)]" />
            Refine This Concept
          </h3>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={concept.primaryImageUrl || concept.thumbnailUrl || '/placeholder-concept.jpg'}
              alt={concept.generatedProduct?.title || 'Concept'}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1">
              {concept.generatedProduct?.title || 'Untitled Concept'}
            </h4>
            <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] line-clamp-2 mb-2">
              {concept.generatedProduct?.description || 'No description'}
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">{concept.generatedProduct?.category || 'Uncategorized'}</Badge>
              {concept.generatedProduct?.styleKeywords?.[0] && (
                <Badge variant="outline">{concept.generatedProduct.styleKeywords[0]}</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Refinement Options */}
      {refinedConcepts.length === 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Change Style
              </label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="bg-white dark:bg-[var(--ac-onyx)]">
                  <SelectValue placeholder="Select a style..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Change Material
              </label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className="bg-white dark:bg-[var(--ac-onyx)]">
                  <SelectValue placeholder="Select a material..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {materials.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Adjust Price Range
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white dark:bg-[var(--ac-onyx)]">
                  <SelectValue placeholder="Select price range..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Additional Changes
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="Describe specific changes you'd like (e.g., 'make it brighter', 'add floral patterns', 'more modern look')..."
                className="w-full px-3 py-2 rounded-md border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] bg-white dark:bg-[var(--ac-onyx)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ac-gold)]"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleRefine}
                disabled={loading}
                className="flex-1 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/90"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Refined Concepts
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Refined Results */}
      {refinedConcepts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              Refined Concepts
            </h3>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Create Another Refinement
            </Button>
          </div>
          <GenerationResults concepts={refinedConcepts} onGenerateMore={handleReset} />
        </div>
      )}
    </div>
  );
}
