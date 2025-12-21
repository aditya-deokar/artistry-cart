'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP with React
gsap.registerPlugin(useGSAP);

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onMouseEnter?: () => void;
}

// Data
const defaultCategories = [
    { name: 'All Products', href: '/product', count: 500 },
    { name: 'Art & Prints', href: '/product?category=art', count: 156 },
    { name: 'Jewelry', href: '/product?category=jewelry', count: 89 },
    { name: 'Home & Living', href: '/product?category=home', count: 124 },
    { name: 'Fashion', href: '/product?category=fashion', count: 78 },
    { name: 'Ceramics', href: '/product?category=ceramics', count: 53 },
];

const defaultProducts = [
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

const defaultArtisan = {
    name: 'Elena Petrova',
    craft: 'Master Jeweler',
    quote: '"Every piece tells a story of tradition and passion."',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop&q=80',
    href: '/artisans/elena',
};

export function MegaMenu({
    isOpen,
    onClose,
    onMouseEnter,
}: MegaMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close menu on route change
    useGSAP(() => {
        onClose();
    }, { dependencies: [pathname] });

    // Handle open/close animations with useGSAP
    useGSAP(() => {
        if (!menuRef.current) return;

        const container = menuRef.current;
        const items = contentRef.current
            ? Array.from(contentRef.current.children) as HTMLElement[]
            : [];

        if (isOpen) {
            // Kill any existing animations
            gsap.killTweensOf(container);
            if (items.length) gsap.killTweensOf(items);

            // Create opening animation timeline
            const tl = gsap.timeline();

            tl.set(container, {
                autoAlpha: 1,
                clipPath: 'inset(0% 0% 100% 0%)',
            });

            tl.to(container, {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.45,
                ease: 'power3.inOut',
            });

            if (items.length) {
                tl.set(items, { y: 20, autoAlpha: 0 }, 0);
                tl.to(
                    items,
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 0.35,
                        stagger: 0.04,
                        ease: 'power2.out',
                    },
                    '-=0.25'
                );
            }
        } else {
            // Close animation
            gsap.killTweensOf(container);

            gsap.to(container, {
                clipPath: 'inset(0% 0% 100% 0%)',
                duration: 0.3,
                ease: 'power3.in',
                onComplete: () => {
                    gsap.set(container, { autoAlpha: 0 });
                },
            });
        }
    }, {
        dependencies: [isOpen],
        scope: menuRef
    });

    return (
        <>
            {/* Backdrop Area - only visible when open */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Bridge for hover continuity - Higher Z-index to sit above Header */}
            {isOpen && (
                <div
                    className="fixed left-0 right-0 z-[61] top-[60px] h-[40px]"
                    onMouseEnter={onMouseEnter}
                />
            )}

            {/* Menu Container */}
            <div
                ref={menuRef}
                className="fixed left-0 right-0 z-50 top-[80px] bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] shadow-xl overflow-hidden"
                style={{ opacity: 0, visibility: 'hidden' }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onClose}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div ref={contentRef} className="grid grid-cols-4 gap-12">
                        {/* Column 1: Categories */}
                        <div>
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--ac-gold)] mb-6">
                                Collections
                            </h3>
                            <ul className="space-y-3">
                                {defaultCategories.map((category) => (
                                    <li key={category.name}>
                                        <Link
                                            href={category.href}
                                            className="group flex items-center justify-between text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                                            onClick={onClose}
                                        >
                                            <span className="font-light text-base group-hover:translate-x-1 transition-transform duration-300">{category.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/product"
                                className="group inline-flex items-center gap-2 mt-8 text-sm font-bold text-[var(--ac-gold)] hover:text-[var(--ac-gold-dark)] transition-colors duration-300"
                                onClick={onClose}
                            >
                                <span>View All</span>
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Column 2: Featured Products */}
                        <div className="col-span-1">
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--ac-gold)] mb-6">
                                Curated Picks
                            </h3>
                            <div className="space-y-6">
                                {defaultProducts.map((product, index) => (
                                    <Link
                                        key={index}
                                        href={product.href}
                                        className="group flex gap-4 items-center"
                                        onClick={onClose}
                                    >
                                        <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-[var(--ac-cream)]">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] tracking-wider uppercase text-[var(--ac-stone)] mb-1">
                                                {product.artisan}
                                            </p>
                                            <p className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-[var(--ac-stone)] mt-1">{product.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Column 3: Artisan Spotlight */}
                        <div className="col-span-1">
                            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--ac-gold)] mb-6">
                                Artisan of the Month
                            </h3>
                            <Link href={defaultArtisan.href} className="group block" onClick={onClose}>
                                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-4">
                                    <Image
                                        src={defaultArtisan.image}
                                        alt={defaultArtisan.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                                <h4 className="font-[family-name:var(--font-playfair)] text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors">
                                    {defaultArtisan.name}
                                </h4>
                                <p className="text-xs uppercase tracking-wider text-[var(--ac-stone)] mt-1">{defaultArtisan.craft}</p>
                            </Link>
                        </div>

                        {/* Column 4: Visual Promotion */}
                        <div className="relative h-full min-h-[300px] rounded-lg overflow-hidden group">
                            <Image
                                src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=800&fit=crop&q=80"
                                alt="Collection"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                            <div className="absolute bottom-6 left-6 text-white p-4 backdrop-blur-md bg-white/10 rounded-lg border border-white/20">
                                <p className="text-xs font-bold tracking-widest uppercase mb-2">New Arrival</p>
                                <p className="font-[family-name:var(--font-playfair)] text-xl">Winter Solstice</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
