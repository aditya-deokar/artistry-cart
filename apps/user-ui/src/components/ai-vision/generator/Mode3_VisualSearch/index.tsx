'use client';

import { useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Upload, Search, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface VisualSearchModeProps {
    onGenerate: (data: { image: File | string; action: 'search' | 'generate' }) => void;
}

export function VisualSearchMode({ onGenerate }: VisualSearchModeProps) {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageUrl, setImageUrl] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setUploadedImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
    });

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setUploadedImage(null);
        setImagePreview('');
    };

    useGSAP(
        () => {
            if (!containerRef.current) return;

            gsap.fromTo(
                containerRef.current.children,
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
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-2xl font-semibold text-[var(--av-pearl)] mb-2">
                    🔍 Find Products With an Image
                </h3>
                <p className="text-[var(--av-silver)]">
                    Upload a photo. We'll find it in our catalog or help you create a
                    custom version.
                </p>
            </div>

            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer group',
                    isDragActive
                        ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/5 scale-[1.02]'
                        : 'border-[var(--av-silver)]/30 hover:border-[var(--av-gold)]/50 bg-[var(--av-slate)]'
                )}
            >
                <input {...getInputProps()} />

                {imagePreview ? (
                    <div className="relative inline-block group/preview">
                        <img
                            src={imagePreview}
                            alt="Uploaded preview"
                            className="max-w-[200px] max-h-[200px] mx-auto rounded-lg shadow-lg object-contain"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-[var(--av-error)] text-white rounded-full p-1 opacity-0 group-hover/preview:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                        <p className="text-sm text-[var(--av-silver)] mt-4">
                            ✓ Image uploaded • Click or drag to change
                        </p>
                    </div>
                ) : (
                    <div className="pointer-events-none">
                        <ImageIcon className="mx-auto mb-4 text-[var(--av-silver)] group-hover:text-[var(--av-gold)] transition-colors" size={48} />
                        <p className="text-lg text-[var(--av-pearl)] mb-2">
                            {isDragActive ? (
                                'Drop your image here'
                            ) : (
                                '📷 Drag & Drop Image Here'
                            )}
                        </p>
                        <p className="text-sm text-[var(--av-silver)]">
                            or click to browse
                        </p>
                        <p className="text-xs text-[var(--av-ash)] mt-4">
                            Supports: JPG, PNG, WEBP (max 10MB)
                        </p>
                    </div>
                )}
            </div>

            {/* OR Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--av-silver)]/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--av-obsidian)] px-4 text-[var(--av-silver)]">
                        Or
                    </span>
                </div>
            </div>

            {/* URL Input */}
            <div>
                <label className="block text-sm font-semibold text-[var(--av-pearl)] mb-3">
                    Paste Image URL
                </label>
                <div className="flex gap-3">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none transition-colors"
                    />
                    <PremiumButton variant="secondary" size="md">
                        Load
                    </PremiumButton>
                </div>
            </div>

            {/* Action Buttons */}
            {(uploadedImage || imageUrl) && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in pt-4">
                    <PremiumButton
                        variant="primary"
                        size="lg"
                        glow
                        icon={<Search size={20} />}
                        onClick={() =>
                            onGenerate({ image: uploadedImage || imageUrl, action: 'search' })
                        }
                    >
                        🔍 Search Our Products
                    </PremiumButton>

                    <PremiumButton
                        variant="secondary"
                        size="lg"
                        icon={<Sparkles size={20} />}
                        onClick={() =>
                            onGenerate({ image: uploadedImage || imageUrl, action: 'generate' })
                        }
                    >
                        ✨ Generate Similar
                    </PremiumButton>
                </div>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-[var(--av-silver)] space-y-2">
                <p>💡 Works with Pinterest images, product photos, or even sketches</p>
                <p>⚡ AI analyzes shape, color, style, and materials</p>
            </div>
        </div>
    );
}
