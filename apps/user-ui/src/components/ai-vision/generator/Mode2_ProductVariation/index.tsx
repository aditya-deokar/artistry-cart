'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Search, Package, Wand2 } from 'lucide-react';
import { ProductSelector, Product } from './ProductSelector';

interface ProductVariationModeProps {
    onGenerate: (data: { productId: string; modifications: string }) => void;
}

export function ProductVariationMode({ onGenerate }: ProductVariationModeProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modifications, setModifications] = useState('');
    const [quickAdjustments, setQuickAdjustments] = useState({
        changeColor: false,
        adjustSize: false,
        differentMaterial: false,
        styleVariation: false,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            const elements = containerRef.current.querySelectorAll('.animate-in');

            gsap.fromTo(
                elements,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                }
            );
        },
        { scope: containerRef }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProduct) {
            onGenerate({
                productId: selectedProduct.id,
                modifications,
            });
        }
    };

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">
            {/* Step 1: Product Search */}
            <div className="animate-in">
                <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--av-gold)] text-[var(--av-obsidian)] text-sm font-bold">
                        1
                    </span>
                    Select a Base Product
                </h3>

                <div className="bg-[var(--av-slate)] rounded-lg p-6">
                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--av-silver)]" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search our catalog..."
                            className="w-full pl-12 pr-4 py-3 bg-[var(--av-onyx)] text-[var(--av-pearl)] rounded-lg border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none transition-colors"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        {['Jewelry', 'Furniture', 'Art', 'Home Decor', 'Pottery'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSearchQuery(cat)}
                                className="px-4 py-2 bg-[var(--av-onyx)] text-[var(--av-silver)] rounded-full text-sm hover:bg-[var(--av-gold)]/20 hover:text-[var(--av-gold)] transition-colors"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Product Selector Component */}
                    {searchQuery && (
                        <ProductSelector
                            searchQuery={searchQuery}
                            onSelect={setSelectedProduct}
                            selected={selectedProduct}
                        />
                    )}
                </div>
            </div>

            {/* Selected Product Display & Step 2 */}
            {selectedProduct && (
                <div className="animate-in space-y-8">
                    {/* Selected Product Summary */}
                    <div className="bg-[var(--av-slate)] rounded-lg p-6 border-2 border-[var(--av-gold)]/30">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-[var(--av-onyx)] rounded-lg flex items-center justify-center">
                                <Package className="text-[var(--av-gold)]" size={32} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-[var(--av-pearl)]">
                                    {selectedProduct.name}
                                </h4>
                                <p className="text-sm text-[var(--av-silver)]">
                                    by {selectedProduct.artisan}
                                </p>
                                <div className="flex gap-4 mt-2 text-xs text-[var(--av-silver)]">
                                    <span className="bg-[var(--av-onyx)] px-2 py-1 rounded">Style: {selectedProduct.category}</span>
                                    <span className="bg-[var(--av-onyx)] px-2 py-1 rounded">Material: {selectedProduct.material}</span>
                                    <span className="bg-[var(--av-onyx)] px-2 py-1 rounded font-mono text-[var(--av-gold)]">${selectedProduct.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Modifications */}
                    <form onSubmit={handleSubmit}>
                        <h3 className="text-xl font-semibold text-[var(--av-pearl)] mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--av-gold)] text-[var(--av-obsidian)] text-sm font-bold">
                                2
                            </span>
                            What Would You Like to Change?
                        </h3>

                        <div className="bg-[var(--av-slate)] rounded-lg p-6 space-y-6">
                            {/* Text Modifications */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                                    Describe Your Changes
                                </label>
                                <textarea
                                    value={modifications}
                                    onChange={(e) => setModifications(e.target.value)}
                                    placeholder="E.g., Make it taller, with a darker glaze and gold trim around the rim..."
                                    className="w-full h-24 bg-[var(--av-onyx)] text-[var(--av-pearl)] rounded-lg p-4 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none resize-none transition-colors"
                                    required
                                />
                            </div>

                            {/* Quick Adjustments */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                                    Quick Adjustments
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries({
                                        changeColor: 'Change Color',
                                        adjustSize: 'Adjust Size',
                                        differentMaterial: 'Different Material',
                                        styleVariation: 'Style Variation',
                                    }).map(([key, label]) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-3 p-3 bg-[var(--av-onyx)] rounded-lg cursor-pointer hover:bg-[var(--av-onyx)]/70 transition-colors border border-transparent hover:border-[var(--av-gold)]/20"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={quickAdjustments[key as keyof typeof quickAdjustments]}
                                                onChange={(e) =>
                                                    setQuickAdjustments((prev) => ({
                                                        ...prev,
                                                        [key]: e.target.checked,
                                                    }))
                                                }
                                                className="w-5 h-5 rounded border-2 border-[var(--av-gold)] text-[var(--av-gold)] focus:ring-2 focus:ring-[var(--av-gold)]/20"
                                            />
                                            <span className="text-sm text-[var(--av-pearl)]">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="text-center pt-4">
                                <PremiumButton
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    glow
                                    icon={<Wand2 size={20} />}
                                    disabled={!modifications}
                                >
                                    Generate Variations
                                </PremiumButton>
                                <p className="text-xs text-[var(--av-silver)] mt-3">
                                    Uses product schema + AI to create realistic variations
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
