'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Sparkles, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextToImageParams } from '@/types/aivision';

interface TextGenerationModeProps {
    onGenerate: (data: TextToImageParams) => void;
    categories?: string[];
    materials?: string[];
    styles?: string[];
    isSchemaLoaded?: boolean;
}

export function TextGenerationMode({
    onGenerate,
    categories = [],
    materials = [],
    styles = [],
    isSchemaLoaded = false,
}: TextGenerationModeProps) {
    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState('');
    const [style, setStyle] = useState('');
    const [material, setMaterial] = useState('');
    const [imageCount, setImageCount] = useState(4);
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

        const params: TextToImageParams = {
            prompt,
            count: imageCount,
        };

        // Only add optional params if they have values
        if (category) params.category = category;
        if (style) params.style = style;
        if (material) params.material = material;

        onGenerate(params);
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= 500) {
            setPrompt(text);
            setCharCount(text.length);
        }
    };

    // Fallback categories if schema not loaded
    const displayCategories = categories.length > 0 ? categories : [
        'Art & Prints',
        'Jewelry',
        'Home Decor',
        'Furniture',
        'Pottery',
        'Textiles',
    ];

    // Fallback styles if schema not loaded
    const displayStyles = styles.length > 0 ? styles : [
        'Modern',
        'Rustic',
        'Minimalist',
        'Traditional',
        'Bohemian',
        'Contemporary',
    ];

    // Fallback materials if schema not loaded
    const displayMaterials = materials.length > 0 ? materials : [
        'Wood',
        'Ceramic',
        'Metal',
        'Glass',
        'Leather',
        'Fabric',
    ];

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
                <div className="relative">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Category</option>
                        {displayCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {!isSchemaLoaded && categories.length === 0 && (
                        <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--av-silver)] animate-spin" />
                    )}
                </div>

                {/* Style */}
                <div className="relative">
                    <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Style</option>
                        {displayStyles.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Material */}
                <div className="relative">
                    <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Material</option>
                        {displayMaterials.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                {/* Image Count */}
                <div className="relative">
                    <select
                        value={imageCount}
                        onChange={(e) => setImageCount(Number(e.target.value))}
                        className="w-full bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg p-3 border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none appearance-none cursor-pointer"
                    >
                        <option value={2}>2 Concepts</option>
                        <option value={4}>4 Concepts</option>
                        <option value={6}>6 Concepts</option>
                        <option value={8}>8 Concepts</option>
                    </select>
                </div>
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
                <p className="text-xs text-[var(--av-silver)] mt-3">
                    AI will generate {imageCount} unique concept{imageCount > 1 ? 's' : ''} based on your description
                </p>
            </div>
        </form>
    );
}
