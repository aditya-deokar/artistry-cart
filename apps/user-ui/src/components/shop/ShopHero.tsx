'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export const ShopHero = () => {
  return (
    <section className="relative h-[30vh]  w-full flex items-center justify-center text-center text-white overflow-hidden">
      {/* Background Image - an abstract, artistic texture */}
      <Image
        src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop"
        alt="Artistic background texture"
        fill
        className="object-cover z-0"
        priority
      />
      {/* Darkening Overlay for text readability */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Animated Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 px-4"
      >
        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight"
          style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}
        >
          Discover. Create. Inspire.
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-neutral-200"
        >
          Explore a curated world of unique artworks from independent artists and creators around the globe.
        </motion.p>
        
      </motion.div>
    </section>
  );
};