'use client';

import { cn } from '@/lib/utils';

// Base skeleton pulse animation
const pulseClass = 'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5';

// Gallery Item Skeleton
export function GalleryItemSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('break-inside-avoid mb-8', className)}>
            <div className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/5">
                {/* Image Placeholder */}
                <div className={cn(pulseClass, 'aspect-[3/4]')} />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <div className={cn(pulseClass, 'w-20 h-6 rounded-full')} />
                </div>

                {/* Content Area */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/90 to-transparent">
                    {/* Category */}
                    <div className={cn(pulseClass, 'w-16 h-3 rounded mb-3')} />

                    {/* Title */}
                    <div className={cn(pulseClass, 'w-full h-5 rounded mb-2')} />
                    <div className={cn(pulseClass, 'w-3/4 h-5 rounded mb-4')} />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className={cn(pulseClass, 'w-24 h-4 rounded')} />
                        <div className={cn(pulseClass, 'w-16 h-4 rounded')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Gallery Grid Skeleton
export function GalleryGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 px-4">
            {Array.from({ length: count }).map((_, i) => (
                <GalleryItemSkeleton key={i} />
            ))}
        </div>
    );
}

// Concept Card Skeleton (for generator results)
export function ConceptCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('bg-[#111] rounded-2xl border border-white/10 overflow-hidden', className)}>
            {/* Image */}
            <div className={cn(pulseClass, 'aspect-square')} />

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Category & Title */}
                <div className={cn(pulseClass, 'w-16 h-3 rounded')} />
                <div className={cn(pulseClass, 'w-full h-5 rounded')} />

                {/* Description */}
                <div className={cn(pulseClass, 'w-full h-12 rounded')} />

                {/* Tags */}
                <div className="flex gap-2">
                    <div className={cn(pulseClass, 'w-16 h-5 rounded-full')} />
                    <div className={cn(pulseClass, 'w-20 h-5 rounded-full')} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <div className={cn(pulseClass, 'flex-1 h-10 rounded-lg')} />
                    <div className={cn(pulseClass, 'flex-1 h-10 rounded-lg')} />
                </div>
            </div>
        </div>
    );
}

// Concept Results Grid Skeleton
export function ConceptResultsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ConceptCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Artisan Card Skeleton
export function ArtisanCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('bg-[#0F0F0F] rounded-2xl border border-white/10 overflow-hidden', className)}>
            {/* Cover */}
            <div className={cn(pulseClass, 'h-32')} />

            {/* Content */}
            <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className={cn(pulseClass, '-mt-16 mb-4 w-24 h-24 rounded-2xl border-4 border-[#0F0F0F]')} />

                {/* Name & Studio */}
                <div className={cn(pulseClass, 'w-3/4 h-6 rounded mb-2')} />
                <div className={cn(pulseClass, 'w-1/2 h-4 rounded mb-4')} />

                {/* Location */}
                <div className={cn(pulseClass, 'w-32 h-4 rounded mb-4')} />

                {/* Specialties */}
                <div className="flex gap-2 mb-6">
                    <div className={cn(pulseClass, 'w-16 h-5 rounded-full')} />
                    <div className={cn(pulseClass, 'w-20 h-5 rounded-full')} />
                    <div className={cn(pulseClass, 'w-14 h-5 rounded-full')} />
                </div>

                {/* Portfolio */}
                <div className="flex gap-2 mb-6">
                    <div className={cn(pulseClass, 'w-16 h-16 rounded-lg')} />
                    <div className={cn(pulseClass, 'w-16 h-16 rounded-lg')} />
                    <div className={cn(pulseClass, 'w-16 h-16 rounded-lg')} />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/5">
                    <div className={cn(pulseClass, 'flex-1 h-10 rounded-lg')} />
                    <div className={cn(pulseClass, 'w-10 h-10 rounded-lg')} />
                </div>
            </div>
        </div>
    );
}

// Artisan Grid Skeleton
export function ArtisanGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ArtisanCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Lightbox Skeleton
export function LightboxSkeleton() {
    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

            <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#0A0A0A] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10">
                {/* Image Section */}
                <div className="w-full md:w-3/5 lg:w-2/3 min-h-[300px]">
                    <div className={cn(pulseClass, 'h-full w-full')} />
                </div>

                {/* Details Section */}
                <div className="w-full md:w-2/5 lg:w-1/3 bg-[#111] p-6 md:p-8 space-y-6">
                    {/* Category */}
                    <div className={cn(pulseClass, 'w-20 h-6 rounded-full')} />

                    {/* Title */}
                    <div className={cn(pulseClass, 'w-full h-8 rounded')} />
                    <div className={cn(pulseClass, 'w-3/4 h-8 rounded')} />

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className={cn(pulseClass, 'w-20 h-5 rounded')} />
                        <div className={cn(pulseClass, 'w-20 h-5 rounded')} />
                    </div>

                    {/* Price */}
                    <div className={cn(pulseClass, 'w-32 h-8 rounded')} />

                    {/* Materials */}
                    <div className="flex gap-2">
                        <div className={cn(pulseClass, 'w-16 h-6 rounded-full')} />
                        <div className={cn(pulseClass, 'w-20 h-6 rounded-full')} />
                    </div>

                    {/* Status */}
                    <div className={cn(pulseClass, 'w-full h-24 rounded-xl')} />

                    {/* Button */}
                    <div className={cn(pulseClass, 'w-full h-12 rounded-lg')} />
                </div>
            </div>
        </div>
    );
}

// Form Input Skeleton
export function FormInputSkeleton({ label = true }: { label?: boolean }) {
    return (
        <div className="space-y-2">
            {label && <div className={cn(pulseClass, 'w-20 h-4 rounded')} />}
            <div className={cn(pulseClass, 'w-full h-10 rounded-lg')} />
        </div>
    );
}

// Section Header Skeleton
export function SectionHeaderSkeleton() {
    return (
        <div className="text-center space-y-4 mb-12">
            <div className={cn(pulseClass, 'w-32 h-8 rounded-full mx-auto')} />
            <div className={cn(pulseClass, 'w-96 max-w-full h-12 rounded mx-auto')} />
            <div className={cn(pulseClass, 'w-80 max-w-full h-6 rounded mx-auto')} />
        </div>
    );
}
