'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Users, ChevronLeft, RefreshCw, Sliders } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Concept } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import { aiVisionClient } from '@/lib/api/aivision-client';
import useUser from '@/hooks/useUser';
import ArtisanMatchingModal from '../ArtisanMatchingModal';
import AuthPromptModal from '../AuthPromptModal';
import ConceptRefinement from '../ConceptRefinement';
import SimilarConcepts from '../SimilarConcepts';
import { Card } from '@/components/ui/card';

interface GenerationResultsProps {
  concepts: Concept[];
  onGenerateMore: () => void;
}

export default function GenerationResults({ concepts, onGenerateMore }: GenerationResultsProps) {
  const { user } = useUser();
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [artisanMatchConcept, setArtisanMatchConcept] = useState<Concept | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState<'save' | 'send' | 'favorite' | 'delete'>('save');
  const [refiningConcept, setRefiningConcept] = useState<Concept | null>(null);

  const handleSave = async (concept: Concept) => {
    if (!user) {
      setAuthAction('save');
      setShowAuthPrompt(true);
      return;
    }

    try {
      await aiVisionClient.saveConcept(concept.id);
      toast.success('Concept saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save concept');
    }
  };

  const handleShare = (concept: Concept) => {
    const url = `${window.location.origin}/ai-vision/concept/${concept.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleSendToArtisans = (concept: Concept) => {
    if (!user) {
      setAuthAction('send');
      setShowAuthPrompt(true);
      return;
    }
    setArtisanMatchConcept(concept);
  };

  if (refiningConcept) {
    return (
      <ConceptRefinement
        concept={refiningConcept}
        onClose={() => setRefiningConcept(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
            Generated Concepts
          </h3>
          <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mt-1">
            {concepts.length} unique concept{concepts.length !== 1 ? 's' : ''} created just for you
          </p>
        </div>
      </div>

      {/* Concept Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <Card
            key={concept.id}
            className="overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:shadow-lg transition-all"
          >
            <div
              className="relative aspect-square cursor-pointer group"
              onClick={() => setSelectedConcept(concept)}
            >
              <Image
                src={concept.primaryImageUrl || concept.thumbnailUrl || '/placeholder-concept.jpg'}
                alt={concept.generatedProduct?.title || 'Generated concept'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] line-clamp-1">
                  {concept.generatedProduct?.title || 'Untitled Concept'}
                </h4>
                <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] line-clamp-2 mt-1">
                  {concept.generatedProduct?.description || 'No description available'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{concept.generatedProduct?.category || 'Uncategorized'}</Badge>
                {concept.generatedProduct?.styleKeywords?.[0] && (
                  <Badge variant="outline">{concept.generatedProduct.styleKeywords[0]}</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(concept)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShare(concept)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRefiningConcept(concept)}
                >
                  <Sliders className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="sm"
                className="w-full bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-white"
                onClick={() => handleSendToArtisans(concept)}
              >
                <Users className="mr-2 h-4 w-4" />
                Send to Artisans
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 bg-[var(--ac-linen)]/50 dark:bg-[var(--ac-slate)]/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
            Want to refine these concepts or try different variations?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onGenerateMore}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate More
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedConcept && (
        <Dialog open={!!selectedConcept} onOpenChange={() => setSelectedConcept(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedConcept.generatedProduct?.title || 'Concept Details'}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedConcept(null)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={selectedConcept.primaryImageUrl || selectedConcept.thumbnailUrl || '/placeholder-concept.jpg'}
                  alt={selectedConcept.generatedProduct?.title || 'Concept'}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                    {selectedConcept.generatedProduct?.description || 'No description available'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedConcept.generatedProduct?.category || 'Uncategorized'}</Badge>
                  {selectedConcept.generatedProduct?.subCategory && (
                    <Badge variant="outline">{selectedConcept.generatedProduct.subCategory}</Badge>
                  )}
                  {selectedConcept.generatedProduct?.styleKeywords?.map((style) => (
                    <Badge key={style} variant="outline">{style}</Badge>
                  ))}
                </div>

                {selectedConcept.generatedProduct?.materials && (
                  <div>
                    <h4 className="font-medium mb-2">Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedConcept.generatedProduct.materials.map((material) => (
                        <Badge key={material} variant="secondary">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => handleSave(selectedConcept)}>
                    <Heart className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => handleShare(selectedConcept)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedConcept(null);
                    setRefiningConcept(selectedConcept);
                  }}>
                    <Sliders className="mr-2 h-4 w-4" />
                    Refine
                  </Button>
                  <Button
                    className="flex-1 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/90"
                    onClick={() => {
                      setSelectedConcept(null);
                      handleSendToArtisans(selectedConcept);
                    }}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Send to Artisans
                  </Button>
                </div>
              </div>

              {/* Similar Concepts */}
              <SimilarConcepts conceptId={selectedConcept.id} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Artisan Matching Modal */}
      {artisanMatchConcept && (
        <ArtisanMatchingModal
          open={!!artisanMatchConcept}
          onOpenChange={(open) => !open && setArtisanMatchConcept(null)}
          concept={artisanMatchConcept}
          onSuccess={() => {
            toast.success('Your concept journey has begun! 🎨');
            setArtisanMatchConcept(null);
          }}
        />
      )}

      {/* Auth Prompt */}
      <AuthPromptModal
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        action={authAction}
      />
    </div>
  );
}
