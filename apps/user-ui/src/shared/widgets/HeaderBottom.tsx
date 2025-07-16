'use client'

import { navItems } from "@/configs/constants";
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart, User2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
      const handleScroll= ()=>{
        if(window.scrollY > 100){
            setIsSticky(true);
        }else{
            setIsSticky(false);
        }
      }

      window.addEventListener("scroll", handleScroll);

      return ()=> window.removeEventListener("scroll", handleScroll);
    }, []);


    
  return (
    <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 shadow-lg": "relative"}`}>
        <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>

            {/* All DropDowns */}
            <div className={`w-[260px] ${isSticky && "-mb-2"} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-secondary`}
            onClick={()=> setShow(!show)}
            >
                <div className="flex flex-center gap-2">
                    <AlignLeft />
                    <span>All Department</span>
                </div>

                <ChevronDown />
            </div>

            {/* Dropdown menu */}
            {show && (
                <div className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px] "} w-[260px] h-[400px] bg-accent`}></div>
            )}

            {/* Navigation Links */}
            <div className="flex items-center">
                {navItems.map((item:NavItemsTypes, index:number)=>(
                    <Link className="px-5 font-medium text-lg"
                    href={item.href}
                    key={index}
                    >
                        {item.title}
                    </Link>
                ))}
            </div>

            <div className="">
                {isSticky && (

                    <div className='flex items-center gap-8 pb-2'>
                    <div className='flex items-center gap-2'>
                        <Link href={"/login"}>
                            <User2 />
                        </Link>

                        <Link href={"login"}>
                            <span className='block font-medium'>
                                Hello,
                            </span>
                            <span className='font-semibold'>Sign In</span>
                        </Link>
                    </div>

                    <div className='flex items-center gap-5 '>
                        <Link href={"/wishlist"} className='relative'>
                            <HeartIcon className='w-6 h-6' />
                            <div className='w-6 h-6 bg-red-400 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                <span className='text-sm'>0</span>
                            </div>
                        </Link>

                         <Link href={"/cart"} className='relative'>
                            <ShoppingCart className='w-6 h-6' />
                            <div className='w-6 h-6 bg-red-400 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                <span className='text-sm'>1</span>
                            </div>
                        </Link>
                    </div>
                </div>

                )}
            </div>
        </div>
    </div>
  )
}

export default HeaderBottom