'use client';

import { useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Category {
    name: string;
    href: string;
    count?: number;
}

interface FeaturedProduct {
    name: string;
    artisan: string;
    price: string;
    image: string;
    href: string;
    badge?: string;
}

interface FeaturedArtisan {
    name: string;
    craft: string;
    quote: string;
    image: string;
    href: string;
}

interface NavMegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onMouseEnter?: () => void;
    categories?: Category[];
    featuredProducts?: FeaturedProduct[];
    featuredArtisan?: FeaturedArtisan;
}

const defaultCategories: Category[] = [
    { name: 'All Products', href: '/product', count: 500 },
    { name: 'Art & Prints', href: '/product?category=art', count: 156 },
    { name: 'Jewelry', href: '/product?category=jewelry', count: 89 },
    { name: 'Home & Living', href: '/product?category=home', count: 124 },
    { name: 'Fashion', href: '/product?category=fashion', count: 78 },
    { name: 'Ceramics', href: '/product?category=ceramics', count: 53 },
];

const defaultProducts: FeaturedProduct[] = [
    {
        name: 'Handwoven Wall Tapestry',
        artisan: 'Maria Santos',
        price: '$289',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop&q=80',
        href: '/product/1',
        badge: 'Best Seller',
    },
    {
        name: 'Ceramic Vase Set',
        artisan: 'Kenji Tanaka',
        price: '$175',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=400&fit=crop&q=80',
        href: '/product/2',
        badge: 'New',
    },
];

const defaultArtisan: FeaturedArtisan = {
    name: 'Elena Petrova',
    craft: 'Master Jeweler',
    quote: '"Every piece tells a story of tradition and passion."',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop&q=80',
    href: '/artisans/elena',
};

export function NavMegaMenu({
    isOpen,
    onClose,
    onMouseEnter,
    categories = defaultCategories,
    featuredProducts = defaultProducts,
    featuredArtisan = defaultArtisan,
}: NavMegaMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        if (!isOpen || !menuRef.current) return;

        const ctx = gsap.context(() => {
            // Staggered column reveal
            gsap.fromTo(
                columnsRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: 'power3.out',
                }
            );
        }, menuRef);

        return () => ctx.revert();
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Invisible hover bridge - connects nav to mega menu */}
                    <div
                        className="fixed left-0 right-0 z-50 top-[48px] h-[28px]"
                        onMouseEnter={onMouseEnter}
                    />

                    {/* Menu */}
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed left-0 right-0 z-50 top-[72px] bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] shadow-xl"
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onClose}
                    >
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="grid grid-cols-4 gap-8">
                                {/* Column 1: Categories */}
                                <div
                                    ref={(el) => {
                                        if (el) columnsRef.current[0] = el;
                                    }}
                                >
                                    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ac-stone)] mb-4">
                                        Categories
                                    </h3>
                                    <ul className="space-y-2">
                                        {categories.map((category) => (
                                            <li key={category.name}>
                                                <Link
                                                    href={category.href}
                                                    className="group flex items-center justify-between py-2 text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                                                    onClick={onClose}
                                                >
                                                    <span className="font-light">{category.name}</span>
                                                    {category.count && (
                                                        <span className="text-xs text-[var(--ac-stone)] group-hover:text-[var(--ac-gold)] transition-colors duration-300">
                                                            ({category.count})
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* View All Link */}
                                    <Link
                                        href="/product"
                                        className="group inline-flex items-center gap-2 mt-6 text-sm font-medium text-[var(--ac-gold)] hover:text-[var(--ac-gold-dark)] transition-colors duration-300"
                                        onClick={onClose}
                                    >
                                        <span>View All Products</span>
                                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>

                                {/* Column 2: Featured Products */}
                                <div
                                    ref={(el) => {
                                        if (el) columnsRef.current[1] = el;
                                    }}
                                >
                                    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ac-stone)] mb-4">
                                        Top Picks
                                    </h3>
                                    <div className="space-y-4">
                                        {featuredProducts.map((product, index) => (
                                            <Link
                                                key={index}
                                                href={product.href}
                                                className="group flex gap-4"
                                                onClick={onClose}
                                            >
                                                {/* Image */}
                                                <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="80px"
                                                    />
                                                    {product.badge && (
                                                        <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[var(--ac-gold)] text-white">
                                                            {product.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-[10px] tracking-wider uppercase text-[var(--ac-stone)] mb-1">
                                                        {product.artisan}
                                                    </p>
                                                    <p className="text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors duration-300 font-medium line-clamp-1">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mt-1">
                                                        {product.price}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 3: Featured Artisan */}
                                <div
                                    ref={(el) => {
                                        if (el) columnsRef.current[2] = el;
                                    }}
                                >
                                    <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ac-stone)] mb-4">
                                        Artisan Spotlight
                                    </h3>
                                    <Link
                                        href={featuredArtisan.href}
                                        className="group block"
                                        onClick={onClose}
                                    >
                                        {/* Portrait */}
                                        <div className="relative w-full aspect-square max-w-[160px] overflow-hidden mb-4">
                                            <Image
                                                src={featuredArtisan.image}
                                                alt={featuredArtisan.name}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                sizes="160px"
                                            />
                                        </div>

                                        {/* Info */}
                                        <p className="font-[family-name:var(--font-playfair)] text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors duration-300">
                                            {featuredArtisan.name}
                                        </p>
                                        <p className="text-xs tracking-wider uppercase text-[var(--ac-stone)] mt-1">
                                            {featuredArtisan.craft}
                                        </p>
                                        <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] italic mt-3 line-clamp-2">
                                            {featuredArtisan.quote}
                                        </p>

                                        {/* CTA */}
                                        <span className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[var(--ac-gold)] group-hover:text-[var(--ac-gold-dark)] transition-colors duration-300">
                                            <span>Visit Studio</span>
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                </div>

                                {/* Column 4: Featured Image */}
                                <div
                                    ref={(el) => {
                                        if (el) columnsRef.current[3] = el;
                                    }}
                                    className="relative overflow-hidden"
                                >
                                    <Link href="/product" className="group block h-full" onClick={onClose}>
                                        <div className="relative h-full min-h-[280px] overflow-hidden">
                                            <Image
                                                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop&q=80"
                                                alt="Featured Collection"
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="300px"
                                            />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                            {/* Content */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <p className="text-xs tracking-wider uppercase text-white/70 mb-2">
                                                    New Collection
                                                </p>
                                                <p className="font-[family-name:var(--font-playfair)] text-xl text-white mb-3">
                                                    Winter Artistry
                                                </p>
                                                <span className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-[var(--ac-gold)] transition-colors duration-300">
                                                    <span>Explore Now</span>
                                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
