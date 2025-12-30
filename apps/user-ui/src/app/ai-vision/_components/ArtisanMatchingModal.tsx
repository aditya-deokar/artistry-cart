'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { aiVisionClient, type ArtisanMatch, type Concept } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import Image from 'next/image';
import useUser from '@/hooks/useUser';
import AuthPromptModal from './AuthPromptModal';

interface ArtisanMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concept: Concept;
  onSuccess?: () => void;
}

export default function ArtisanMatchingModal({
  open,
  onOpenChange,
  concept,
  onSuccess,
}: ArtisanMatchingModalProps) {
  const { user } = useUser();
  const [matches, setMatches] = useState<ArtisanMatch[]>([]);
  const [selectedArtisans, setSelectedArtisans] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [step, setStep] = useState<'loading' | 'select' | 'sent'>('loading');

  useEffect(() => {
    if (open) {
      loadMatches();
    }
  }, [open, concept.id]);

  const loadMatches = async () => {
    try {
      setStep('loading');
      const data = await aiVisionClient.getArtisanMatches(concept.id);
      setMatches(data.matches);
      setStep('select');
    } catch (error) {
      console.error('Failed to load artisan matches:', error);
      toast.error('Failed to find matching artisans');
      onOpenChange(false);
    }
  };

  const handleToggleArtisan = (artisanId: string) => {
    setSelectedArtisans((prev) =>
      prev.includes(artisanId)
        ? prev.filter((id) => id !== artisanId)
        : [...prev, artisanId]
    );
  };

  const handleSend = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (selectedArtisans.length === 0) {
      toast.error('Please select at least one artisan');
      return;
    }

    try {
      setSending(true);
      await aiVisionClient.sendToArtisans(concept.id, selectedArtisans);
      setStep('sent');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to send to artisans:', error);
    } finally {
      setSending(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-[var(--ac-stone)]';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {step === 'loading' && (
            <>
              <DialogHeader>
                <DialogTitle>Finding Perfect Artisans</DialogTitle>
                <DialogDescription>
                  We're analyzing your concept and matching it with skilled artisans...
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-[var(--ac-gold)] dark:border-[var(--ac-gold-dark)] border-t-transparent rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'select' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[var(--ac-gold)]" />
                  <span>Select Artisans ({matches.length} matched)</span>
                </DialogTitle>
                <DialogDescription>
                  We found {matches.length} artisan{matches.length > 1 ? 's' : ''} who match your concept.
                  Select up to 5 to send your concept for quotes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                {matches.map((match) => (
                  <Card
                    key={match.artisanId}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedArtisans.includes(match.artisanId)
                        ? 'border-[var(--ac-gold)] dark:border-[var(--ac-gold-dark)] bg-[var(--ac-gold)]/5'
                        : 'hover:border-[var(--ac-gold)]/50'
                    }`}
                    onClick={() => handleToggleArtisan(match.artisanId)}
                  >
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedArtisans.includes(match.artisanId)}
                        onCheckedChange={() => handleToggleArtisan(match.artisanId)}
                        className="mt-1"
                      />

                      <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={match.profileImage || '/placeholder-avatar.jpg'}
                          alt={match.artisanName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                              {match.artisanName}
                            </h4>
                            <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                              {match.businessName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getMatchScoreColor(match.matchScore)}`}>
                              {match.matchScore}%
                            </div>
                            <p className="text-xs text-[var(--ac-stone)]">Match</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--ac-stone)]">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{match.rating.toFixed(1)}</span>
                            <span>({match.reviewCount})</span>
                          </div>
                          {match.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{match.location}</span>
                            </div>
                          )}
                          {match.responseTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{match.responseTime}</span>
                            </div>
                          )}
                        </div>

                        {/* Match Reasons */}
                        <div className="mt-3 space-y-1">
                          {match.matchReasons.slice(0, 2).map((reason, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-[var(--ac-gold)] flex-shrink-0 mt-0.5" />
                              <span className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                {reason}
                              </span>
                            </div>
                          ))}
                        </div>

                        {match.estimatedPrice && (
                          <div className="mt-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-[var(--ac-gold)]" />
                            <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                              ₹{match.estimatedPrice.min.toLocaleString()} - ₹
                              {match.estimatedPrice.max.toLocaleString()}
                            </span>
                            {match.estimatedDelivery && (
                              <span className="text-xs text-[var(--ac-stone)]">
                                • {match.estimatedDelivery}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-[var(--ac-stone)]">
                    {selectedArtisans.length} artisan{selectedArtisans.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={selectedArtisans.length === 0 || sending}
                      className="bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)]"
                    >
                      {sending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send to {selectedArtisans.length} Artisan{selectedArtisans.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}

          {step === 'sent' && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4 mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <DialogTitle className="text-center">Concept Sent Successfully!</DialogTitle>
                <DialogDescription className="text-center">
                  Your concept has been sent to {selectedArtisans.length} artisan
                  {selectedArtisans.length !== 1 ? 's' : ''}. They'll review it and respond with quotes.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-4">
                <Card className="p-4 bg-[var(--ac-linen)]/50 dark:bg-[var(--ac-slate)]/50">
                  <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                    What happens next?
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                      <span className="text-[var(--ac-gold)]">1.</span>
                      <span>Artisans review your concept (typically within 24 hours)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                      <span className="text-[var(--ac-gold)]">2.</span>
                      <span>You'll receive custom quotes and timelines</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                      <span className="text-[var(--ac-gold)]">3.</span>
                      <span>Compare offers and chat directly with artisans</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                      <span className="text-[var(--ac-gold)]">4.</span>
                      <span>Place your order and track progress</span>
                    </li>
                  </ul>
                </Card>

                <div className="flex items-center justify-center gap-2 text-sm text-[var(--ac-stone)]">
                  <span>Track responses in</span>
                  <Button variant="link" className="p-0 h-auto text-[var(--ac-gold)]">
                    My Concepts
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => onOpenChange(false)} className="w-full">
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AuthPromptModal
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        action="send"
      />
    </>
  );
}
