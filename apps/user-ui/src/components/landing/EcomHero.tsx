'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const carouselData = [
    {
        id: 1,
        title: "LOVELY ART FOR A CANVAS",
        subtitle: "Discover Masterpieces",
        image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000",
        logo1: "ARTISTRY",
        logo2: "MUSEUM",
        ctaText: "BUY NOW",
        ctaLink: "/product"
    },
    {
        id: 2,
        title: "SCULPTED TO PERFECTION",
        subtitle: "Modern Form & Space",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2000",
        logo1: "CRAFT",
        logo2: "EXHIBIT",
        ctaText: "EXPLORE",
        ctaLink: "/product"
    },
    {
        id: 3,
        title: "DIGITAL DREAMS AWAKE",
        subtitle: "The Future of Art",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000",
        logo1: "PIXEL",
        logo2: "GALLERY",
        ctaText: "VIEW COLLECTION",
        ctaLink: "/product"
    }
];

const categories = [
    { name: "Paintings", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Sculpture", image: "https://images.unsplash.com/photo-1618220179428-22790b46a014?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Digital", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Photography", image: "https://images.unsplash.com/photo-1554034483-04fda0d33059?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Ceramics", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Textiles", image: "https://images.unsplash.com/photo-1584988018260-0d306b38c2c8?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Abstract", image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Surrealism", image: "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?auto=format&fit=crop&q=80&w=300&h=300" },
];

export function EcomHero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % carouselData.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);
    };

    useEffect(() => {
        const timer = setInterval(handleNext, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-[#111111] text-white pt-[115px] lg:pt-[130px]">
            {/* Carousel Container */}
            <div className="relative h-[60vh] min-h-[500px] w-full bg-[#111]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={carouselData[currentIndex].image}
                                alt={carouselData[currentIndex].title}
                                fill
                                className="object-cover opacity-40 mix-blend-overlay"
                                priority
                            />
                            {/* Gradient Overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-center justify-between px-8 md:px-24">
                    {/* Left/Center Text */}
                    <div className="flex-1 flex flex-col justify-center max-w-2xl mt-20 md:mt-0">
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={`title-${currentIndex}`}
                                initial={{ opacity: 0, y: 20, rotate: -2 }}
                                animate={{ opacity: 1, y: 0, rotate: -5 }}
                                exit={{ opacity: 0, y: -20, rotate: -2 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white"
                                style={{ transformOrigin: "center left" }}
                            >
                                {carouselData[currentIndex].title}
                            </motion.h1>
                        </AnimatePresence>
                    </div>

                    {/* Right Side Info & CTA */}
                    <div className="flex flex-col items-center justify-center space-y-8 pb-12 md:pb-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`cta-${currentIndex}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <Link
                                    href={carouselData[currentIndex].ctaLink}
                                    className="px-10 py-4 bg-[#FFC107] hover:bg-[#FFD54F] text-black font-black text-3xl tracking-widest uppercase rounded-md transition-colors shadow-[0_0_20px_rgba(255,193,7,0.3)]"
                                >
                                    {carouselData[currentIndex].ctaText}
                                </Link>

                                {/* Mock Logos beneath CTA */}
                                <div className="flex items-center space-x-6 mt-8">
                                    <div className="flex flex-col items-center border-r border-white/20 pr-6">
                                        <span className="text-2xl font-serif text-[#F3E5AB] italic mb-1">{carouselData[currentIndex].logo1}</span>
                                    </div>
                                    <div className="flex flex-col items-center pl-2">
                                        <span className="text-xl font-bold tracking-widest text-white uppercase">{carouselData[currentIndex].logo2}</span>
                                        <span className="text-[10px] text-gray-400 mt-1 uppercase">Official Partner</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                    {carouselData.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white w-4" : "bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Category Circles Section */}
            <div className="w-full bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] py-10 px-4 md:px-12 border-t border-[var(--ac-linen)] dark:border-white/5">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex justify-start md:justify-center overflow-x-auto pb-4 gap-6 md:gap-10 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {/* More Button */}
                        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--ac-cream)] dark:bg-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 mb-3 shadow-sm border border-[var(--ac-linen)] dark:border-white/10">
                                <span className="text-gray-400 dark:text-gray-500 font-bold text-xl tracking-widest">...</span>
                            </div>
                        </div>

                        {categories.map((cat, idx) => (
                            <Link key={idx} href="/product" className="flex flex-col items-center flex-shrink-0 group">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative mb-3 transition-transform duration-300 group-hover:scale-105 shadow-sm border border-[var(--ac-linen)] dark:border-white/10 bg-[var(--ac-cream)] dark:bg-white/5 flex items-center justify-center text-[10px] text-center text-gray-500">
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/10 dark:bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {/* Inline styles for hiding scrollbar in categories */}
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
