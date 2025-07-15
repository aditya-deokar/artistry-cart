
import { HeartIcon, Search, ShoppingCart, User2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Header = () => {
    return (
        <div className='w-full bg-background'>
            <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
                <div>
                    <Link href={'?'}>
                        <span className='text-2xl font-extrabold'>Artistry Cart</span>
                    </Link>
                </div>

                <div className='w-1/2 relative'>
                    <input type='text' placeholder='Search for Products...'
                        className='w-full px-4 font-poppins font-medium border-[2.5px] border-border outline-none h-[50px]' />

                    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[50px] bg-border absolute top-0 right-0'>
                        <Search className='' />
                    </div>


                </div>

                <div className='flex items-center gap-8 '>
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
            </div>

            <div className='border-b'></div>
        </div>
    )
}

export default Header