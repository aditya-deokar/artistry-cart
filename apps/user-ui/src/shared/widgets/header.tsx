'use client'

import {
    AlignLeft,
    ChevronDown,
    HeartIcon,
    Search,
    ShoppingCart,
    User2
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import useUser from '@/hooks/useUser'
import { ModeToggle } from '@/components/theme/ModeToggle'
import { navItems } from '@/configs/constants'
import { cn } from '@/lib/utils'

// Props to accept classNames for GSAP targeting
type HeaderProps = {
    topHeaderClassName?: string;
    navClassName?: string;
    className?: string;
}

const Header = ({ topHeaderClassName, navClassName ,className}: HeaderProps) => {
    const [isSticky, setIsSticky] = useState(false);
    const { user, isLoading } = useUser();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 120) setIsSticky(true);
            else setIsSticky(false);
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`w-full  z-50 ${className}`}>
            {/* ======== TOP HEADER (NON-STICKY) ======== */}
            <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
                <div className={cn('flex items-center gap-8', topHeaderClassName)}>
                    <Link href={'/'}>
                        <span className='text-2xl font-extrabold'>Artistry Cart</span>
                    </Link>
                </div>

                <div className={cn('w-1/2 relative', topHeaderClassName)}>
                    <input type='text' placeholder='Search for Products...'
                        className='w-full px-4 font-poppins font-medium border-[2.5px] border-border outline-none h-[50px]' />
                    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[50px] bg-border absolute top-0 right-0'>
                        <Search />
                    </div>
                </div>

                <div className={cn('flex items-center gap-5', topHeaderClassName)}>
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
                                    <Link href="/profile"><DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem></Link>
                                    <DropdownMenuItem className="cursor-pointer">Logout</DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuLabel>Hello, Sign in</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Link href="/login"><DropdownMenuItem className="cursor-pointer">Login</DropdownMenuItem></Link>
                                    <Link href="/register"><DropdownMenuItem className="cursor-pointer">Register</DropdownMenuItem></Link>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button asChild variant="ghost" size="icon" className='relative'>
                        <Link href={"/wishlist"}>
                            <HeartIcon />
                            <Badge variant="destructive" className='absolute top-[-5px] right-[-5px] px-1.5'>0</Badge>
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className='relative'>
                        <Link href={"/cart"}>
                            <ShoppingCart />
                            <Badge variant="destructive" className='absolute top-[-5px] right-[-5px] px-1.5'>1</Badge>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='border-b' />

            {/* ======== BOTTOM NAVIGATION (STICKY ON SCROLL) ======== */}
            <nav className={cn(
                "w-full ",
                isSticky ? "fixed top-0 left-0 z-[999] " : "relative"
            )}>
                <div className="w-[80%] m-auto flex items-center justify-between h-[60px]">
                    <div className={navClassName}>
                        {/* <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                               <Button variant="secondary" className="h-[50px]">
                                   <AlignLeft className="mr-2 h-5 w-5" />
                                   <span className='pr-2'>All Departments</span>
                                   <ChevronDown className="h-5 w-5" />
                               </Button>
                           </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[260px]">
                            <DropdownMenuLabel>Browse Categories</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Electronics</DropdownMenuItem>
                            <DropdownMenuItem>Fashion</DropdownMenuItem>
                            <DropdownMenuItem>Home & Kitchen</DropdownMenuItem>
                            <DropdownMenuItem>Books</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu> */}
                    </div>

                    <div className='flex items-center gap-2'>
                        {navItems.map((item: any) => (
                            <Link
                                href={item.href}
                                key={item.title}
                                className={cn('font-medium text-lg px-4 py-2 ', navClassName)}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>

                     <div className={navClassName}></div>
                </div>
            </nav>
        </header>
    )
}

export default Header;