'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Heart, Eye } from 'lucide-react';
import { aiVisionClient, type GalleryItem } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';

interface SimilarConceptsProps {
  conceptId: string;
  title?: string;
}

export default function SimilarConcepts({ conceptId, title }: SimilarConceptsProps) {
  const [similar, setSimilar] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimilar();
  }, [conceptId]);

  const loadSimilar = async () => {
    try {
      setLoading(true);
      // Use gallery with same category as proxy for similar
      const data = await aiVisionClient.getGallery({
        limit: 6,
        sortBy: 'popular',
      });
      setSimilar(data.items.slice(0, 6));
    } catch (error) {
      console.error('Failed to load similar concepts:', error);
      toast.error('Failed to load similar concepts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
          Similar Concepts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--ac-gold)]" />
          {title || 'More Like This'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSimilar}
          className="text-[var(--ac-gold)] hover:text-[var(--ac-gold)]/80"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {similar.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={item.thumbnailUrl || '/placeholder-concept.jpg'}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] line-clamp-1 flex-1">
                  {item.title}
                </h4>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {item.category}
                </Badge>
              </div>
              {item.description && (
                <p className="text-xs text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-1 text-xs text-[var(--ac-stone)]">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {item.favoriteCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.viewCount}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
