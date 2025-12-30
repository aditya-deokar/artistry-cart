'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Grid3x3, List, Heart, Eye } from 'lucide-react';
import { aiVisionClient, type GalleryItem } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import AuthPromptModal from './AuthPromptModal';

export default function ExploreTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadGallery();
  }, [sortBy]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const data = await aiVisionClient.getGallery({
        sortBy,
        page: 1,
        limit: 12,
      });
      setItems(data.items || []);
      setHasMore(data.page < data.totalPages);
    } catch (error) {
      console.error('Failed to load gallery:', error);
      toast.error('Failed to load concepts');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const data = await aiVisionClient.getGallery({
        sortBy,
        page: nextPage,
        limit: 12,
      });
      setItems([...items, ...(data.items || [])]);
      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);
    } catch (error) {
      console.error('Failed to load more:', error);
    }
  };

  const handleToggleFavorite = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      const result = await aiVisionClient.toggleFavorite(itemId);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isFavorite: result.isFavorite, favoriteCount: item.favoriteCount + (result.isFavorite ? 1 : -1) }
            : item
        )
      );
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
          Discover Concepts
        </h2>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="favorites">Most Favorited</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border border-[var(--ac-linen)] rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {(items || []).map((item) => (
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
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] line-clamp-1">
                  {item.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
              <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-2 text-xs text-[var(--ac-stone)]">
                <div className="flex items-center gap-3">
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
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}

      {items.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
            No concepts found. Try adjusting your filters or generate your first concept!
          </p>
        </Card>
      )}

      <AuthPromptModal
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        action="favorite"
      />
    </div>
  );
}
