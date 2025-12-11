'use client'

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HeartIcon, ShoppingCart, User2, Menu, X, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';

// UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme/ModeToggle';

// Hooks, Utils, and State
import useUser from '@/hooks/useUser';
import { navItems } from '@/configs/constants';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { TransitionLink } from '@/components/common/TransitionLink';
import { GlobalSearch } from '@/components/search/GlobalSearch';


// Props for GSAP or other styling needs
type HeaderProps = {
    className?: string;
    logoContainerClassName?: string;
    navContainerClassName?: string;
    iconsContainerClassName?: string;
}

// --- Mobile Menu Sub-Component ---
const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-sm bg-background p-6 shadow-2xl md:hidden border-l border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-display text-xl">Menu</span>
                            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
                                <X size={24} />
                            </Button>
                        </div>

                        <div className="mb-8">
                            <GlobalSearch />
                        </div>

                        <nav className="flex flex-col space-y-6">
                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                >
                                    <TransitionLink
                                        href={item.href}
                                        className="text-2xl font-light hover:text-primary transition-colors block"
                                        onClick={onClose}
                                    >
                                        {item.title}
                                    </TransitionLink>
                                </motion.div>
                            ))}
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// --- Animated Nav Link ---
const NavLink = ({ href, title }: { href: string; title: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <TransitionLink
            href={href}
            className="relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="relative z-10">{title}</span>
            {isHovered && (
                <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-0 rounded-full bg-primary/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", duration: 0.3 }}
                />
            )}
        </TransitionLink>
    );
};


// --- Main Header Component ---
const Header = ({ className, logoContainerClassName, navContainerClassName, iconsContainerClassName }: HeaderProps) => {
    const { user, isLoading } = useUser();
    const wishlist = useStore((state: any) => state.wishlist);
    const cart = useStore((state: any) => state.cart);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setLoggedIn } = useAuthStore();

    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }

        if (latest > 50) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    });

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/logout-user`, {}, { withCredentials: true });
            setLoggedIn(false);
            queryClient.clear();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setLoggedIn(false);
            queryClient.clear();
            router.push('/login');
        }
    };

    return (
        <>
            <motion.header
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={cn(
                    "fixed top-0 inset-x-0 z-50 w-full transition-all duration-300",
                    scrolled
                        ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-3 shadow-sm"
                        : "bg-transparent py-6",
                    className
                )}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">

                        {/* --- Logo --- */}
                        <div className={cn("flex-shrink-0 relative z-50", logoContainerClassName)}>
                            <TransitionLink href={'/'} className="group flex items-center gap-2">
                                <span className="font-display text-2xl font-bold tracking-tighter">
                                    Artistry
                                    <span className="text-primary italic font-serif">Cart</span>
                                </span>
                            </TransitionLink>
                        </div>

                        {/* --- Desktop Navigation --- */}
                        <div className={cn("hidden md:flex flex-1 items-center justify-center px-8", navContainerClassName)}>
                            <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-2 py-1 shadow-sm">
                                {navItems.map((item: any) => (
                                    <NavLink key={item.title} href={item.href} title={item.title} />
                                ))}
                            </nav>
                        </div>

                        {/* --- Icons & Actions --- */}
                        <div className={cn("flex items-center justify-end gap-3", iconsContainerClassName)}>
                            {/* Desktop Search Trigger (Expandable or Modal) - Keeps layout clean */}
                            <div className="hidden md:block w-64 mr-2">
                                <GlobalSearch />
                            </div>

                            <ModeToggle />

                            {/* Wishlist */}
                            <Button asChild variant="ghost" size="icon" className='relative hover:bg-primary/10 transition-colors'>
                                <TransitionLink href={"/wishlist"}>
                                    <HeartIcon className="h-5 w-5" />
                                    <AnimatePresence>
                                        {wishlist?.length > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                className='absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold'
                                            >
                                                {wishlist.length}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </TransitionLink>
                            </Button>

                            {/* Cart */}
                            <Button asChild variant="ghost" size="icon" className='relative hover:bg-primary/10 transition-colors'>
                                <TransitionLink href={"/cart"}>
                                    <ShoppingCart className="h-5 w-5" />
                                    <AnimatePresence>
                                        {cart?.length > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                className='absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold'
                                            >
                                                {cart.length}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </TransitionLink>
                            </Button>

                            {/* User Profile */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="group">
                                        <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors overflow-hidden border border-transparent group-hover:border-primary/20">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
                                            ) : (
                                                <User2 className="h-5 w-5" />
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2">
                                    {user && !isLoading ? (
                                        <>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <TransitionLink href="/profile">
                                                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                                            </TransitionLink>
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
                                            <TransitionLink href="/login">
                                                <DropdownMenuItem className="cursor-pointer">Login</DropdownMenuItem>
                                            </TransitionLink>
                                            <TransitionLink href="/register">
                                                <DropdownMenuItem className="cursor-pointer">Register</DropdownMenuItem>
                                            </TransitionLink>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Trigger */}
                            <div className="md:hidden ml-2">
                                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
};

export default Header;

