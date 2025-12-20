'use client';

import { NavLink } from './NavLink';

interface Link {
    label: string;
    href: string;
    hasDropdown?: boolean;
    isNew?: boolean;
    badge?: string;
}

interface NavLinksProps {
    links?: Link[];
    onShopHover?: (isHovered: boolean) => void;
    className?: string;
}

const defaultLinks: Link[] = [
    { label: 'Shop', href: '/product', hasDropdown: true },
    { label: 'Artisans', href: '/artisans' },
    { label: 'Create', href: '/ai-vision', badge: 'AI' },
    { label: 'About', href: '/about' },
];

export function NavLinks({
    links = defaultLinks,
    onShopHover,
    className = '',
}: NavLinksProps) {
    return (
        <nav
            className={`hidden lg:flex items-center gap-1 rounded-full bg-[var(--ac-cream)]/60 dark:bg-[var(--ac-onyx)]/60 backdrop-blur-md px-3 py-1.5 ${className}`}
        >
            {links.map((link) => (
                <NavLink
                    key={link.label}
                    href={link.href}
                    label={link.label}
                    hasDropdown={link.hasDropdown}
                    isNew={link.isNew}
                    badge={link.badge}
                    onHover={link.label === 'Shop' ? onShopHover : undefined}
                />
            ))}
        </nav>
    );
}
