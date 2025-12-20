'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight, Mail, Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/search/GlobalSearch';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuLinks = [
    {
        label: 'Shop',
        href: '/product',
        submenu: [
            { label: 'All Products', href: '/product' },
            { label: 'Art & Prints', href: '/product?category=art' },
            { label: 'Jewelry', href: '/product?category=jewelry' },
            { label: 'Home & Living', href: '/product?category=home' },
        ],
    },
    { label: 'Artisans', href: '/artisans' },
    { label: 'Create with AI', href: '/ai-vision', isNew: true },
    { label: 'About', href: '/about' },
];

const bottomLinks = [
    { label: 'Help & FAQ', href: '/faq' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Contact', href: '/contact' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { theme, setTheme } = useTheme();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={onClose}
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-md bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] shadow-2xl lg:hidden overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <span className="font-[family-name:var(--font-playfair)] text-xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                                Menu
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hover:bg-[var(--ac-gold)]/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="p-6 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                            <GlobalSearch />
                        </div>

                        {/* Main Navigation */}
                        <nav className="p-6">
                            <ul className="space-y-2">
                                {menuLinks.map((link, index) => (
                                    <motion.li
                                        key={link.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        {link.submenu ? (
                                            <details className="group">
                                                <summary className="flex items-center justify-between py-3 text-lg font-light text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] cursor-pointer list-none">
                                                    {link.label}
                                                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-open:rotate-90" />
                                                </summary>
                                                <ul className="pl-4 mt-2 space-y-2 border-l border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                                                    {link.submenu.map((sublink) => (
                                                        <li key={sublink.label}>
                                                            <Link
                                                                href={sublink.href}
                                                                className="block py-2 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                                                                onClick={onClose}
                                                            >
                                                                {sublink.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="flex items-center justify-between py-3 text-lg font-light text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                                                onClick={onClose}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {link.label}
                                                    {link.isNew && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[var(--ac-gold)] text-white rounded-sm">
                                                            New
                                                        </span>
                                                    )}
                                                </span>
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        )}
                                    </motion.li>
                                ))}
                            </ul>
                        </nav>

                        {/* Divider */}
                        <div className="mx-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]" />

                        {/* Account Links */}
                        <div className="p-6">
                            <div className="flex gap-3">
                                <Link
                                    href="/login"
                                    className="flex-1 py-3 px-6 text-center text-sm font-medium tracking-wide text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] border border-[var(--ac-charcoal)] dark:border-[var(--ac-pearl)] hover:bg-[var(--ac-charcoal)] dark:hover:bg-[var(--ac-pearl)] hover:text-[var(--ac-pearl)] dark:hover:text-[var(--ac-charcoal)] transition-all duration-300"
                                    onClick={onClose}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex-1 py-3 px-6 text-center text-sm font-medium tracking-wide text-[var(--ac-pearl)] dark:text-[var(--ac-charcoal)] bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] hover:bg-[var(--ac-gold)] transition-all duration-300"
                                    onClick={onClose}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="mx-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]" />

                        {/* Theme Toggle */}
                        <div className="p-6">
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center justify-between w-full py-3 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]"
                            >
                                <span className="flex items-center gap-3">
                                    {theme === 'dark' ? (
                                        <Moon className="w-5 h-5" />
                                    ) : (
                                        <Sun className="w-5 h-5" />
                                    )}
                                    <span>Dark Mode</span>
                                </span>
                                <div
                                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${theme === 'dark'
                                            ? 'bg-[var(--ac-gold)]'
                                            : 'bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]'
                                        } relative`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </div>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="mx-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]" />

                        {/* Bottom Links */}
                        <div className="p-6">
                            <ul className="space-y-3">
                                {bottomLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[var(--ac-stone)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                                            onClick={onClose}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                            <a
                                href="mailto:hello@artistrycart.com"
                                className="flex items-center gap-2 text-sm text-[var(--ac-stone)] hover:text-[var(--ac-gold)] transition-colors duration-300"
                            >
                                <Mail className="w-4 h-4" />
                                hello@artistrycart.com
                            </a>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
