'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import {
    MapPin,
    Star,
    BadgeCheck,
    MessageCircle,
    Heart,
    Share2,
    ChevronRight,
    Package,
    Users,
    Award,
    Clock,
    ArrowLeft,
    Image as ImageIcon,
    MessageSquare,
    Mail,
} from 'lucide-react';
import type { Artisan } from '@/components/artisans/ArtisanCard';
import { ProfileGallery, ProfileReviews, ProfileContact } from '@/components/artisans/profile';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ArtisanDetailClientProps {
    artisan: Artisan;
}

// Extended artisan data (mock - replace with API data)
const artisanExtendedData = {
    bio: `With over 20 years of experience, I've dedicated my life to preserving traditional techniques while embracing contemporary aesthetics. Each piece I create tells a story of heritage, craftsmanship, and the enduring beauty of handmade art.

My journey began in my grandmother's workshop, where I learned to respect the materials and the patience required to transform raw elements into treasured objects. Today, I continue that legacy, creating pieces that connect the past with the present.`,
    philosophy: `I believe that every handcrafted piece carries the energy and intention of its maker. My work is a meditation—a careful balance between tradition and innovation, always respecting the material and the process.`,
    awards: [
        { year: '2023', title: 'Master Artisan Certification', org: 'European Craft Council' },
        { year: '2022', title: 'Innovation in Traditional Craft', org: 'Artistry Awards' },
        { year: '2019', title: 'Best in Show', org: 'International Craft Fair' },
    ],
    process: [
        { title: 'Selection', description: 'Carefully sourcing the finest natural materials' },
        { title: 'Preparation', description: 'Traditional preparation methods passed down generations' },
        { title: 'Creation', description: 'Hours of focused, meditative craftsmanship' },
        { title: 'Finishing', description: 'Meticulous attention to every detail' },
    ],
    stats: {
        yearsActive: 12,
        happyCustomers: 2500,
        customOrders: 350,
        averageRating: 4.9,
    },
    socialLinks: {
        instagram: '#',
        website: '#',
    },
};

// Mock products data
const mockProducts = [
    {
        id: '1',
        name: 'Handcrafted Ceramic Vase',
        price: 189,
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    },
    {
        id: '2',
        name: 'Artisan Bowl Set',
        price: 245,
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    },
    {
        id: '3',
        name: 'Decorative Planter',
        price: 156,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    },
    {
        id: '4',
        name: 'Statement Tea Set',
        price: 320,
        image: 'https://images.unsplash.com/photo-1594125311687-3b1b2c0a2f65?w=400&h=400&fit=crop',
    },
    {
        id: '5',
        name: 'Minimalist Pitcher',
        price: 135,
        image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&h=400&fit=crop',
    },
    {
        id: '6',
        name: 'Sculptural Vessel',
        price: 420,
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    },
];

