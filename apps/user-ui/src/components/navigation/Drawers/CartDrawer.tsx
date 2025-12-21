'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useStore, type CartItem, type DiscountCode } from '@/store';
import { formatPrice } from '@/lib/formatters';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Drawer Item Component
function DrawerCartItem({
    item,
    onUpdateQuantity,
    onRemove,
}: {
    item: CartItem;
    onUpdateQuantity: (productId: string, newQuantity: number) => void;
    onRemove: (productId: string) => void;
}) {
    const primaryImage = item.images?.find((img) => img !== null);
    const price = item.pricing?.finalPrice || item.sale_price || item.regular_price;
    const originalPrice = item.regular_price;
    const hasDiscount = price !== originalPrice;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-4 py-4 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
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
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[var(--ac-stone)]" />
                    </div>
                )}
            </Link>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    <Link
                        href={`/product/${item.slug}`}
                        className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] transition-colors duration-300 line-clamp-1"
                    >
                        {item.title}
                    </Link>
                    {item.Shop?.name && (
                        <p className="text-xs text-[var(--ac-stone)] mt-0.5">by {item.Shop.name}</p>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center rounded border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 flex items-center justify-center rounded border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="ml-2 p-1 text-[var(--ac-stone)] hover:text-red-500 transition-colors duration-200"
                        aria-label="Remove item"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end justify-start text-right">
                <span className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                    {formatPrice(price * item.quantity)}
                </span>
                {hasDiscount && (
                    <span className="text-xs text-[var(--ac-stone)] line-through">
                        {formatPrice(originalPrice * item.quantity)}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// Empty Cart State
function EmptyDrawerCart({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="w-20 h-20 rounded-full bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-[var(--ac-stone)]" strokeWidth={1} />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Your Cart is Empty
            </h3>
            <p className="text-sm text-[var(--ac-stone)] max-w-[200px] mb-6">
                Discover unique artisan creations and add them to your cart.
            </p>
            <Link href="/product" onClick={onClose}>
                <Button className="group bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] transition-all duration-300">
                    Start Shopping
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
    );
}

// Discount Display
function DiscountBadge({ coupon }: { coupon: DiscountCode }) {
    const discountText =
        coupon.discountType === 'PERCENTAGE'
            ? `${coupon.discountValue}% OFF`
            : coupon.discountType === 'FIXED_AMOUNT'
                ? `${formatPrice(coupon.discountValue)} OFF`
                : 'Free Shipping';

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {coupon.publicName}: {discountText}
            </span>
        </div>
    );
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const cart = useStore((state) => state.cart);
    const appliedCoupon = useStore((state) => state.appliedCoupon);
    const updateQuantity = useStore((state) => state.actions.updateQuantity);
    const removeFromCart = useStore((state) => state.actions.removeFromCart);

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

    // Calculate totals
    const { subtotal, discount, total, itemCount } = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => {
            const price = item.pricing?.finalPrice || item.sale_price || item.regular_price;
            return sum + price * item.quantity;
        }, 0);

        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'PERCENTAGE') {
                discount = (subtotal * appliedCoupon.discountValue) / 100;
                if (appliedCoupon.maximumDiscountAmount) {
                    discount = Math.min(discount, appliedCoupon.maximumDiscountAmount);
                }
            } else if (appliedCoupon.discountType === 'FIXED_AMOUNT') {
                discount = appliedCoupon.discountValue;
            }
        }

        const total = Math.max(0, subtotal - discount);
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        return { subtotal, discount, total, itemCount };
    }, [cart, appliedCoupon]);

    const handleRemove = (productId: string) => {
        // Note: The full signature requires user, location, deviceInfo for analytics
        // For drawer, we'll use simplified version
        removeFromCart(productId, null, null, '');
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
                                <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                    Your Cart
                                </h2>
                                {itemCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--ac-gold)] text-white rounded-full">
                                        {itemCount}
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

                        {/* Cart Items */}
                        {cart.length === 0 ? (
                            <EmptyDrawerCart onClose={onClose} />
                        ) : (
                            <>
                                {/* Scrollable Items List */}
                                <div className="flex-1 overflow-y-auto px-6">
                                    <AnimatePresence mode="popLayout">
                                        {cart.map((item, index) => (
                                            <DrawerCartItem
                                                key={item.id}
                                                item={item}
                                                onUpdateQuantity={updateQuantity}
                                                onRemove={handleRemove}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Footer with Totals */}
                                <div className="border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] px-6 py-5 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                                    {/* Applied Coupon */}
                                    {appliedCoupon && (
                                        <div className="mb-4">
                                            <DiscountBadge coupon={appliedCoupon} />
                                        </div>
                                    )}

                                    {/* Totals */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--ac-stone)]">Subtotal</span>
                                            <span className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-green-600 dark:text-green-400">Discount</span>
                                                <span className="text-green-600 dark:text-green-400">
                                                    -{formatPrice(discount)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm text-[var(--ac-stone)]">
                                            <span>Shipping</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                        <div className="pt-2 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] flex items-center justify-between">
                                            <span className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                                Total
                                            </span>
                                            <span className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <Link href="/checkout" onClick={onClose} className="block">
                                            <Button className="w-full h-12 group bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-sm font-medium tracking-wide transition-all duration-300">
                                                <span>Proceed to Checkout</span>
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                            </Button>
                                        </Link>
                                        <Link href="/cart" onClick={onClose} className="block">
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:bg-[var(--ac-charcoal)] dark:hover:bg-[var(--ac-pearl)] hover:text-[var(--ac-pearl)] dark:hover:text-[var(--ac-charcoal)] text-sm font-medium tracking-wide transition-all duration-300"
                                            >
                                                View Full Cart
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Trust Indicators */}
                                    <div className="mt-4 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)] flex items-center justify-center gap-4 text-xs text-[var(--ac-stone)]">
                                        <span>🔒 Secure Checkout</span>
                                        <span>•</span>
                                        <span>Free Returns</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
