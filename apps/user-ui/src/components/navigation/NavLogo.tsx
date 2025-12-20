'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

interface NavLogoProps {
    className?: string;
    scrolled?: boolean;
}

export function NavLogo({ className = '', scrolled = false }: NavLogoProps) {
    const logoRef = useRef<HTMLAnchorElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (logoRef.current) {
            gsap.to(logoRef.current.querySelector('.logo-accent'), {
                textShadow: '0 0 20px rgba(184, 134, 11, 0.5)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (logoRef.current) {
            gsap.to(logoRef.current.querySelector('.logo-accent'), {
                textShadow: 'none',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
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
                <span className="logo-accent text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] italic transition-all duration-300">
                    Cart
                </span>
            </span>
        </Link>
    );
}
