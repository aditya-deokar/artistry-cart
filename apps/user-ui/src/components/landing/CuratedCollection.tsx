'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface Product {
    id: string;
    name: string;
    artisan: string;
    price: number;
    image: string;
    href: string;
}

interface CuratedCollectionProps {
    eyebrow?: string;
    headline?: string;
    products?: Product[];
}

const defaultProducts: Product[] = [
    {
        id: '1',
        name: 'Hand-thrown Ceramic Vase',
        artisan: 'Studio Nomad',
        price: 185,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=800&fit=crop&q=80',
        href: '/product/ceramic-vase',
    },
    {
        id: '2',
        name: 'Woven Wool Tapestry',
        artisan: 'Maya Textiles',
        price: 320,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&q=80',
        href: '/product/wool-tapestry',
    },
    {
        id: '3',
        name: 'Brass Pendant Light',
        artisan: 'Forge & Flame',
        price: 450,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=800&fit=crop&q=80',
        href: '/product/brass-pendant',
    },
    {
        id: '4',
        name: 'Oak Writing Desk',
        artisan: 'Grain Workshop',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=800&fit=crop&q=80',
        href: '/product/oak-desk',
    },
    {
        id: '5',
        name: 'Handwoven Linen Throw',
        artisan: 'Nordic Loom',
        price: 165,
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=800&fit=crop&q=80',
        href: '/product/linen-throw',
    },
    {
        id: '6',
        name: 'Sterling Silver Ring',
        artisan: 'Aurelia Jewels',
        price: 280,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop&q=80',
        href: '/product/silver-ring',
    },
];

export function CuratedCollection({
    eyebrow = "Editor's Picks",
    headline = "Curated for the Discerning",
    products = defaultProducts,
}: CuratedCollectionProps) {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const productsRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(headerRef.current, { opacity: 0, y: 40 });

            const productCards = productsRef.current?.querySelectorAll('.product-card');
            if (productCards) {
                gsap.set(productCards, { opacity: 0, y: 60 });
            }

            // Header animation
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(headerRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });
                },
            });

            // Products staggered animation
            if (productCards) {
                ScrollTrigger.create({
                    trigger: productsRef.current,
                    start: 'top 80%',
                    onEnter: () => {
                        gsap.to(productCards, {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            stagger: 0.1,
                            ease: 'power3.out',
                        });
                    },
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 lg:py-40 px-6 md:px-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16">
                    <div>
                        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-4 font-medium">
                            {eyebrow}
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                            {headline}
                        </h2>
                    </div>

                    <Link
                        href="/product"
                        className="group mt-6 md:mt-0 inline-flex items-center gap-3 text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] dark:hover:text-[var(--ac-gold-dark)] transition-colors duration-300"
                    >
                        <span className="text-sm tracking-[0.15em] uppercase font-medium">
                            View All
                        </span>
                        <svg
                            className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Products Grid */}
                <div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={product.href}
                            className="product-card group"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />

                                {/* Quick View overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                                    <span className="px-6 py-3 bg-white/90 dark:bg-black/80 text-xs tracking-[0.2em] uppercase font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        Quick View
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-1">
                                <p className="text-xs tracking-[0.15em] uppercase text-[var(--ac-stone)] font-medium">
                                    {product.artisan}
                                </p>
                                <h3 className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] dark:group-hover:text-[var(--ac-gold-dark)] transition-colors duration-300">
                                    {product.name}
                                </h3>
                                <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] font-light">
                                    ${product.price.toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