export function ArtisanDetailClient({ artisan }: ArtisanDetailClientProps) {
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Entrance animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Hero parallax
            gsap.to('.hero-image', {
                yPercent: 20,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            // Content entrance
            gsap.from('.content-section', {
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: contentRef.current,
                    start: 'top 85%',
                },
            });

            // Products grid
            gsap.from('.product-card', {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.products-section',
                    start: 'top 80%',
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            {/* Hero Section */}
            <div ref={heroRef} className="relative h-[70vh] min-h-[600px] overflow-hidden">
                {/* Background Image */}
                <div className="hero-image absolute inset-0">
                    <Image
                        src={artisan.image}
                        alt={artisan.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ac-charcoal)] via-[var(--ac-charcoal)]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--ac-charcoal)]/60 to-transparent" />
                </div>

                {/* Back Button */}
                <Link
                    href="/artisans"
                    className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-[var(--ac-charcoal)]/50 backdrop-blur-sm text-[var(--ac-pearl)] text-sm hover:bg-[var(--ac-charcoal)]/70 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Artisans
                </Link>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-16">
                    <div className="max-w-7xl mx-auto">
                        {/* Craft Tag */}
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold-dark)] mb-4 font-medium">
                            {artisan.craft}
                        </p>

                        {/* Name & Title */}
                        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl text-[var(--ac-pearl)] mb-2">
                            {artisan.name}
                        </h1>
                        <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-silver)] italic mb-6">
                            {artisan.title}
                        </p>

                        {/* Location & Verification */}
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="flex items-center gap-2 text-[var(--ac-silver)]">
                                <MapPin className="w-4 h-4" />
                                {artisan.location}
                            </span>
                            {artisan.isVerified && (
                                <span className="flex items-center gap-1 text-[var(--ac-gold-dark)]">
                                    <BadgeCheck className="w-4 h-4" />
                                    Verified Artisan
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[var(--ac-silver)]">
                                <Star className="w-4 h-4 fill-[var(--ac-gold-dark)] text-[var(--ac-gold-dark)]" />
                                {artisan.rating.toFixed(1)} ({artisan.reviewCount} reviews)
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button className="group flex items-center gap-2 px-6 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm tracking-wider uppercase font-medium transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                Contact Artisan
                            </button>
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`flex items-center gap-2 px-6 py-3 border text-sm tracking-wider uppercase font-medium transition-colors ${isWishlisted
                                    ? 'border-[var(--ac-gold)] bg-[var(--ac-gold)]/10 text-[var(--ac-gold)]'
                                    : 'border-[var(--ac-pearl)]/30 text-[var(--ac-pearl)] hover:border-[var(--ac-pearl)]'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                {isWishlisted ? 'Following' : 'Follow'}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-3 border border-[var(--ac-pearl)]/30 text-[var(--ac-pearl)] hover:border-[var(--ac-pearl)] transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div ref={contentRef} className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* About Section */}
                        <section className="content-section">
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                                About the Artisan
                            </h2>
                            <div className="prose prose-lg max-w-none text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                {artisanExtendedData.bio.split('\n\n').map((paragraph, i) => (
                                    <p key={i} className="mb-4 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </section>

                        {/* Philosophy */}
                        <section className="content-section">
                            <blockquote className="relative p-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-l-4 border-[var(--ac-gold)]">
                                <span className="absolute top-2 left-4 text-6xl text-[var(--ac-gold)]/20 font-serif">
                                    "
                                </span>
                                <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] italic leading-relaxed">
                                    {artisanExtendedData.philosophy}
                                </p>
                            </blockquote>
                        </section>

                        {/* Process Section */}
                        <section className="content-section">
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-8">
                                The Craft Process
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {artisanExtendedData.process.map((step, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]"
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-[var(--ac-gold)]/10 text-[var(--ac-gold)] font-medium">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Awards */}
                        <section className="content-section">
                            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-8">
                                Recognition & Awards
                            </h2>
                            <div className="space-y-4">
                                {artisanExtendedData.awards.map((award, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] last:border-0"
                                    >
                                        <Award className="w-6 h-6 text-[var(--ac-gold)]" />
                                        <div className="flex-1">
                                            <h3 className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-medium">
                                                {award.title}
                                            </h3>
                                            <p className="text-sm text-[var(--ac-stone)]">
                                                {award.org}
                                            </p>
                                        </div>
                                        <span className="text-sm text-[var(--ac-gold)]">{award.year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8">
                        {/* Stats Card */}
                        <div className="content-section sticky top-24 p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-6">
                                At a Glance
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] text-center">
                                    <Clock className="w-5 h-5 text-[var(--ac-gold)] mx-auto mb-2" />
                                    <p className="text-2xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {artisanExtendedData.stats.yearsActive}
                                    </p>
                                    <p className="text-xs text-[var(--ac-stone)]">Years Active</p>
                                </div>
                                <div className="p-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] text-center">
                                    <Package className="w-5 h-5 text-[var(--ac-gold)] mx-auto mb-2" />
                                    <p className="text-2xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {artisan.productCount}
                                    </p>
                                    <p className="text-xs text-[var(--ac-stone)]">Creations</p>
                                </div>
                                <div className="p-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] text-center">
                                    <Users className="w-5 h-5 text-[var(--ac-gold)] mx-auto mb-2" />
                                    <p className="text-2xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {artisanExtendedData.stats.happyCustomers.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-[var(--ac-stone)]">Happy Customers</p>
                                </div>
                                <div className="p-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] text-center">
                                    <Star className="w-5 h-5 text-[var(--ac-gold)] mx-auto mb-2" />
                                    <p className="text-2xl font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        {artisanExtendedData.stats.averageRating}
                                    </p>
                                    <p className="text-xs text-[var(--ac-stone)]">Avg Rating</p>
                                </div>
                            </div>

                            {/* CTA */}
                            <button className="w-full mt-6 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm tracking-wider uppercase font-medium transition-colors">
                                Request Custom Order
                            </button>
                        </div>

                        {/* Response Time */}
                        <div className="content-section p-4 bg-[var(--ac-gold)]/10 border border-[var(--ac-gold)]/20">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-[var(--ac-gold)]" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                        Usually responds within 24 hours
                                    </p>
                                    <p className="text-xs text-[var(--ac-stone)]">
                                        Accepts custom orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <section className="products-section py-20 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                                Creations
                            </p>
                            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                Shop {artisan.name.split(' ')[0]}'s Work
                            </h2>
                        </div>
                        <Link
                            href={`/products?artisan=${artisan.id}`}
                            className="hidden md:flex items-center gap-2 text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:text-[var(--ac-gold)] transition-colors"
                        >
                            View all products
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mockProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="product-card group"
                            >
                                <div className="relative aspect-square overflow-hidden bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mb-3">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-sm text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-sm font-medium text-[var(--ac-gold)] mt-1">
                                    ${product.price}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile View All */}
                    <Link
                        href={`/products?artisan=${artisan.id}`}
                        className="md:hidden flex items-center justify-center gap-2 mt-10 py-3 border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm tracking-wider uppercase hover:bg-[var(--ac-charcoal)] hover:text-[var(--ac-ivory)] dark:hover:bg-[var(--ac-pearl)] dark:hover:text-[var(--ac-obsidian)] transition-colors"
                    >
                        View all products
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-20 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                            Portfolio
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            Studio Gallery
                        </h2>
                    </div>
                    <ProfileGallery artisanId={artisan.id} />
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-20 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                            Testimonials
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            What Collectors Say
                        </h2>
                    </div>
                    <ProfileReviews artisanId={artisan.id} artisanName={artisan.name} />
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-[var(--ac-linen)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-10">
                        <p className="text-xs tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
                            Connect
                        </p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                            Get in Touch
                        </h2>
                    </div>
                    <ProfileContact
                        artisanId={artisan.id}
                        artisanName={artisan.name}
                        responseTime="Usually responds within 24 hours"
                        acceptsCustom={true}
                        socialLinks={artisanExtendedData.socialLinks}
                    />
                </div>
            </section>
        </div>
    );
}

