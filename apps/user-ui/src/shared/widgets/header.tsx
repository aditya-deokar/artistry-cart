'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HeartIcon, ShoppingCart, User2, Menu, X } from 'lucide-react';

// UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from '@/components/theme/ModeToggle';

// Hooks, Utils, and State
import useUser from '@/hooks/useUser';
import { navItems } from '@/configs/constants';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
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
        <div
            className={cn(
                "fixed inset-0 z-40 transition-opacity duration-300 ease-in-out md:hidden bg-red-50",
                isOpen ? "opacity-100 bg-background" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-6 shadow-xl transition-transform duration-300 ease-in-out ",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
            >
                <div className="flex justify-end mb-8">
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
                        <X size={24} />
                    </Button>
                </div>

                <div className="mb-8">
                    <GlobalSearch />
                </div>

                <nav className="flex flex-col space-y-4 bg-background pl-6 pb-6">
                    {navItems.map((item) => (
                        <TransitionLink
                            href={item.href}
                            key={item.title}
                            className="text-xl font-medium text-primary/80 hover:text-primary"
                            onClick={onClose} // Close menu on navigation
                        >
                            {item.title}
                        </TransitionLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};


// --- Main Header Component ---
const Header = ({ className, logoContainerClassName, navContainerClassName, iconsContainerClassName }: HeaderProps) => {
    const { user, isLoading } = useUser();
    const wishlist = useStore((state: any) => state.wishlist);
    const cart = useStore((state: any) => state.cart);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close the mobile menu automatically on route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <header className={cn("w-full  sticky top-0 z-50 bg-background/80 backdrop-blur-2xl", className)}>
            <div className="border-b border-neutral-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between gap-4">

                        {/* --- Logo --- */}
                        <div className={cn("flex-shrink-0", logoContainerClassName)}>
                            <TransitionLink href={'/'} className="text-2xl font-extrabold tracking-tight">
                                Artistry Cart
                            </TransitionLink>
                        </div>

                        {/* --- Desktop Search & Navigation --- */}
                        <div className={cn("hidden md:flex flex-grow items-center justify-center gap-6", navContainerClassName)}>
                            <nav className="flex items-center gap-2">
                                {navItems.map((item: any) => (
                                    <TransitionLink
                                        href={item.href}
                                        key={item.title}
                                        className='font-medium text-primary/80 hover:text-primary text-base px-3 py-2'
                                    >
                                        {item.title}
                                    </TransitionLink>
                                ))}
                            </nav>
                            <div className="w-full max-w-md">
                                <GlobalSearch />
                            </div>
                        </div>

                        {/* --- Icons & Mobile Menu Trigger --- */}
                        <div className={cn("flex items-center justify-end gap-2", iconsContainerClassName)}>
                            <ModeToggle />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><User2 /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {user && !isLoading ? (
                                        <>
                                            <DropdownMenuLabel>Hi, {user?.name?.split(" ")[0]}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <TransitionLink href="/profile"><DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem></TransitionLink>
                                            <DropdownMenuItem className="cursor-pointer">Logout</DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuLabel>Hello, Sign in</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <TransitionLink href="/login"><DropdownMenuItem className="cursor-pointer">Login</DropdownMenuItem></TransitionLink>
                                            <TransitionLink href="/register"><DropdownMenuItem className="cursor-pointer">Register</DropdownMenuItem></TransitionLink>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button asChild variant="ghost" size="icon" className='relative'>
                                <TransitionLink href={"/wishlist"}>
                                    <HeartIcon />
                                    {wishlist?.length > 0 && <Badge  className='absolute -top-1 -right-1 h-5 w-5 justify-center p-0 bg-secondary'>{wishlist.length}</Badge>}
                                </TransitionLink>
                            </Button>

                            <Button asChild variant="ghost" size="icon" className='relative'>
                                <TransitionLink href={"/cart"}>
                                    <ShoppingCart />
                                    {cart?.length > 0 && <Badge  className='absolute -top-1 -right-1 h-5 w-5 justify-center p-0 bg-secondary'>{cart.length}</Badge>}
                                </TransitionLink>
                            </Button>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden ">
                                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                                    <Menu size={24} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Mobile Menu Component Instance --- */}
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    );
};

export default Header;