'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

import { NavLogo } from './NavLogo';
import { NavLinks } from './NavLinks';
import { NavActions } from './NavActions';
import { MobileMenu } from './MobileMenu';
import { NavMegaMenu } from './NavMegaMenu';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { SearchOverlay } from './SearchOverlay';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface NavigationProps {
    variant?: 'floating' | 'split' | 'minimal';
    transparent?: boolean;
    hideOnScroll?: boolean;
    showProgress?: boolean;
    className?: string;
}

export function Navigation({
    variant = 'floating',
    transparent = true,
    hideOnScroll = true,
    showProgress = false,
    className = '',
}: NavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [shopHovered, setShopHovered] = useState(false);

    const headerRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();
    const { scrollY } = useScroll();

    // Close all overlays on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsSearchOpen(false);
        setShopHovered(false);
    }, [pathname]);

    // Handle shop hover with delay for better UX
    const handleShopHover = (isHovered: boolean) => {
        if (megaMenuTimeoutRef.current) {
            clearTimeout(megaMenuTimeoutRef.current);
        }

        if (isHovered) {
            setShopHovered(true);
        } else {
            // Small delay before closing to allow moving to mega menu
            megaMenuTimeoutRef.current = setTimeout(() => {
                setShopHovered(false);
            }, 150);
        }
    };

    // Scroll detection using Framer Motion
    useMotionValueEvent(scrollY, 'change', (latest) => {
        const previous = scrollY.getPrevious() || 0;

        // Hide/show on scroll direction
        if (hideOnScroll) {
            if (latest > previous && latest > 150) {
                setHidden(true);
                setShopHovered(false); // Close mega menu on scroll
            } else {
                setHidden(false);
            }
        }

        // Background change threshold
        if (latest > 50) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    });

    // Scroll progress animation
    useLayoutEffect(() => {
        if (!showProgress || !progressRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to(progressRef.current, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.3,
                },
            });
        });

        return () => ctx.revert();
    }, [showProgress]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (megaMenuTimeoutRef.current) {
                clearTimeout(megaMenuTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <motion.header
                ref={headerRef}
                variants={{
                    visible: { y: 0 },
                    hidden: { y: '-100%' },
                }}
                animate={hidden ? 'hidden' : 'visible'}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${scrolled
                    ? 'bg-[var(--ac-ivory)]/90 dark:bg-[var(--ac-obsidian)]/90 backdrop-blur-xl border-b border-[var(--ac-linen)]/50 dark:border-[var(--ac-slate)]/50 py-3 shadow-sm'
                    : transparent
                        ? 'bg-transparent py-5 lg:py-6'
                        : 'bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] py-5 lg:py-6'
                    } ${className}`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <NavLogo scrolled={scrolled} />

                        {/* Desktop Navigation - Floating Pill */}
                        {variant === 'floating' && (
                            <div className="hidden lg:flex flex-1 items-center justify-center px-8">
                                <NavLinks onShopHover={handleShopHover} />
                            </div>
                        )}

                        {/* Actions */}
                        <NavActions
                            onMenuClick={() => setIsMenuOpen(true)}
                            onCartClick={() => setIsCartOpen(true)}
                            onWishlistClick={() => setIsWishlistOpen(true)}
                            onSearchClick={() => setIsSearchOpen(true)}
                        />
                    </div>
                </div>

                {/* Scroll Progress Bar */}
                {showProgress && (
                    <div
                        ref={progressRef}
                        className="absolute bottom-0 left-0 h-px w-full bg-[var(--ac-gold)] origin-left"
                        style={{ transform: 'scaleX(0)' }}
                    />
                )}
            </motion.header>

            {/* Mobile Menu */}
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Shop Mega Menu */}
            <NavMegaMenu
                isOpen={shopHovered}
                onClose={() => setShopHovered(false)}
                onMouseEnter={() => handleShopHover(true)}
            />

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Wishlist Drawer */}
            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

