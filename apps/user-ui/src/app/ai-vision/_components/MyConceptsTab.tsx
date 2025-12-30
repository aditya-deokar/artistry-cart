'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Clock, CheckCircle, Send, Package, Trash2, Eye } from 'lucide-react';
import { aiVisionClient, type Concept } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import ArtisanMatchingModal from './ArtisanMatchingModal';
import AuthPromptModal from './AuthPromptModal';
import { Card } from '@/components/ui/card';

export default function MyConceptsTab() {
  const { user, isLoading: userLoading } = useUser();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        loadConcepts();
      } else {
        setLoading(false);
      }
    }
  }, [user, userLoading, statusFilter]);

  const loadConcepts = async () => {
    try {
      setLoading(true);
      const data = await aiVisionClient.getUserConcepts({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: 'recent',
        limit: 20,
      });
      setConcepts(data?.concepts || []);
    } catch (error) {
      console.error('Failed to load concepts:', error);
      toast.error('Failed to load your concepts');
      setConcepts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conceptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this concept?')) {
      return;
    }

    try {
      await aiVisionClient.deleteConcept(conceptId);
      setConcepts((prev) => prev.filter((c) => c.id !== conceptId));
    } catch (error) {
      console.error('Failed to delete concept:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'GENERATED':
        return { icon: Clock, label: 'Generated', color: 'text-blue-600 dark:text-blue-400' };
      case 'SAVED':
        return { icon: CheckCircle, label: 'Saved', color: 'text-green-600 dark:text-green-400' };
      case 'SENT_TO_ARTISANS':
        return { icon: Send, label: 'Sent to Artisans', color: 'text-[var(--ac-gold)]' };
      case 'REALIZED':
        return { icon: Package, label: 'Realized', color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { icon: Sparkles, label: status, color: 'text-[var(--ac-stone)]' };
    }
  };

  if (!user && !userLoading) {
    return (
      <>
        <Card className="p-12 text-center bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
          <Sparkles className="mx-auto h-16 w-16 text-[var(--ac-gold)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
            Your Concept Library
          </h3>
          <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-6 max-w-md mx-auto">
            Sign in to track all your AI-generated concepts, from idea to artisan collaboration to final product.
          </p>
          <Button
            className="bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)]"
            onClick={() => setShowAuthPrompt(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Sign In to View Your Concepts
          </Button>
        </Card>

        <AuthPromptModal
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          action="save"
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
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
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              My Concepts
            </h2>
            <p className="text-sm text-[var(--ac-stone)] mt-1">
              {(concepts || []).length} concept{(concepts || []).length !== 1 ? 's' : ''} in your library
            </p>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="all">All Concepts</SelectItem>
              <SelectItem value="GENERATED">Generated</SelectItem>
              <SelectItem value="SAVED">Saved</SelectItem>
              <SelectItem value="SENT_TO_ARTISANS">Sent to Artisans</SelectItem>
              <SelectItem value="REALIZED">Realized</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Concepts Grid */}
        {(concepts || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(concepts || []).map((concept) => {
              const statusInfo = getStatusInfo(concept.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card
                  key={concept.id}
                  className="group overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedConcept(concept)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={concept.thumbnailUrl || '/placeholder-concept.jpg'}
                      alt={concept.generatedProduct?.title || 'Concept'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/90 dark:bg-black/90">
                        <StatusIcon className={`h-3 w-3 mr-1 ${statusInfo.color}`} />
                        {statusInfo.label}
                      </Badge>
                      <button
                        onClick={(e) => handleDelete(concept.id, e)}
                        className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] line-clamp-1">
                      {concept.generatedProduct?.title || 'Untitled Concept'}
                    </h3>
                    {concept.generatedProduct?.description && (
                      <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] line-clamp-2">
                        {concept.generatedProduct.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 text-xs text-[var(--ac-stone)]">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {concept.viewCount} views
                      </span>
                      <span>
                        {new Date(concept.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-[var(--ac-gold)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
              No concepts yet
            </h3>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
              {statusFilter !== 'all'
                ? `You don't have any ${statusFilter.toLowerCase().replace('_', ' ')} concepts.`
                : "Start generating concepts to see them here."}
            </p>
            {statusFilter !== 'all' && (
              <Button variant="outline" onClick={() => setStatusFilter('all')}>
                Show All Concepts
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Artisan Matching Modal */}
      {selectedConcept && (
        <ArtisanMatchingModal
          open={!!selectedConcept}
          onOpenChange={(open) => !open && setSelectedConcept(null)}
          concept={selectedConcept}
          onSuccess={() => {
            loadConcepts();
            setSelectedConcept(null);
          }}
        />
      )}
    </>
  );
}
