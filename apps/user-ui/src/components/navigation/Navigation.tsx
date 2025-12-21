'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useScroll, useMotionValueEvent, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Components
import { DesktopNav } from './_components/DesktopNav';
import { Logo } from './_components/Logo';
import { NavActions } from './_components/NavActions';

// Features
import { MegaMenu } from './MegaMenu/MegaMenu';
import { MobileMenu } from './MobileMenu/MobileMenu';
import { CartDrawer } from './Drawers/CartDrawer';
import { WishlistDrawer } from './Drawers/WishlistDrawer';
import { SearchOverlay } from './Search/SearchOverlay';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

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
    // UI State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Navigation State
    const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);

    // Refs
    const headerRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const pathname = usePathname();
    const { scrollY } = useScroll();

    // Reset all on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsSearchOpen(false);
        setActiveNavItem(null);
    }, [pathname]);

    // Handle Hover Logic
    const handleNavHover = (item: string | null) => {
        if (navTimeoutRef.current) {
            clearTimeout(navTimeoutRef.current);
            navTimeoutRef.current = null;
        }

        if (item) {
            setActiveNavItem(item);
        } else {
            // Buffer time to allow moving between nav and menu
            // Increased to 250ms to prevent accidental closing on gaps
            navTimeoutRef.current = setTimeout(() => {
                setActiveNavItem(null);
            }, 250);
        }
    };

    // Scroll Logic
    useMotionValueEvent(scrollY, 'change', (latest) => {
        const previous = scrollY.getPrevious() || 0;

        // Hide/Show logic
        if (hideOnScroll) {
            if (latest > previous && latest > 150) {
                setHidden(true);
                setActiveNavItem(null); // Close menu when scrolling down
            } else {
                setHidden(false);
            }
        }

        // Style logic
        setScrolled(latest > 50);
    });

    // Scroll Progress with useGSAP
    useGSAP(() => {
        if (!showProgress || !progressRef.current) return;

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
    }, {
        dependencies: [showProgress],
        scope: headerRef
    });

    // Cleanup
    useEffect(() => {
        return () => {
            if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
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
                className={`fixed top-0 inset-x-0 z-[60] w-full transition-all duration-300 ${scrolled
                    ? 'bg-[var(--ac-ivory)]/90 dark:bg-[var(--ac-obsidian)]/90 backdrop-blur-xl border-b border-[var(--ac-linen)]/50 dark:border-[var(--ac-slate)]/50 py-3 shadow-sm'
                    : transparent
                        ? 'bg-transparent py-5 lg:py-6'
                        : 'bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] py-5 lg:py-6'
                    } ${className}`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Logo scrolled={scrolled} />

                        {/* Desktop Navigation */}
                        {variant === 'floating' && (
                            <div className="hidden lg:flex flex-1 items-center justify-center px-8">
                                <DesktopNav
                                    activeItem={activeNavItem}
                                    onNavHover={handleNavHover}
                                />
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

                {/* Progress Bar */}
                {showProgress && (
                    <div
                        ref={progressRef}
                        className="absolute bottom-0 left-0 h-px w-full bg-[var(--ac-gold)] origin-left"
                        style={{ transform: 'scaleX(0)' }}
                    />
                )}
            </motion.header>

            {/* Overlays & Drawers */}
            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />

            <MegaMenu
                isOpen={activeNavItem === 'Shop'}
                onClose={() => handleNavHover(null)}
                onMouseEnter={() => handleNavHover('Shop')}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />

            <WishlistDrawer
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
            />

            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
}
