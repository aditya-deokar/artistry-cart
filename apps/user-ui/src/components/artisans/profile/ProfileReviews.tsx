'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { Star, ThumbsUp, Check, ChevronDown, ChevronUp } from 'lucide-react';

// Mock reviews data
const mockReviews = [
    {
        id: '1',
        author: 'Sarah Mitchell',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        rating: 5,
        date: '2 weeks ago',
        product: 'Handcrafted Ceramic Vase',
        review:
            'Absolutely stunning piece! The craftsmanship is impeccable, and it arrived beautifully packaged. Maria was so helpful with my custom color request. This is now the centerpiece of my living room.',
        helpful: 24,
        verified: true,
    },
    {
        id: '2',
        author: 'James Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 5,
        date: '1 month ago',
        product: 'Artisan Bowl Set',
        review:
            'These bowls are works of art. Each one is unique and the glazing is gorgeous. Worth every penny for pieces that will last generations.',
        helpful: 18,
        verified: true,
    },
    {
        id: '3',
        author: 'Emma Thompson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 4,
        date: '1 month ago',
        product: 'Custom Commission',
        review:
            'Great communication throughout the commission process. The final piece was beautiful, though it took a bit longer than expected. Still, quality takes time and the wait was worth it.',
        helpful: 12,
        verified: true,
    },
    {
        id: '4',
        author: 'Michael Ross',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 5,
        date: '2 months ago',
        product: 'Statement Tea Set',
        review:
            'I bought this as a gift for my mother and she absolutely loves it. The attention to detail is remarkable. Will definitely be ordering more from Maria.',
        helpful: 31,
        verified: true,
    },
];

interface ProfileReviewsProps {
    artisanId?: string;
    artisanName?: string;
}

export function ProfileReviews({
    artisanId,
    artisanName = 'this artisan',
}: ProfileReviewsProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [expandedReview, setExpandedReview] = useState<string | null>(null);
    const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Entrance animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.review-card', {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Calculate aggregated stats
    const totalReviews = mockReviews.length;
    const averageRating =
        mockReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: mockReviews.filter((r) => r.rating === rating).length,
        percentage:
            (mockReviews.filter((r) => r.rating === rating).length / totalReviews) *
            100,
    }));

    const toggleHelpful = (reviewId: string) => {
        setHelpfulReviews((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(reviewId)) {
                newSet.delete(reviewId);
            } else {
                newSet.add(reviewId);
            }
            return newSet;
        });
    };

    const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 3);

    return (
        <div ref={sectionRef} className="space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-start gap-8">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="text-5xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            {averageRating.toFixed(1)}
                        </span>
                        <Star className="w-8 h-8 fill-[var(--ac-gold)] text-[var(--ac-gold)]" />
                    </div>
                    <p className="text-sm text-[var(--ac-stone)] mt-1">
                        Based on {totalReviews} reviews
                    </p>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 space-y-2">
                    {ratingDistribution.map(({ rating, percentage }) => (
                        <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm text-[var(--ac-stone)] w-8">
                                {rating}★
                            </span>
                            <div className="flex-1 h-2 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] overflow-hidden">
                                <div
                                    className="h-full bg-[var(--ac-gold)]"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs text-[var(--ac-stone)] w-10">
                                {Math.round(percentage)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {displayedReviews.map((review) => (
                    <div
                        key={review.id}
                        className="review-card p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                    >
                        {/* Review Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                    src={review.avatar}
                                    alt={review.author}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {review.author}
                                    </h4>
                                    {review.verified && (
                                        <span className="flex items-center gap-1 text-xs text-[var(--ac-gold)]">
                                            <Check className="w-3 h-3" />
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < review.rating
                                                        ? 'fill-[var(--ac-gold)] text-[var(--ac-gold)]'
                                                        : 'text-[var(--ac-linen)] dark:text-[var(--ac-slate)]'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[var(--ac-stone)]">
                                        {review.date}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Product */}
                        <p className="text-xs text-[var(--ac-gold)] mb-2">
                            Purchased: {review.product}
                        </p>

                        {/* Review Text */}
                        <p
                            className={`text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] leading-relaxed ${expandedReview === review.id ? '' : 'line-clamp-3'
                                }`}
                        >
                            {review.review}
                        </p>

                        {review.review.length > 200 && (
                            <button
                                onClick={() =>
                                    setExpandedReview(
                                        expandedReview === review.id ? null : review.id
                                    )
                                }
                                className="text-sm text-[var(--ac-gold)] hover:underline mt-2"
                            >
                                {expandedReview === review.id ? 'Show less' : 'Read more'}
                            </button>
                        )}

                        {/* Helpful */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <button
                                onClick={() => toggleHelpful(review.id)}
                                className={`flex items-center gap-2 text-sm transition-colors ${helpfulReviews.has(review.id)
                                        ? 'text-[var(--ac-gold)]'
                                        : 'text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)]'
                                    }`}
                            >
                                <ThumbsUp
                                    className={`w-4 h-4 ${helpfulReviews.has(review.id) ? 'fill-current' : ''
                                        }`}
                                />
                                Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More */}
            {mockReviews.length > 3 && (
                <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full py-3 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm tracking-wider uppercase hover:bg-[var(--ac-charcoal)] hover:text-[var(--ac-ivory)] dark:hover:bg-[var(--ac-pearl)] dark:hover:text-[var(--ac-obsidian)] transition-colors flex items-center justify-center gap-2"
                >
                    {showAllReviews ? (
                        <>
                            Show Less <ChevronUp className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            View All Reviews ({totalReviews}) <ChevronDown className="w-4 h-4" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
