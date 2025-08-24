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

import { TransitionLink } from '@/components/common/TransitionLink'
import { useStore } from '@/store'
import { GlobalSearch } from '@/components/search/GlobalSearch'

// Props to accept classNames for GSAP targeting
type HeaderProps = {
    topHeaderClassName?: string;
    navClassName?: string;
    className?: string;
}

const Header = ({ topHeaderClassName, navClassName ,className}: HeaderProps) => {
    const [isSticky, setIsSticky] = useState(false);
    


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
            <TopHeader topHeaderClassName={topHeaderClassName}/>

            <div className='border-b' />

          
            <nav className={cn(
                "w-full relative"
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
                            <TransitionLink
                                href={item.href}
                                key={item.title}
                                className={cn('font-medium text-primary/80 hover:text-primary/90 text-lg px-4 py-2 ', navClassName)}
                            >
                                {item.title}
                            </TransitionLink>
                        ))}
                    </div>

                     <div className={navClassName}></div>
                </div>
            </nav>
        </header>
    )
}

export default Header;




export const TopHeader = ({topHeaderClassName}:{ topHeaderClassName: string }) => {

    const { user, isLoading } = useUser();

    const wishlist = useStore((state:any) => state.wishlist);
    const cart = useStore((state:any) => state.cart);
  return (
    <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
                <div className={cn('flex items-center gap-8', topHeaderClassName)}>
                    <TransitionLink href={'/'}>
                        <span className='text-2xl font-extrabold'>Artistry Cart</span>
                    </TransitionLink>
                </div>

                <div className={cn('w-1/2 relative', topHeaderClassName)}>
                    {/* <input type='text' placeholder='Search for Products...'
                        className='w-full px-4 font-poppins font-medium border-[2.5px] border-border outline-none h-[50px]' />
                    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[50px] bg-border absolute top-0 right-0'>
                        <Search />
                    </div> */}
                    <GlobalSearch />
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
                            <Badge variant="destructive" className='absolute top-[-5px] right-[-5px] px-1.5'>
                                {wishlist?.length}
                            </Badge>
                        </TransitionLink>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className='relative'>
                        <TransitionLink href={"/cart"}>
                            <ShoppingCart />
                            <Badge variant="destructive" className='absolute top-[-5px] right-[-5px] px-1.5'>
                                {cart?.length}
                            </Badge>
                        </TransitionLink>
                    </Button>
                </div>
            </div>
  )
}

