'use client';

import { useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumButton } from '../../ui/PremiumButton';
import { Upload, Search, Sparkles, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { useVisualSearch } from '@/hooks/useAIVision';

interface VisualSearchModeProps {
    onGenerate: (data: { image: File | string; action: 'search' | 'generate' }) => void;
}

export function VisualSearchMode({ onGenerate }: VisualSearchModeProps) {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageBase64, setImageBase64] = useState<string>('');

    const containerRef = useRef<HTMLDivElement>(null);

    // Use visual search hook
    const { results, isSearching, error, searchByImage, hybridSearch, clear } = useVisualSearch();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setUploadedImage(file);
            setImageUrl(''); // Clear URL if file is uploaded

            // Create preview and base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
                // Extract base64 data (remove data:image/xxx;base64, prefix)
                const base64Data = result.split(',')[1];
                setImageBase64(base64Data);
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
        setImageBase64('');
        clear();
    };

    const loadImageFromUrl = async () => {
        if (!imageUrl) return;

        try {
            // Just set the URL - the API will fetch it
            setImagePreview(imageUrl);
            setUploadedImage(null);
            setImageBase64('');
        } catch (err) {
            console.error('Failed to load image from URL:', err);
        }
    };

    const handleSearch = async () => {
        if (imageBase64) {
            await searchByImage({ imageBase64 });
        } else if (imageUrl) {
            await searchByImage({ imageUrl });
        }
        onGenerate({ image: uploadedImage || imageUrl, action: 'search' });
    };

    const handleGenerateSimilar = async () => {
        // For generate similar, we might use hybrid search or similar concepts
        if (imageBase64) {
            await hybridSearch({
                imageUrl: imagePreview,
                query: 'similar products',
            });
        } else if (imageUrl) {
            await hybridSearch({
                imageUrl,
                query: 'similar products',
            });
        }
        onGenerate({ image: uploadedImage || imageUrl, action: 'generate' });
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

    const hasImage = uploadedImage || imageUrl;

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
                            className="absolute -top-2 -right-2 bg-[var(--av-error)] text-white rounded-full p-1 opacity-0 group-hover/preview:opacity-100 transition-opacity hover:scale-110"
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
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            setUploadedImage(null);
                            setImagePreview('');
                            setImageBase64('');
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 bg-[var(--av-slate)] text-[var(--av-pearl)] rounded-lg border-2 border-[var(--av-silver)]/20 focus:border-[var(--av-gold)] outline-none transition-colors"
                    />
                    <PremiumButton
                        variant="secondary"
                        size="md"
                        onClick={loadImageFromUrl}
                        disabled={!imageUrl}
                    >
                        Load
                    </PremiumButton>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Search Results Preview */}
            {results.length > 0 && (
                <div className="bg-[var(--av-slate)] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-[var(--av-pearl)] mb-4">
                        Found {results.length} Similar Products
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {results.slice(0, 4).map((result) => (
                            <div key={result.id} className="bg-[var(--av-onyx)] rounded-lg p-3">
                                <div className="aspect-square bg-[var(--av-slate)] rounded mb-2 flex items-center justify-center">
                                    {result.thumbnail ? (
                                        <img
                                            src={result.thumbnail}
                                            alt={result.title}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    ) : (
                                        <ImageIcon className="text-[var(--av-silver)]" size={24} />
                                    )}
                                </div>
                                <p className="text-xs text-[var(--av-pearl)] truncate">{result.title}</p>
                                <p className="text-xs text-[var(--av-gold)] font-mono">${result.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {hasImage && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in pt-4">
                    <PremiumButton
                        variant="primary"
                        size="lg"
                        glow
                        icon={isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching ? 'Searching...' : '🔍 Search Our Products'}
                    </PremiumButton>

                    <PremiumButton
                        variant="secondary"
                        size="lg"
                        icon={<Sparkles size={20} />}
                        onClick={handleGenerateSimilar}
                        disabled={isSearching}
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
