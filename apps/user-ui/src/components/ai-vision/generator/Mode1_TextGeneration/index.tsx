'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Sparkles, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextGenerationModeProps {
    onGenerate: (data: { prompt: string; category?: string }) => void;
}

export function TextGenerationMode({ onGenerate }: TextGenerationModeProps) {
    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState('');
    const [charCount, setCharCount] = useState(0);

    const formRef = useRef<HTMLFormElement>(null);

    useGSAP(
        () => {
            if (!formRef.current) return;

            gsap.fromTo(
                formRef.current.children,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power2.out',
                }
            );
        },
        { scope: formRef }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ prompt, category });
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= 500) {
            setPrompt(text);
            setCharCount(text.length);
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto"
        >
            {/* Main Prompt Input */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                    ✨ Describe Your Vision
                </label>
                <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="E.g., A handcrafted ceramic vase with a matte midnight blue glaze and gold leaf accents, organic shape, 12 inches tall..."
                    className="w-full h-32 bg-[var(--av-slate)] text-[var(--av-pearl)] placeholder:text-[var(--av-ash)] rounded-lg p-4 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] focus:ring-4 focus:ring-[var(--av-gold)]/10 outline-none transition-all resize-none text-base"
                    required
                />
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-[var(--av-silver)]">
                        Be as detailed or abstract as you like
                    </span>
                    <span className={cn(
                        'text-xs',
                        charCount > 450 ? 'text-[var(--av-warning)]' : 'text-[var(--av-silver)]'
                    )}>
                        {charCount} / 500
                    </span>
                </div>
            </div>

            {/* Optional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Category */}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none"
                >
                    <option value="">Category</option>
                    <option value="art">Art & Prints</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="home-decor">Home Decor</option>
                    <option value="furniture">Furniture</option>
                </select>

                {/* Style */}
                <select className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none">
                    <option value="">Style</option>
                    <option value="modern">Modern</option>
                    <option value="rustic">Rustic</option>
                    <option value="minimalist">Minimalist</option>
                </select>

                {/* Material */}
                <select className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none">
                    <option value="">Material</option>
                    <option value="wood">Wood</option>
                    <option value="ceramic">Ceramic</option>
                    <option value="metal">Metal</option>
                </select>

                {/* Price Range */}
                <select className="bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none">
                    <option value="">Price Range</option>
                    <option value="0-100">Under $100</option>
                    <option value="100-250">$100 - $250</option>
                    <option value="250+">$250+</option>
                </select>
            </div>

            {/* Reference Image Upload (Optional) */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                    📎 Upload Reference Image (Optional)
                </label>
                <div className="border-2 border-dashed border-[var(--av-silver)]/30 rounded-lg p-6 text-center hover:border-[var(--av-gold)]/50 transition-colors cursor-pointer group">
                    <Upload className="mx-auto mb-2 text-[var(--av-silver)] group-hover:text-[var(--av-gold)] transition-colors" size={32} />
                    <p className="text-sm text-[var(--av-silver)] mb-1">
                        Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-[var(--av-ash)]">
                        JPG, PNG, WEBP (max 10MB)
                    </p>
                </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
                <PremiumButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    glow
                    icon={<Sparkles size={20} />}
                    disabled={prompt.length < 10}
                >
                    Generate Concepts
                </PremiumButton>
            </div>
        </form>
    );
}
