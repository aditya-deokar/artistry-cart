'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface FooterLink {
    label: string;
    href: string;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
    {
        title: 'Shop',
        links: [
            { label: 'All Products', href: '/product' },
            { label: 'New Arrivals', href: '/product?sort=newest' },
            { label: 'Best Sellers', href: '/product?sort=popular' },
            { label: 'Gift Cards', href: '/gift-cards' },
        ],
    },
    {
        title: 'Artisans',
        links: [
            { label: 'Become a Seller', href: '/become-seller' },
            { label: 'Artisan Stories', href: '/artisans' },
            { label: 'Commission Work', href: '/commissions' },
            { label: 'AI Vision Studio', href: '/ai-vision' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'FAQ', href: '/faq' },
            { label: 'Shipping', href: '/shipping' },
            { label: 'Returns', href: '/returns' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Journal', href: '/journal' },
            { label: 'Sustainability', href: '/sustainability' },
            { label: 'Press', href: '/press' },
        ],
    },
];

const socialLinks = [
    {
        name: 'Instagram',
        href: 'https://instagram.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        ),
    },
    {
        name: 'Pinterest',
        href: 'https://pinterest.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>
        ),
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        name: 'YouTube',
        href: 'https://youtube.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
];

export function Footer() {
    const containerRef = useRef<HTMLElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set(topRef.current, { opacity: 0, y: 30 });
            gsap.set(bottomRef.current, { opacity: 0 });

            const columns = columnsRef.current?.querySelectorAll('.footer-column');
            if (columns) {
                gsap.set(columns, { opacity: 0, y: 30 });
            }

            // Animations
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 90%',
                onEnter: () => {
                    gsap.to(topRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                    });

                    if (columns) {
                        gsap.to(columns, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.1,
                            delay: 0.2,
                            ease: 'power3.out',
                        });
                    }

                    gsap.to(bottomRef.current, {
                        opacity: 1,
                        duration: 0.6,
                        delay: 0.6,
                        ease: 'power3.out',
                    });
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer
            ref={containerRef}
            className="relative bg-[var(--ac-charcoal)] dark:bg-[var(--ac-obsidian)] text-[var(--ac-pearl)]"
        >
            {/* Newsletter Section */}
            <div ref={topRef} className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="max-w-md">
                            <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-3">
                                Join Our Community
                            </h3>
                            <p className="text-[var(--ac-silver)] font-light">
                                Receive artisan stories, new arrivals, and exclusive offers.
                            </p>
                        </div>

                        <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 md:w-80 px-5 py-4 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--ac-gold)] transition-colors duration-300 text-sm"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-[var(--ac-gold)] text-[var(--ac-charcoal)] text-sm tracking-[0.15em] uppercase font-semibold hover:bg-[var(--ac-gold-dark)] transition-colors duration-300"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
                <div ref={columnsRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12">
                    {/* Brand Column */}
                    <div className="footer-column col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
                        <Link href="/" className="inline-block mb-6">
                            <span className="font-[family-name:var(--font-playfair)] text-2xl text-white">
                                Artistry Cart
                            </span>
                        </Link>
                        <p className="text-sm text-[var(--ac-silver)] leading-relaxed mb-6 max-w-xs">
                            Where imagination meets craftsmanship. Connecting creative visionaries with skilled artisans worldwide.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--ac-silver)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {footerColumns.map((column) => (
                        <div key={column.title} className="footer-column">
                            <h4 className="text-xs tracking-[0.2em] uppercase font-medium mb-6 text-white">
                                {column.title}
                            </h4>
                            <ul className="space-y-4">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[var(--ac-silver)] hover:text-white transition-colors duration-300"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div ref={bottomRef} className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-[var(--ac-stone)]">
                        <p>© {new Date().getFullYear()} Artistry Cart. All rights reserved.</p>

                        <div className="flex flex-wrap items-center gap-6">
                            <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors duration-300">
                                Terms of Service
                            </Link>
                            <Link href="/cookies" className="hover:text-white transition-colors duration-300">
                                Cookie Policy
                            </Link>

                            {/* Currency Selector */}
                            <select className="bg-transparent border border-white/20 px-3 py-1.5 text-[var(--ac-silver)] focus:outline-none focus:border-[var(--ac-gold)] cursor-pointer">
                                <option value="USD">USD $</option>
                                <option value="EUR">EUR €</option>
                                <option value="GBP">GBP £</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
