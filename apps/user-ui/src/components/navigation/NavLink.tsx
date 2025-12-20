'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

interface NavLinkProps {
    href: string;
    label: string;
    isNew?: boolean;
    badge?: string;
    hasDropdown?: boolean;
    onHover?: (isHovered: boolean) => void;
    className?: string;
}

export function NavLink({
    href,
    label,
    isNew = false,
    badge,
    hasDropdown = false,
    onHover,
    className = '',
}: NavLinkProps) {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const underlineRef = useRef<HTMLSpanElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        onHover?.(true);

        // Animate underline expansion
        if (underlineRef.current) {
            gsap.to(underlineRef.current, {
                width: '100%',
                duration: 0.3,
                ease: 'power2.out',
            });
        }

        // Subtle lift effect on text
        if (linkRef.current) {
            const chars = linkRef.current.querySelectorAll('.char');
            gsap.to(chars, {
                y: -2,
                duration: 0.2,
                stagger: 0.02,
                ease: 'power2.out',
            });
        }
    }, [onHover]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        onHover?.(false);

        // Animate underline collapse
        if (underlineRef.current) {
            gsap.to(underlineRef.current, {
                width: '0%',
                duration: 0.2,
                ease: 'power2.in',
            });
        }

        // Reset text position
        if (linkRef.current) {
            const chars = linkRef.current.querySelectorAll('.char');
            gsap.to(chars, {
                y: 0,
                duration: 0.2,
                stagger: 0.01,
                ease: 'power2.out',
            });
        }
    }, [onHover]);

    return (
        <Link
            ref={linkRef}
            href={href}
            className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 ${isHovered
                    ? 'text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]'
                    : 'text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]'
                } ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Text with character spans for animation */}
            <span className="relative z-10 flex items-center gap-1.5">
                {label.split('').map((char, i) => (
                    <span
                        key={i}
                        className="char inline-block"
                        style={{ transitionDelay: `${i * 10}ms` }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}

                {/* Dropdown arrow */}
                {hasDropdown && (
                    <svg
                        className={`w-3 h-3 transition-transform duration-300 ${isHovered ? 'rotate-180' : 'rotate-0'
                            }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                )}

                {/* New badge */}
                {isNew && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[var(--ac-gold)] text-white rounded-sm">
                        New
                    </span>
                )}

                {/* Custom badge */}
                {badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-[var(--ac-gold-dark)] border border-[var(--ac-gold)]/30 rounded-sm">
                        {badge}
                    </span>
                )}
            </span>

            {/* Animated underline */}
            <span
                ref={underlineRef}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px w-0 bg-[var(--ac-gold)]"
                aria-hidden="true"
            />
        </Link>
    );
}
