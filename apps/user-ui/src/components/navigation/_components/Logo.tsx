'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP with React
gsap.registerPlugin(useGSAP);

interface LogoProps {
    className?: string;
    scrolled?: boolean;
}

export function Logo({ className = '', scrolled = false }: LogoProps) {
    const logoRef = useRef<HTMLAnchorElement>(null);
    const accentRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Use useGSAP for hover animation - reacts to isHovered state changes
    useGSAP(() => {
        if (!accentRef.current) return;

        if (isHovered) {
            gsap.to(accentRef.current, {
                textShadow: '0 0 20px rgba(184, 134, 11, 0.5)',
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        } else {
            gsap.to(accentRef.current, {
                textShadow: 'none',
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        }
    }, {
        dependencies: [isHovered],
        scope: logoRef
    });

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <Link
            ref={logoRef}
            href="/"
            className={`group flex items-center gap-1 transition-transform duration-300 ${scrolled ? 'scale-90' : 'scale-100'
                } ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span
                className={`font-[family-name:var(--font-playfair)] tracking-tight transition-all duration-300 ${scrolled ? 'text-xl' : 'text-2xl'
                    } text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]`}
            >
                Artistry
                <span ref={accentRef} className="logo-accent text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] italic transition-all duration-300">
                    Cart
                </span>
            </span>
        </Link>
    );
}
