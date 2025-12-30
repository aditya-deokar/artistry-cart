'use client';

import { useState, useRef } from 'react';
import { SectionContainer } from '../ui/SectionContainer';
import { ModeSelector, GenerationMode } from './ModeSelector';
import { TextGenerationMode } from './Mode1_TextGeneration';
import { ProductVariationMode } from './Mode2_ProductVariation';
import { VisualSearchMode } from './Mode3_VisualSearch';
import { ConceptResults } from './Results';
import { LoadingState } from './LoadingState';
import { SendToArtisansModal } from '../artisan-collaboration/SendToArtisansModal';
import { gsap } from 'gsap';
import { useAIGeneration, useSchemaData, useConceptActions } from '@/hooks/useAIVision';
import type { TextToImageParams, ProductVariationParams } from '@/types/aivision';

export function AIGenerator() {
    const [activeMode, setActiveMode] = useState<GenerationMode>('text');
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Use the AI Vision hooks
    const {
        isGenerating,
        progress,
        concepts,
        currentConceptId,
        error,
        setMode,
        generateFromText,
        generateVariation,
        clear,
    } = useAIGeneration();

    // Load schema data on mount
    const { categories, materials, styles, isLoaded: schemaLoaded } = useSchemaData();

    // Concept actions
    const { save, findSimilar, isLoading: actionLoading } = useConceptActions();

    const handleModeChange = (mode: GenerationMode) => {
        if (isGenerating) return;

        // Animate transition
        if (contentRef.current) {
            gsap.to(contentRef.current, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                onComplete: () => {
                    setActiveMode(mode);
                    setMode(mode);
                    clear(); // Clear results on mode switch
                    gsap.to(contentRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        delay: 0.1,
                    });
                },
            });
        } else {
            setActiveMode(mode);
            setMode(mode);
        }
    };

    const handleTextGenerate = async (data: TextToImageParams) => {
        const success = await generateFromText(data);

        if (success) {
            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.getElementById('results-section');
                resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const handleProductVariation = async (data: { productId: string; modifications: string; adjustments?: ProductVariationParams['adjustments'] }) => {
        const success = await generateVariation({
            productId: data.productId,
            modifications: data.modifications,
            adjustments: data.adjustments,
        });

        if (success) {
            setTimeout(() => {
                const resultsElement = document.getElementById('results-section');
                resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const handleVisualSearch = async (data: { image: File | string; action: 'search' | 'generate' }) => {
        // For visual search, we'll use a different flow
        // This will be implemented when we connect to the search API
        console.log('Visual search:', data);
        // TODO: Implement visual search integration
    };

    const handleConceptAction = async (action: string, id: string) => {
        switch (action) {
            case 'save':
                const saved = await save(id);
                if (saved) {
                    // Show success toast
                    console.log('Concept saved successfully');
                }
                break;
            case 'refine':
                // TODO: Open refine modal
                console.log('Refine concept:', id);
                break;
            case 'find_similar':
                const concept = concepts.find(c => c.id === id);
                if (concept?.imageUrl) {
                    const similar = await findSimilar(concept.imageUrl);
                    console.log('Similar concepts:', similar);
                    // TODO: Show similar concepts modal
                }
                break;
            default:
                console.log(`Action: ${action} on concept: ${id}`);
        }
    };

    const handleSendToArtisans = (ids: string[]) => {
        if (ids.length > 0) {
            setSelectedConceptId(currentConceptId);
            setSendModalOpen(true);
        }
    };

    const handleNewGeneration = () => {
        clear();
    };

    return (
        <SectionContainer id="ai-generator" className="min-h-screen bg-gradient-to-b from-[var(--av-obsidian)] to-[var(--av-onyx)]">
            <div className="text-center mb-12">
                <h2 className="text-h2 text-[var(--av-pearl)] mb-4">
                    Start Creating
                </h2>
                <p className="text-[var(--av-silver)] max-w-2xl mx-auto">
                    Choose how you want to begin. Describe your idea, modify an existing product,
                    or search with an image.
                </p>
            </div>

            <ModeSelector activeMode={activeMode} onChange={handleModeChange} />

            <div ref={contentRef} className="min-h-[400px]">
                {/* Error Display */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={handleNewGeneration}
                            className="text-sm text-[var(--av-gold)] hover:underline mt-2"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!isGenerating && concepts.length === 0 && (
                    <>
                        {activeMode === 'text' && (
                            <TextGenerationMode
                                onGenerate={handleTextGenerate}
                                categories={categories}
                                materials={materials}
                                styles={styles}
                                isSchemaLoaded={schemaLoaded}
                            />
                        )}
                        {activeMode === 'product-variation' && (
                            <ProductVariationMode onGenerate={handleProductVariation} />
                        )}
                        {activeMode === 'visual-search' && (
                            <VisualSearchMode onGenerate={handleVisualSearch} />
                        )}
                    </>
                )}

                {isGenerating && <LoadingState progress={progress} />}

                {!isGenerating && concepts.length > 0 && (
                    <div id="results-section">
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={handleNewGeneration}
                                className="text-sm text-[var(--av-gold)] hover:underline flex items-center gap-2"
                            >
                                ← Start New Generation
                            </button>
                        </div>
                        <ConceptResults
                            concepts={concepts}
                            onAction={handleConceptAction}
                            onSendToArtisans={handleSendToArtisans}
                            isActionLoading={actionLoading}
                        />
                    </div>
                )}
            </div>

            {/* Send to Artisans Modal */}
            <SendToArtisansModal
                isOpen={sendModalOpen}
                onClose={() => setSendModalOpen(false)}
                conceptId={selectedConceptId}
                conceptTitle={concepts[0]?.title || 'Your Concept'}
            />
        </SectionContainer>
    );
}
