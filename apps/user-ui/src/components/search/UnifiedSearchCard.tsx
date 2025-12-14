'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Package,
    Store,
    Star,
    Tag,
    ArrowRight,
    ShoppingCart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/formatters';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import WishlistButton from '../products/WishlistButton';

// Unified product type that covers all search contexts
export interface UnifiedProduct {
    id: string;
    slug: string;
    title: string;
    images?: { url: string }[];
    current_price?: number;
    regular_price?: number;
    sale_price?: number;
    is_on_discount?: boolean;
    category?: string;
    ratings?: number;
    stock?: number;
    Shop?: {
        name: string;
        slug: string;
        avatar?: { url: string } | null;
    } | null;
}

export interface UnifiedSearchCardProps {
    product: UnifiedProduct;
    variant?: 'compact' | 'minimal' | 'grid';
    index?: number;
    onClick?: () => void;
    showAddToCart?: boolean;
    showWishlist?: boolean;
}

// Animation variants
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export const UnifiedSearchCard: React.FC<UnifiedSearchCardProps> = ({
    product,
    variant = 'compact',
    index = 0,
    onClick,
    showAddToCart = false,
    showWishlist = false,
}) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Store hooks for add to cart
    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const cartItems = useStore((state) => state.cart);
    const { addToCart } = useStore((state) => state.actions);

    const isInCart = cartItems.some((item) => item.id === product.id);
    const imageUrl = product.images?.[0]?.url || null;
    const price = product.sale_price ?? product.current_price ?? product.regular_price ?? 0;

    const discountPercent = product.is_on_discount && product.regular_price && product.current_price
        ? Math.round(((product.regular_price - product.current_price) / product.regular_price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isInCart && product.stock && product.stock > 0) {
            addToCart(
                {
                    ...product,
                    quantity: 1,
                    sale_price: price,
                } as any,
                user,
                location,
                deviceInfo
            );
        }
    };

    // Compact variant - for live search dropdown
    if (variant === 'compact') {
        return (
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.03 }}
            >
                <Link
                    href={`/product/${product.slug}`}
                    onClick={onClick}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all group relative overflow-hidden hover:bg-muted/50 dark:hover:bg-muted/30"
                >
                    {/* Product Image */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted dark:bg-muted/50 flex-shrink-0 border border-border/30 group-hover:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className={cn(
                                    "object-cover transition-all duration-300 group-hover:scale-110",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() => setImageLoaded(true)}
                                sizes="56px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <Package size={20} />
                            </div>
                        )}

                        {/* Discount badge */}
                        {discountPercent > 0 && (
                            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                -{discountPercent}%
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-primary">
                                {formatPrice(price)}
                            </span>
                            {product.is_on_discount && product.regular_price && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.regular_price)}
                                </span>
                            )}
                        </div>
                        {product.Shop && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                by {product.Shop.name}
                            </p>
                        )}
                    </div>

                    {/* Arrow indicator */}
                    <ArrowRight
                        size={16}
                        className="flex-shrink-0 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-200"
                    />
                </Link>
            </motion.div>
        );
    }

    // Minimal variant - for GlobalSearch modal
    if (variant === 'minimal') {
        return (
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
            >
                <Link
                    href={`/product/${product.slug}`}
                    onClick={onClick}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all group relative overflow-hidden hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border/30"
                >
                    {/* Background Hover Effect */}
                    <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted dark:bg-muted/50 flex-shrink-0 border border-border/30 group-hover:border-primary/50 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:scale-105 z-10">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-500 group-hover:scale-110",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() => setImageLoaded(true)}
                                sizes="80px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <Package size={28} />
                            </div>
                        )}

                        {/* Discount badge */}
                        {discountPercent > 0 && (
                            <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                                -{discountPercent}%
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 z-10">
                        <p className="text-lg font-semibold truncate text-foreground/90 group-hover:text-primary transition-colors duration-300">
                            {product.title}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-lg font-bold text-primary">
                                {formatPrice(price)}
                            </span>
                            {product.is_on_discount && product.regular_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.regular_price)}
                                </span>
                            )}
                            {product.ratings && product.ratings > 0 && (
                                <div className="flex items-center gap-1 text-sm">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-muted-foreground">{product.ratings.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {product.Shop && (
                            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                                <Store size={14} />
                                <span className="truncate">{product.Shop.name}</span>
                            </div>
                        )}

                        {product.category && (
                            <Badge variant="outline" className="mt-2 text-xs">
                                {product.category}
                            </Badge>
                        )}
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary z-10">
                        <ArrowRight size={24} />
                    </div>
                </Link>
            </motion.div>
        );
    }

    // Grid variant - for search results page
    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
            className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col"
        >
            {/* Image Container */}
            <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted dark:bg-muted/50">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className={cn(
                            "object-cover transition-all duration-500 group-hover:scale-110",
                            imageLoaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setImageLoaded(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package size={48} />
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discountPercent > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground shadow-lg backdrop-blur-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            -{discountPercent}%
                        </Badge>
                    )}
                </div>

                {/* Wishlist Button */}
                {showWishlist && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <WishlistButton
                            product={product as any}
                            productId={product.id}
                        />
                    </div>
                )}

                {/* Quick Add Button */}
                {showAddToCart && (
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-full backdrop-blur-sm shadow-lg gap-2"
                            onClick={handleAddToCart}
                            disabled={!product.stock || product.stock <= 0 || isInCart}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {isInCart ? "In Cart" : "Add to Cart"}
                        </Button>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Shop Info */}
                {product.Shop && (
                    <Link
                        href={`/shops/${product.Shop.slug}`}
                        className="flex items-center gap-2 mb-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {product.Shop.avatar?.url ? (
                            <div className="relative h-5 w-5 rounded-full overflow-hidden border border-border/30">
                                <Image src={product.Shop.avatar.url} alt={product.Shop.name} fill className="object-cover" />
                            </div>
                        ) : (
                            <Store className="h-4 w-4" />
                        )}
                        <span className="font-medium truncate">{product.Shop.name}</span>
                    </Link>
                )}

                {/* Category */}
                {product.category && (
                    <Badge variant="outline" className="text-xs mb-2 w-fit">
                        {product.category}
                    </Badge>
                )}

                {/* Title */}
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {product.title}
                    </h3>
                </Link>

                {/* Rating */}
                {product.ratings && product.ratings > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.ratings.toFixed(1)}</span>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">
                        {formatPrice(price)}
                    </span>
                    {product.is_on_discount && product.regular_price && (
                        <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.regular_price)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default UnifiedSearchCard;
