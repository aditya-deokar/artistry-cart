'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { Heart, ShoppingCart, User, Menu, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/theme/ModeToggle';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/utils/axiosinstance';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface NavActionsProps {
    onMenuClick?: () => void;
    onCartClick?: () => void;
    onWishlistClick?: () => void;
    onSearchClick?: () => void;
    className?: string;
}

// Magnetic icon button wrapper
function MagneticButton({
    children,
    className = '',
    onClick,
    href,
    ariaLabel,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
    ariaLabel?: string;
}) {
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2;

        gsap.to(buttonRef.current, {
            x,
            y,
            duration: 0.3,
            ease: 'power2.out',
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (!buttonRef.current) return;

        gsap.to(buttonRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
        });
    }, []);

    const content = (
        <div
            ref={buttonRef}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 hover:bg-[var(--ac-gold)]/10 cursor-pointer ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            role="button"
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

export function NavActions({ onMenuClick, onCartClick, onWishlistClick, onSearchClick, className = '' }: NavActionsProps) {
    const { user, isLoading } = useUser();
    const wishlist = useStore((state: any) => state.wishlist);
    const cart = useStore((state: any) => state.cart);
    const clearAll = useStore((state: any) => state.actions.clearAll);
    const { setLoggedIn } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        try {
            await axiosInstance.get('/auth/api/logout-user');
            setLoggedIn(false);
            clearAll();
            queryClient.clear();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setLoggedIn(false);
            clearAll();
            queryClient.clear();
            router.push('/login');
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Search - Opens Overlay */}
            <MagneticButton onClick={onSearchClick} ariaLabel="Search">
                <Search className="w-5 h-5 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] transition-colors duration-300" />
            </MagneticButton>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Wishlist - Opens Drawer */}
            <MagneticButton onClick={onWishlistClick} ariaLabel="Wishlist">
                <Heart className="w-5 h-5 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] transition-colors duration-300" />
                <AnimatePresence>
                    {wishlist?.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ac-gold)] text-[10px] text-white font-bold"
                        >
                            {wishlist.length}
                        </motion.span>
                    )}
                </AnimatePresence>
            </MagneticButton>

            {/* Cart - Opens Drawer */}
            <MagneticButton onClick={onCartClick} ariaLabel="Shopping Cart">
                <ShoppingCart className="w-5 h-5 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] transition-colors duration-300" />
                <AnimatePresence>
                    {cart?.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ac-gold)] text-[10px] text-white font-bold"
                        >
                            {cart.length}
                        </motion.span>
                    )}
                </AnimatePresence>
            </MagneticButton>

            {/* User Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                        <MagneticButton ariaLabel="User menu">
                            <div className="h-8 w-8 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-[var(--ac-gold)]/30 transition-all duration-300 relative">
                                {user?.avatar?.url ? (
                                    <Image
                                        src={user.avatar.url}
                                        alt="User avatar"
                                        fill
                                        className="object-cover"
                                        sizes="32px"
                                    />
                                ) : (
                                    <User className="h-4 w-4 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]" />
                                )}
                            </div>
                        </MagneticButton>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                    {user && !isLoading ? (
                        <>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/profile">
                                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                            </Link>
                            <Link href="/orders">
                                <DropdownMenuItem className="cursor-pointer">Orders</DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                onClick={handleLogout}
                            >
                                Logout
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuLabel>Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/login">
                                <DropdownMenuItem className="cursor-pointer">Login</DropdownMenuItem>
                            </Link>
                            <Link href="/register">
                                <DropdownMenuItem className="cursor-pointer">Register</DropdownMenuItem>
                            </Link>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-1"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </Button>
        </div>
    );
}
