"use client"
import Image from 'next/image';
import { FC, useState, useEffect } from 'react';
import { Bounded } from '../common/Bounded';
import { FadeIn } from '../animations/FadeIn';
import { RevealText } from '../animations/RevealText';
import { ButtonLink } from '../common/ButtonLink';
import { AnimatePresence, motion } from 'framer-motion';

type HeroProps = {
  heading: string;
  body: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
};

// Array of images for the swiper
const HERO_IMAGES = [
  'https://plus.unsplash.com/premium_photo-1753982324901-aecaf58fa83c?q=80&w=1171&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513519267161-0d3ab5e55416?q=80&w=2070&auto=format&fit=crop', // Example wooden craft
  'https://images.unsplash.com/photo-1582136034080-b74c5d57d760?q=80&w=2070&auto=format&fit=crop', // Example pottery/craft
];

export const Hero: FC<HeroProps> = ({ heading, body, buttonText, buttonLink, imageUrl }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Auto-swipe every 5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Bounded className="relative h-svh overflow-hidden flex items-center">

      {/* Background Image Swiper */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode='popLayout'>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[currentImageIndex]}
              alt="Hero background"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for readability */}
      </div>

      <div className="relative z-20 flex flex-col justify-center px-4 md:px-0">
        <RevealText
          text={heading}
          as="h1"
          className="font-display max-w-4xl text-6xl leading-[0.9] text-white md:text-7xl lg:text-8xl drop-shadow-lg"
          staggerAmount={0.1}
          duration={1.5}
        />
        <FadeIn className="mt-8 max-w-lg text-lg md:text-xl text-white/90 drop-shadow-md leading-relaxed" vars={{ delay: 0.8, duration: 1 }}>
          <p>{body}</p>
        </FadeIn>
        <FadeIn className="mt-10" vars={{ delay: 1.2, duration: 1 }}>
          <ButtonLink href={buttonLink} variant="Secondary" className="w-fit backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/40 text-white">
            {buttonText}
          </ButtonLink>
        </FadeIn>
      </div>

      {/* Optional: Swiper Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImageIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </Bounded>
  );
};
