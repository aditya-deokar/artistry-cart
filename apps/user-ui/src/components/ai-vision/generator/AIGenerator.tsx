'use client';

import { useState, useRef } from 'react';
import { SectionContainer } from '../ui/SectionContainer';
import { ModeSelector, GenerationMode } from './ModeSelector';
import { TextGenerationMode } from './Mode1_TextGeneration';
import { ProductVariationMode } from './Mode2_ProductVariation';
import { VisualSearchMode } from './Mode3_VisualSearch';
import { ConceptResults } from './Results';
import { LoadingState } from './LoadingState';
import { Concept } from './Results/ConceptCard';
import { gsap } from 'gsap';

export function AIGenerator() {
    const [activeMode, setActiveMode] = useState<GenerationMode>('text');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedConcepts, setGeneratedConcepts] = useState<Concept[]>([]);
    const contentRef = useRef<HTMLDivElement>(null);

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
                    setGeneratedConcepts([]); // Clear results on mode switch
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
        }
    };

    const handleGenerate = async (data: any) => {
        setIsGenerating(true);
        setGeneratedConcepts([]);

        // Simulate API call
        console.log('Generating with data:', data);

        setTimeout(() => {
            // Mock results
            const mockResults: Concept[] = [
                {
                    id: 'c1',
                    title: activeMode === 'text' ? 'Ethereal Vase' : 'Variation A',
                    description: 'A stunning handcrafted piece utilizing matte finishes and gold leaf accents.',
                    imageUrl: '', // Will show fallback icon
                    category: 'Home Decor',
                },
                {
                    id: 'c2',
                    title: activeMode === 'text' ? 'Ethereal Vase II' : 'Variation B',
                    description: 'Alternative design with a more elongated form and darker tones.',
                    imageUrl: '',
                    category: 'Home Decor',
                },
                {
                    id: 'c3',
                    title: activeMode === 'text' ? 'Ethereal Vase III' : 'Variation C',
                    description: 'Minimalist approach focusing on organic curves and negative space.',
                    imageUrl: '',
                    category: 'Home Decor',
                },
                {
                    id: 'c4',
                    title: activeMode === 'text' ? 'Ethereal Vase IV' : 'Variation D',
                    description: 'Geometric interpretation with sharp angles and high-contrast glazing.',
                    imageUrl: '',
                    category: 'Home Decor',
                },
            ];

            setGeneratedConcepts(mockResults);
            setIsGenerating(false);

            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.getElementById('results-section');
                resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        }, 2500);
    };

    const handleConceptAction = (action: string, id: string) => {
        console.log(`Action: ${action} on concept: ${id}`);
    };

    const handleSendToArtisans = (ids: string[]) => {
        console.log('Sending to artisans:', ids);
        alert('Concepts sent to matched artisans!');
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
                {!isGenerating && generatedConcepts.length === 0 && (
                    <>
                        {activeMode === 'text' && (
                            <TextGenerationMode onGenerate={handleGenerate} />
                        )}
                        {activeMode === 'product-variation' && (
                            <ProductVariationMode onGenerate={handleGenerate} />
                        )}
                        {activeMode === 'visual-search' && (
                            <VisualSearchMode onGenerate={handleGenerate} />
                        )}
                    </>
                )}

                {isGenerating && <LoadingState />}

                {!isGenerating && generatedConcepts.length > 0 && (
                    <div id="results-section">
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setGeneratedConcepts([])}
                                className="text-sm text-[var(--av-gold)] hover:underline flex items-center gap-2"
                            >
                                ← Start New Generation
                            </button>
                        </div>
                        <ConceptResults
                            concepts={generatedConcepts}
                            onAction={handleConceptAction}
                            onSendToArtisans={handleSendToArtisans}
                        />
                    </div>
                )}
            </div>
        </SectionContainer>
    );
}
