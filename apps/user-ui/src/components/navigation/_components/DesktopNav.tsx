'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface NavLinkData {
    label: string;
    href: string;
    hasDropdown?: boolean;
    isNew?: boolean;
    badge?: string;
}

const defaultLinks: NavLinkData[] = [
    { label: 'Shop', href: '/product', hasDropdown: true },
    { label: 'Artisans', href: '/artisans' },
    { label: 'Create', href: '/ai-vision', badge: 'AI' },
    { label: 'About', href: '/about' },
];

interface DesktopNavProps {
    activeItem: string | null;
    onNavHover: (item: string | null) => void;
}

// Individual Nav Item with artistic underline animation
function NavItem({
    link,
    isActive,
    onHover
}: {
    link: NavLinkData;
    isActive: boolean;
    onHover: () => void;
}) {
    const itemRef = useRef<HTMLAnchorElement>(null);
    const lineRef = useRef<HTMLSpanElement>(null);

    useGSAP(() => {
        if (!lineRef.current) return;

        if (isActive) {
            gsap.to(lineRef.current, {
                scaleX: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
            });
        } else {
            gsap.to(lineRef.current, {
                scaleX: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
            });
        }
    }, { dependencies: [isActive], scope: itemRef });

    return (
        <Link
            ref={itemRef}
            href={link.href}
            className="group relative px-5 py-2"
            onMouseEnter={onHover}
        >
            {/* Label */}
            <span className={`relative z-10 text-sm font-medium tracking-wide transition-colors duration-300 ${isActive
                    ? 'text-[var(--ac-gold-dark)] dark:text-[var(--ac-gold)]'
                    : 'text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold-dark)] dark:group-hover:text-[var(--ac-gold)]'
                }`}>
                {link.label}
            </span>

            {/* Dropdown indicator */}
            {link.hasDropdown && (
                <svg
                    className={`inline-block ml-1.5 w-3 h-3 transition-all duration-300 ${isActive
                            ? 'rotate-180 text-[var(--ac-gold)]'
                            : 'text-[var(--ac-stone)] group-hover:text-[var(--ac-gold)]'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            )}

            {/* Badge */}
            {link.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase border border-[var(--ac-gold)]/40 text-[var(--ac-gold-dark)] rounded-sm">
                    {link.badge}
                </span>
            )}

            {/* Artistic underline - elegant brush stroke effect */}
            <span
                ref={lineRef}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[2px] origin-center"
                style={{
                    transform: 'scaleX(0) translateX(-50%)',
                    opacity: 0,
                    background: 'linear-gradient(90deg, transparent 0%, var(--ac-gold) 15%, var(--ac-gold) 85%, transparent 100%)',
                }}
            />
        </Link>
    );
}

export function DesktopNav({ activeItem, onNavHover }: DesktopNavProps) {
    return (
        <nav
            className="relative hidden lg:flex items-center gap-1"
            onMouseLeave={() => onNavHover(null)}
        >
            {/* Decorative dots - artistic touch */}
            <span className="w-1 h-1 rounded-full bg-[var(--ac-gold)]/30 mr-2" />

            {defaultLinks.map((link) => (
                <NavItem
                    key={link.label}
                    link={link}
                    isActive={activeItem === link.label}
                    onHover={() => onNavHover(link.label)}
                />
            ))}

            {/* Decorative dots - artistic touch */}
            <span className="w-1 h-1 rounded-full bg-[var(--ac-gold)]/30 ml-2" />
        </nav>
    );
}
