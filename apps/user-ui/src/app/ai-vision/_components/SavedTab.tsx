'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Eye, X } from 'lucide-react';
import { aiVisionClient, type GalleryItem } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import AuthPromptModal from './AuthPromptModal';
import { Card } from '@/components/ui/card';

export default function SavedTab() {
  const { user, isLoading: userLoading } = useUser();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        loadFavorites();
      } else {
        setLoading(false);
      }
    }
  }, [user, userLoading]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Load gallery items filtered by favorites
      const data = await aiVisionClient.getGallery({
        // Note: Backend should support a 'favorites' filter
        sortBy: 'favorites',
        limit: 20,
      });
      // Filter to only favorited items
      setItems(data.items.filter((item) => item.isFavorite));
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast.error('Failed to load your saved concepts');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await aiVisionClient.toggleFavorite(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (!user && !userLoading) {
    return (
      <>
        <Card className="p-12 text-center bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
          <Heart className="mx-auto h-16 w-16 text-[var(--ac-gold)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
            Saved Concepts
          </h3>
          <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-6 max-w-md mx-auto">
            Sign in to build your collection of inspiring concepts and never lose track of ideas you love.
          </p>
          <Button
            className="bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)]"
            onClick={() => setShowAuthPrompt(true)}
          >
            <Heart className="mr-2 h-4 w-4" />
            Sign In to Save Concepts
          </Button>
        </Card>

        <AuthPromptModal
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          action="favorite"
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
          Saved Concepts
        </h2>
        <p className="text-sm text-[var(--ac-stone)] mt-1">
          {items.length} concept{items.length !== 1 ? 's' : ''} in your favorites
        </p>
      </div>

      {/* Favorites Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:shadow-lg transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.thumbnailUrl || '/placeholder-concept.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => handleRemoveFavorite(item.id, e)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove from favorites"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] line-clamp-1 flex-1">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {item.category}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 text-xs text-[var(--ac-stone)]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      {item.favoriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-[var(--ac-gold)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
            No saved concepts yet
          </h3>
          <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
            Browse the Explore tab and save concepts that inspire you!
          </p>
          <Button variant="outline" onClick={() => window.location.hash = 'explore'}>
            Explore Gallery
          </Button>
        </Card>
      )}
    </div>
  );
}
