'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useStore, type CartItem } from '@/store';
import { formatPrice } from '@/lib/formatters';

interface WishlistDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Wishlist Item Component
function WishlistItem({
    item,
    onRemove,
    onMoveToCart,
}: {
    item: CartItem;
    onRemove: (productId: string) => void;
    onMoveToCart: (item: CartItem) => void;
}) {
    const primaryImage = item.images?.find((img) => img !== null);
    const price = item.pricing?.finalPrice || item.sale_price || item.regular_price;
    const originalPrice = item.regular_price;
    const hasDiscount = price !== originalPrice;
    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="group flex gap-4 py-4 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
        >
            {/* Product Image */}
            <Link
                href={`/product/${item.slug}`}
                className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]"
            >
                {primaryImage ? (
                    <Image
                        src={primaryImage.url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[var(--ac-stone)]" />
                    </div>
                )}
                {/* Discount Badge */}
                {hasDiscount && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold bg-red-500 text-white">
                        -{discountPercent}%
                    </span>
                )}
            </Link>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    <Link
                        href={`/product/${item.slug}`}
                        className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] transition-colors duration-300 line-clamp-2"
                    >
                        {item.title}
                    </Link>
                    {item.Shop?.name && (
                        <p className="text-xs text-[var(--ac-stone)] mt-0.5">by {item.Shop.name}</p>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                        {formatPrice(price)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-[var(--ac-stone)] line-through">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => onMoveToCart(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] transition-colors duration-200 rounded"
                    >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1.5 text-[var(--ac-stone)] hover:text-red-500 transition-colors duration-200"
                        aria-label="Remove from wishlist"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Empty Wishlist State
function EmptyWishlist({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="w-20 h-20 rounded-full bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-[var(--ac-stone)]" strokeWidth={1} />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Your Wishlist is Empty
            </h3>
            <p className="text-sm text-[var(--ac-stone)] max-w-[220px] mb-6">
                Save your favorite artisan creations here for later.
            </p>
            <Link href="/product" onClick={onClose}>
                <Button className="group bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] transition-all duration-300">
                    Explore Products
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
    );
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
    const wishlist = useStore((state) => state.wishlist);
    const removeFromWishlist = useStore((state) => state.actions.removeFromWishlist);
    const addToCart = useStore((state) => state.actions.addToCart);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleRemove = (productId: string) => {
        // Note: The full signature requires user, location, deviceInfo for analytics
        removeFromWishlist(productId, null, null, '');
    };

    const handleMoveToCart = (item: CartItem) => {
        // Add to cart and remove from wishlist
        addToCart(item, null, null, '');
        removeFromWishlist(item.id, null, null, '');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-[var(--ac-gold)]" fill="currentColor" />
                                <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    Wishlist
                                </h2>
                                {wishlist.length > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--ac-gold)] text-white rounded-full">
                                        {wishlist.length}
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hover:bg-[var(--ac-gold)]/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Wishlist Items */}
                        {wishlist.length === 0 ? (
                            <EmptyWishlist onClose={onClose} />
                        ) : (
                            <>
                                {/* Scrollable Items List */}
                                <div className="flex-1 overflow-y-auto px-6">
                                    <AnimatePresence mode="popLayout">
                                        {wishlist.map((item) => (
                                            <WishlistItem
                                                key={item.id}
                                                item={item}
                                                onRemove={handleRemove}
                                                onMoveToCart={handleMoveToCart}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] px-6 py-5 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                                    {/* Summary */}
                                    <div className="flex items-center justify-between text-sm mb-4">
                                        <span className="text-[var(--ac-stone)]">
                                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                                        </span>
                                        <span className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium">
                                            Total: {formatPrice(
                                                wishlist.reduce((sum, item) => {
                                                    const price = item.pricing?.finalPrice || item.sale_price || item.regular_price;
                                                    return sum + price;
                                                }, 0)
                                            )}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => {
                                                wishlist.forEach((item) => {
                                                    addToCart(item, null, null, '');
                                                    removeFromWishlist(item.id, null, null, '');
                                                });
                                            }}
                                            className="w-full h-12 group bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-sm font-medium tracking-wide transition-all duration-300"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Add All to Cart
                                        </Button>
                                        <Link href="/wishlist" onClick={onClose} className="block">
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:bg-[var(--ac-charcoal)] dark:hover:bg-[var(--ac-pearl)] hover:text-[var(--ac-pearl)] dark:hover:text-[var(--ac-charcoal)] text-sm font-medium tracking-wide transition-all duration-300"
                                            >
                                                View Full Wishlist
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Share hint */}
                                    <p className="mt-4 text-center text-xs text-[var(--ac-stone)]">
                                        💝 Share your wishlist with friends and family
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
