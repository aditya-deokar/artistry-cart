'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  Share2,
  Users,
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { aiVisionClient, type Concept } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import ArtisanMatchingModal from '../../_components/ArtisanMatchingModal';
import AuthPromptModal from '../../_components/AuthPromptModal';
import SimilarConcepts from '../../_components/SimilarConcepts';
import ConceptRefinement from '../../_components/ConceptRefinement';
import ConceptCarousel from '../../_components/ConceptCarousel';
import ImageZoom from '../../_components/ImageZoom';
import CommentSection from '../../_components/CommentSection';


export default function ConceptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const conceptId = params.id as string;

  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArtisanModal, setShowArtisanModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState<'save' | 'send' | 'favorite' | 'delete'>('save');
  const [showRefinement, setShowRefinement] = useState(false);

  useEffect(() => {
    loadConcept();
  }, [conceptId]);

  const loadConcept = async () => {
    try {
      setLoading(true);
      // Fetch from user's concepts or use gallery as fallback
      const userConcepts = await aiVisionClient.getUserConcepts({ limit: 100 });
      const foundConcept = userConcepts.concepts.find(c => c.id === conceptId);

      if (foundConcept) {
        setConcept(foundConcept);
      } else {
        // Try gallery as fallback
        const gallery = await aiVisionClient.getGallery({ limit: 100 });
        const galleryItem = gallery.items.find(item => item.id === conceptId);
        if (galleryItem) {
          // Convert GalleryItem to Concept
          setConcept({
            id: galleryItem.id,
            sessionId: '',
            generationPrompt: '',
            enhancedPrompt: '',
            primaryImageUrl: galleryItem.imageUrl,
            thumbnailUrl: galleryItem.thumbnailUrl,
            images: [galleryItem.imageUrl],
            analyzedFeatures: {},
            status: galleryItem.status as any,
            isSaved: false,
            isFavorite: galleryItem.isFavorite,
            viewCount: galleryItem.viewCount,
            createdAt: galleryItem.createdAt,
            updatedAt: galleryItem.createdAt,
            generatedProduct: galleryItem.generatedProduct,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load concept:', error);
      toast.error('Failed to load concept details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setAuthAction('save');
      setShowAuthPrompt(true);
      return;
    }

    if (!concept) return;

    try {
      await aiVisionClient.saveConcept(concept.id);
      toast.success('Concept saved!');
      loadConcept(); // Refresh to update isSaved status
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save concept');
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setAuthAction('favorite');
      setShowAuthPrompt(true);
      return;
    }

    if (!concept) return;

    try {
      await aiVisionClient.toggleFavorite(concept.id);
      setConcept({ ...concept, isFavorite: !concept.isFavorite });
      toast.success(concept.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = () => {
    if (!concept) return;
    const url = `${window.location.origin}/ai-vision/concept/${concept.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleSendToArtisans = () => {
    if (!user) {
      setAuthAction('send');
      setShowAuthPrompt(true);
      return;
    }
    setShowArtisanModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-graphite)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-video rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-graphite)] flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Concept not found</h2>
          <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
            This concept may have been removed or doesn't exist.
          </p>
          <Button onClick={() => router.push('/ai-vision')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Vision
          </Button>
        </Card>
      </div>
    );
  }

  if (showRefinement) {
    return (
      <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-graphite)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <ConceptRefinement
            concept={concept}
            onClose={() => setShowRefinement(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-graphite)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFavorite}
              className={concept.isFavorite ? 'text-red-500' : ''}
            >
              <Heart
                className={`h-4 w-4 ${concept.isFavorite ? 'fill-red-500' : ''}`}
              />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel with Zoom */}
            <Card className="overflow-hidden">
              {concept.images && concept.images.length > 1 ? (
                <ConceptCarousel
                  images={concept.images}
                  aspectRatio="video"
                />
              ) : (
                <ImageZoom
                  src={concept.primaryImageUrl || concept.thumbnailUrl || '/placeholder-concept.jpg'}
                  alt={concept.generatedProduct?.title || 'Concept'}
                  trigger={
                    <div className="relative aspect-video cursor-pointer">
                      <Image
                        src={concept.primaryImageUrl || concept.thumbnailUrl || '/placeholder-concept.jpg'}
                        alt={concept.generatedProduct?.title || 'Concept'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  }
                />
              )}
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h1 className="text-3xl font-bold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                {concept.generatedProduct?.title || 'Untitled Concept'}
              </h1>
              <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-6 text-lg leading-relaxed">
                {concept.generatedProduct?.description || 'No description available'}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{concept.generatedProduct?.category || 'Uncategorized'}</Badge>
                {concept.generatedProduct?.subCategory && (
                  <Badge variant="outline">{concept.generatedProduct.subCategory}</Badge>
                )}
                {concept.generatedProduct?.styleKeywords?.map((style) => (
                  <Badge key={style} variant="outline">{style}</Badge>
                ))}
                {concept.generatedProduct?.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-[var(--ac-gold)]/10">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                <div className="flex items-center gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                  <Eye className="h-4 w-4" />
                  {concept.viewCount} views
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                  <Calendar className="h-4 w-4" />
                  {new Date(concept.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>

            {/* Materials & Details */}
            {concept.generatedProduct && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {concept.generatedProduct.materials && (
                    <div>
                      <h4 className="font-medium mb-2">Materials</h4>
                      <div className="flex flex-wrap gap-2">
                        {concept.generatedProduct.materials.map((material) => (
                          <Badge key={material} variant="secondary">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {concept.generatedProduct.colors && (
                    <div>
                      <h4 className="font-medium mb-2">Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {concept.generatedProduct.colors.map((color) => (
                          <Badge key={color} variant="outline">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {concept.generatedProduct.estimatedPriceMin && (
                    <div>
                      <h4 className="font-medium mb-2">Estimated Price</h4>
                      <p className="text-2xl font-bold text-[var(--ac-gold)]">
                        ${concept.generatedProduct.estimatedPriceMin} - $
                        {concept.generatedProduct.estimatedPriceMax}
                      </p>
                    </div>
                  )}
                  {concept.generatedProduct.estimatedDuration && (
                    <div>
                      <h4 className="font-medium mb-2">Production Time</h4>
                      <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                        {concept.generatedProduct.estimatedDuration}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Similar Concepts */}
            <SimilarConcepts conceptId={concept.id} title="You might also like" />

            {/* Comments Section */}
            <Card className="p-6">
              <CommentSection conceptId={concept.id} />
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <Card className="p-6 sticky top-8">
              <div className="space-y-4">
                <Button
                  className="w-full bg-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/90 text-white"
                  size="lg"
                  onClick={handleSendToArtisans}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Send to Artisans
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRefinement(true)}
                >
                  <Sliders className="mr-2 h-4 w-4" />
                  Refine This Concept
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSave}
                  disabled={concept.isSaved}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {concept.isSaved ? 'Saved' : 'Save Concept'}
                </Button>

                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>

              {concept.generatedProduct && (
                <div className="mt-6 pt-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                  <h4 className="font-medium mb-3">Feasibility</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                        Score
                      </span>
                      <span className="font-medium">
                        {concept.generatedProduct.feasibilityScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] rounded-full h-2">
                      <div
                        className="bg-[var(--ac-gold)] h-2 rounded-full"
                        style={{ width: `${concept.generatedProduct.feasibilityScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--ac-stone)]">
                      Complexity: {concept.generatedProduct.complexityLevel}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showArtisanModal && (
        <ArtisanMatchingModal
          open={showArtisanModal}
          onOpenChange={setShowArtisanModal}
          concept={concept}
          onSuccess={() => {
            toast.success('Sent to artisans!');
            setShowArtisanModal(false);
          }}
        />
      )}

      <AuthPromptModal
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        action={authAction}
      />
    </div>
  );
}
